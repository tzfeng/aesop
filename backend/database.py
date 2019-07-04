class Database:
    def __init__(self):
        # keeps track of users and bets in maps, also creates keys for each bet in chronological order
        self._users = {}
        self._bets = {}
        self._bet_key = 0

    # returns map of users
    def users(self):
        return self._users

    # returns map of bets
    def bets(self):
        return self._bets

    # returns new bet key
    def make_bet_key(self):
        self._bet_key += 1
        return self._bet_key

    # returns total number of users
    def user_count(self):
        return len(self._users.values())

    # returns total number of bets
    def bet_count(self):
        return len(self._bets.values())
