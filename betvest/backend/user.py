from .database import Database


class User:
    def __init__(self, data: Database, address: str = ''):
        self._address = address
        self._rep = 0.0
        self._bank = 0.0
        data.users()[address] = self

    def get_address(self):
        return self._address

    def get_rep(self):
        return self._rep

    def get_bank(self):
        return self._bank

    def update_rep(self, value: float):
        self._rep += value

    def update_bank(self, value: float):
        self._bank += value
