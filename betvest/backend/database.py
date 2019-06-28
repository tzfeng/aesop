class Database:
    def __init__(self):
        self._users = {}
        self._bets = {}
        self._bet_key = 0

    def users(self):
        return self._users

    def bets(self):
        return self._bets

    def make_bet_key(self):
        self._bet_key += 1
        return self._bet_key
