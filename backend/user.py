from backend.database import Database


class User:
    def __init__(self, data: Database, address: str = ''):
        # takes in the database, and user address as argument. Keeps track of user's rep and bank
        self._address = address
        self._rep = 0.0
        self._bank = 0.0
        data.users()[address] = self

    # return address of user
    def get_address(self):
        return self._address

    # return public reputation of user
    def get_rep(self):
        return self._rep

    # return bank amount of user
    def get_bank(self):
        return self._bank

    # updates public reputation of user
    def update_rep(self, value: float):
        self._rep += value

    # updates bank amount of user
    def update_bank(self, value: float):
        self._bank += value
