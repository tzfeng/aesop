from datetime import datetime, timezone
from threading import Timer
from time import sleep

from .database import Database
from .scraper import *
from .user import User


class Bet:
    def __init__(self, creator: User, data: Database, stock_ticker: str = '', sign: int = 0, margin: float = 0.0,
                 amount_staked: float = 0.0, day: int = 0, month: int = 0, year: int = 0):
        # initializing our own ADTs
        self._creator = creator
        self._key = data.make_bet_key()
        data.bets()[self._key] = self

        # initializing our arguments
        self._stock_ticker = stock_ticker
        self._sign = sign
        self._margin = margin
        self._amount_staked = amount_staked

        # initializing initial and target stock price with some data reader stuff, edit initial price
        self._initial_price = self.get_current_price()
        self._target_price = self._initial_price * (1 + self._sign * self._margin)

        # creating necessary data structures
        self._for_map = {creator.get_address(): amount_staked}
        self._against_map = {}
        self._for_count = 1
        self._against_count = 0
        self._for_rep = creator.get_rep()
        self._against_rep = 0.0
        self._for_staked = amount_staked
        self._against_staked = 0.0

        # timing the bet
        current_time = datetime.utcnow()
        tz = timezone.utc
        set_time = datetime(year, month, day, 20, 0, 1, 0, tz)
        timedelta = set_time - current_time
        self._total_seconds = timedelta.total_seconds()

        # starting the timer for the voting duration once the bet is initialized
        voting_period = self.voting_period()
        timer = Timer(voting_period, self.timed_payout)
        timer.start()

    # returns the ontology address of the creator of the bet
    def creator_address(self):
        return self._creator.get_address()

    # returns the ticker of the stock
    def stock_ticker(self):
        return self._stock_ticker

    # returns the amount by which the creator expects the stock to change
    def expected_change(self):
        return self._sign * self._margin

    # returns the amount the creator initially stakes
    def amount_staked(self):
        return self._amount_staked

    # returns the total number of seconds voters have before the voting period closes
    def voting_period(self):
        return self._total_seconds / 2

    # returns the total number of seconds voters must wait before the observation period ends
    def observation_period(self):
        return self._total_seconds / 2

    # display initial and target stock price as well
    # returns all the relevant information we want to display on the bet interface
    def display(self):
        for_avg_rep = self._for_rep / self._for_count
        against_avg_rep = self._against_rep / self._against_count

        prob = self._for_staked / (self._for_staked + self._against_staked)

        return (self._initial_price, self._target_price, self._sign * self._margin, self._for_rep, self._against_rep,
                for_avg_rep, against_avg_rep, self._for_staked, self._against_staked, prob)

    # votes on a side of the bet and immediately updates relevant data structures
    def vote(self, voter: User, amount_staked: float, yes_no: bool):
        if yes_no:
            self._for_map[voter.get_address()] = amount_staked
            self._for_staked += amount_staked
            self._for_count += 1
            self._for_rep += voter.get_rep()
        else:
            self._against_map[voter.get_address()] = amount_staked
            self._against_staked += amount_staked
            self._against_count += 1
            self._against_rep += voter.get_rep()

    # uses imported data reader class to get current price
    def get_current_price(self):
        return parse(self._stock_ticker)

    # check result function that compares target and current stock price
    def check_price(self, current_price: float):
        # case where user bets that stock will rise
        if self._sign > 0:
            if current_price >= self._target_price:
                return True
            else:
                return False
        # case where user bets that stock will fall
        if self._sign < 0:
            if current_price <= self._target_price:
                return True
            else:
                return False
        else:
            raise Exception('Stock was not predicted to make any movement')

    # generically updates winner and loser rep/bank accounts after the observation period has ended
    @staticmethod
    def _distribute(winners: map, losers: map, win_stake: float, lose_stake: float):
        for user in winners:
            user.update_rep(lose_stake * winners[user] / win_stake)
            user.update_bank(lose_stake * winners[user] / win_stake)

        for user in losers:
            user.update_rep(-1 * losers[user])
            user.update_bank(-1 * losers[user])

    # conditionally updates winner/loser rep/bank accounts based on the result of the bet
    def payout(self, current_price: float):
        if self.check_price(current_price):
            self._distribute(self._for_map, self._against_map, self._for_staked, self._against_staked)
        else:
            self._distribute(self._against_map, self._for_map, self._against_staked, self._for_staked)

    # executes a timed payout after the voting period ends
    def timed_payout(self):
        sleep_time = self.observation_period()
        sleep(sleep_time)
        self.payout(parse(self._stock_ticker))
