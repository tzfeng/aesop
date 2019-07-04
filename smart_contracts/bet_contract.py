from boa.builtins import concat
from boa.interop.System.App import RegisterAppCall
from ontology.builtins import len
from ontology.interop.Ontology.Runtime import Base58ToAddress
from ontology.interop.System.Runtime import Notify, Serialize, Deserialize
from ontology.interop.System.Storage import Put, Get, GetContext, Delete

# keys and prefixes for data storage onchain
REPKEY = 'Rep'
BANKEY = 'Bank'
BETKEY = 'Bets'
USERKEY = 'Users'
FM_PREFIX = 'FM'  # for map
AM_PREFIX = 'AM'  # against map
FL_PREFIX = 'FL'  # for list
AL_PREFIX = 'AL'  # against list
VAL_PREFIX = 'VAL'
ST_PREFIX = 'ST'  # stock_ticker
ABKEY = 'AB'  # active bets

# FR, AR, FS, AS, FC, AC, UD, MA, TP, SE
# FR_PREFIX = 'FR' # for rep
# AR_PREFIX = 'AR' # against rep
# FS_PREFIX = 'FS' # for staked
# AS_PREFIX = 'AS' # against staked
# FC_PREFIX = 'FC' # for count
# AC_PREFIX = 'AC' # against count
# UD_PREFIX = 'UD' # sign/up_down
# MA_PREFIX = 'MA' # margin
# SE_PREFIX = 'SE' # seconds
# TP_PREFIX = 'TP' # target price

ctx = GetContext()

# call OEP4 contract for transfer of tokens
RepContract = RegisterAppCall('210fdf37cf13fdbf2bf7590223f41bd0bb3d8039', 'operation', 'args')
token_owner = 'ANXE3XovCwBH1ckQnPc6vKYiTwRXyrVToD'


def Main(operation, args):
    if operation == 'init':
        return init()

    if operation == 'add_bank':
        if len(args) != 2:
            return False
        address = args[0]
        amount = args[1]
        return add_bank(address, amount)

    if operation == 'subtract_bank':
        if len(args) != 2:
            return False
        address = args[0]
        amount = args[1]
        return subtract_bank(address, amount)

    if operation == 'create_user':
        if len(args) != 1:
            return False
        address = args[0]
        return create_user(address)

    if operation == 'purchase_bank':
        if len(args) != 2:
            return False
        address = args[0]
        amount = args[1]
        return purchase_bank(address, amount)

    if operation == 'view_rep':
        if len(args) != 1:
            return False
        address = args[0]
        return view_rep(address)

    if operation == 'view_bank':
        if len(args) != 1:
            return False
        address = args[0]
        return view_bank(address)

    if operation == 'view_wallet':
        if len(args) != 1:
            return False
        address = args[0]
        return view_wallet(address)

    # will change seconds to an actual date, depending on oracle
    if operation == 'create_bet':
        if len(args) != 6:
            return False
        address = args[0]
        amount_staked = args[1]
        stock_ticker = args[2]
        sign = args[3]
        margin = args[4]
        seconds = args[5]
        return create_bet(address, amount_staked, stock_ticker, sign, margin, seconds)

    if operation == 'vote':
        if len(args) != 4:
            return False
        bet = args[0]
        address = args[1]
        amount_staked = args[2]
        for_against = args[3]
        return vote(bet, address, amount_staked, for_against)

    if operation == 'distribute':
        if len(args) != 2:
            return False
        bet = args[0]
        result = args[1]
        return distribute(bet, result)

    if operation == 'check_result':
        if len(args) != 2:
            return False
        bet = args[0]
        current_price = args[1]
        return check_result(bet, current_price)

    if operation == 'payout':
        if len(args) != 2:
            return False
        bet = args[0]
        current_price = args[1]
        return payout(bet, current_price)

    if operation == 'bet_info':
        if len(args) != 1:
            return False
        bet = args[0]
        return bet_info(bet)

    if operation == 'feed':
        return feed()


# initialize all necessary data structures to be stored onchain
def init():
    if Get(ctx, REPKEY) and Get(ctx, BANKEY) and Get(ctx, BETKEY) and Get(ctx, ABKEY):
        Notify(['Already initialized'])
        return False
    else:
        BETID = 0
        Put(ctx, BETKEY, BETID)

        return True


# method to concatenate prefixes with corresponding keys
def concatkey(str1, str2):
    return concat(concat(str1, '_'), str2)


# used for all bet-specific maps
def add_map(key, value, prefix):
    bet = Get(ctx, BETKEY)
    map_info = Get(ctx, concatkey(bet, prefix))
    maps = Deserialize(map_info)

    # add data
    maps[key] = value
    map_Info = Serialize(maps)
    Put(ctx, concatkey(bet, prefix), map_info)

    return True


def add_user_list(element, prefix):
    bet = Get(ctx, BETKEY)
    list_info = Get(ctx, concatkey(bet, prefix))
    lists = Deserialize(list_info)

    lists.append(element)
    list_info = Serialize(lists)
    Put(ctx, concatkey(bet, prefix), list_info)

    return True


# used for active bets
# def add_list(element):
#     ab_info = Get(ctx, ABKEY)
#     ab = Deserialize(ab_info)

#     ab1 = ab.append(element)
#     ab1_info = Serialize(ab1)
#     Put(ctx, ABKEY, ab1_info)

#     return True

# used for active bets
def remove_list(element):
    ab_info = Get(ctx, ABKEY)
    ab = Deserialize(ab_info)

    ab1 = ab.remove(element)
    ab1_info = Serialize(ab1)
    Put(ctx, ABKEY, ab1_info)

    return True


# add to address's wallet
def add_bank(address, amount):
    from_acct = Base58ToAddress(token_owner)
    to_acct = Base58ToAddress(address)
    params = [from_acct, to_acct, amount]
    return RepContract('transfer', params)


# subtract from address's wallet
def subtract_bank(address, amount):
    from_acct = Base58ToAddress(address)
    to_acct = Base58ToAddress(token_owner)
    params = [from_acct, to_acct, amount]
    return RepContract('transfer', params)


# create a user and give 100 free rep. Store corresponding info onchain
def create_user(address):
    # check if user list has been created. if not, initialize it
    user_info = Get(ctx, USERKEY)
    if user_info:
        all_users = Deserialize(user_info)
    else:
        all_users = []

    if address in all_users:
        Notify(['User already created'])
        return False

    byte_address = Base58ToAddress(address)
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    else:
        # check if rep map has been created. if not, initialize it
        rep_info = Get(ctx, REPKEY)
        if rep_info:
            rep_map = Deserialize(rep_info)
        else:
            rep_map = {}

        # update and put rep map
        rep_map[address] = 100
        rep_info = Serialize(rep_map)
        Put(ctx, REPKEY, rep_info)

        # update and put user list
        all_users.append(address)
        user_info = Serialize(all_users)
        Put(ctx, USERKEY, user_info)

        # check if bank map has been created. if not, initialize it
        bank_info = Get(ctx, BANKEY)
        if bank_info:
            bank_map = Deserialize(bank_info)
        else:
            bank_map = {}

        # update and put bank map
        bank_map[address] = 100
        bank_info = Serialize(bank_map)
        Put(ctx, BANKEY, bank_info)

        # add to wallet of user
        add_bank(address, 100)

        return True


# allow an existing user to purchase more rep, only modified bank_map and actual wallet
# need way to create and reflect real transaction
def purchase_bank(address, amount):
    byte_address = Base58ToAddress(address)
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    else:
        # check if user has been created. if not, create the user
        user_info = Get(ctx, USERKEY)
        all_users = Deserialize(user_info)

        if address not in all_users:
            create_user(address)

        # if the user has been created, that means the bank map exists. update the user's bank and wallet
        else:
            bank_info = Get(ctx, BANKEY)
            bank_map = Deserialize(bank_info)
            bank_map[address] += amount
            bank_info = Serialize(bank_map)
            Put(ctx, BANKEY, bank_info)

            add_bank(address, amount)

        return True


# function to view the rep of a particular user
def view_rep(address):
    byte_address = Base58ToAddress(address)
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    # check if user list exists
    user_info = Get(ctx, USERKEY)
    if user_info:
        all_users = Deserialize(user_info)
    else:
        Notify(['User list is empty'])
        return False

    # check if user has been created
    if address not in all_users:
        Notify(['User not yet created'])
        return False

    # if the user has been created, the rep map exists. Check the user's rep
    else:
        rep_info = Get(ctx, REPKEY)
        rep_map = Deserialize(rep_info)
        return rep_map[address]


def view_bank(address):
    byte_address = Base58ToAddress(address)
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    # check if user list exists
    user_info = Get(ctx, USERKEY)
    if user_info:
        all_users = Deserialize(user_info)
    else:
        Notify(['User list is empty'])
        return False

    # check if user has been created
    if address not in all_users:
        Notify(['User not yet created'])
        return False

    # if the user has been created, the bank map exists. Check the user's bank
    else:
        bank_info = Get(ctx, BANKEY)
        bank_map = Deserialize(bank_info)
        return bank_map[address]


def view_wallet(address):
    byte_address = Base58ToAddress(address)
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    # check if user list exists
    user_info = Get(ctx, USERKEY)
    if user_info:
        all_users = Deserialize(user_info)
    else:
        Notify(['User list is empty'])
        return False

    # check if user has been created
    if address not in all_users:
        Notify(['User not yet created'])
        return False

    # if the above checks hold, we can check the user's wallet.
    else:
        params = [byte_address]
        return RepContract("balanceOf", params)


# dummy oracle function to "get" an initial stock price
def dummy_oracle_init():
    return 100


# dummy oracle function to "get" a current stock price
def dummy_oracle_current():
    return 105


# change timing to month/date/yr + exceptions
# creates a bet, storing necessary info onchain and putting the user on the "for" side of the bet
def create_bet(address, amount_staked, stock_ticker, sign, margin, seconds):
    byte_address = Base58ToAddress(address)
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    # check if user list exists
    user_info = Get(ctx, USERKEY)
    if user_info:
        all_users = Deserialize(user_info)
    else:
        Notify(['User list is empty'])
        return False

    # check if user exists
    if address not in all_users:
        Notify(['User not created'])
        return False

    # if user exists, bank map exists. check bank condition
    bank_info = Get(ctx, BANKEY)
    bank_map = Deserialize(bank_info)

    if bank_map[address] < amount_staked:
        Notify(['Insufficient funds'])
        return False

    # something to check stock stock_ticker

    if sign != 1 and sign != -1:
        Notify(['Invalid sign'])
        return False

    # something to check if the time is valid and not in the past

    else:
        # after all conditions have passed, get the rep map.
        rep_info = Get(ctx, REPKEY)
        rep_map = Deserialize(rep_info)

        # init data structures
        for_map = {}
        # against_map = {} don't need to store empty map
        for_list = []
        against_list = []
        for_rep = rep_map[address]
        against_rep = 0
        for_staked = 0
        against_staked = 0
        for_count = 1
        against_count = 0

        # update data
        init_price = dummy_oracle_init()
        target_price = init_price * (1 + sign * margin)
        for_map[address] = amount_staked
        for_list.append(address)
        for_staked += amount_staked

        # FR, AR, FS, AS, FC, AC, UD, MA, TP, SE are in val_list
        val_list = []

        # populate val_list with relevant values
        val_list.append(for_rep)
        val_list.append(against_rep)
        val_list.append(for_staked)
        val_list.append(against_staked)
        val_list.append(for_count)
        val_list.append(against_count)
        val_list.append(sign)
        val_list.append(margin)
        val_list.append(target_price)
        val_list.append(seconds)

        # prepare data structures for storage
        fm_info = Serialize(for_map)
        # am_info = Serialize(against_map) don't need to store empty map
        fl_info = Serialize(for_list)
        val_info = Serialize(val_list)

        # get current bet number to create bet specific keys for relevant data
        bet = Get(ctx, BETKEY)

        # put data structures onchain
        Put(ctx, concatkey(bet, FM_PREFIX), fm_info)
        # Put(ctx, concatkey(bet, AM_PREFIX), am_info)
        Put(ctx, concatkey(bet, FL_PREFIX), fl_info)
        Put(ctx, concatkey(bet, VAL_PREFIX), val_info)
        Put(ctx, concatkey(bet, ST_PREFIX), stock_ticker)

        # check if ab_info is populated/exists
        ab_info = Get(ctx, ABKEY)
        if ab_info:
            active_bets = Deserialize(ab_info)
        else:
            active_bets = []

        # update active bet list and put back onchain
        active_bets.append(bet)
        ab_info = Serialize(active_bets)
        Put(ctx, ABKEY, ab_info)

        # update current bet number and put back onchain
        new_bet = bet + 1
        Put(ctx, BETKEY, new_bet)

        # update bet creator's public bank ledger and actual wallet
        bank_map[address] -= amount_staked
        bank_info = Serialize(bank_map)
        Put(ctx, BANKEY, bank_info)
        subtract_bank(address, amount_staked)

        # timing: voting period, observation period, payout.
        # result checking func handled by oracle
        # for testing only: use payout on specific bet, manually remember bet IDs
        # figure out how to automate payout as soon as bet is created.

        return True


# votes on a side of the bet and immediately updates relevant data structures
def vote(bet, address, amount_staked, for_against):
    # check if active bet list is populated/exists
    ab_info = Get(ctx, ABKEY)
    if ab_info:
        active_bets = Deserialize(ab_info)
    else:
        Notify(['There are no active bets'])
        return False

    # check if bet argument is an active bet
    if bet not in active_bets:
        Notify(['Bet is not active'])
        return False

    # check if user list exists
    user_info = Get(ctx, USERKEY)
    if user_info:
        all_users = Deserialize(user_info)
    else:
        Notify(['User list is empty'])
        return False

    # check if user has been created
    if address not in all_users:
        Notify(['User not created'])
        return False

    # check if address is valid
    byte_address = Base58ToAddress(address)
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    # check if bank is sufficient for staking
    bank_info = Get(ctx, BANKEY)
    bank_map = Deserialize(bank_info)

    if bank_map[address] < amount_staked:
        Notify(['Insufficient funds'])
        return False

    else:
        # get val_list for this particular bet
        val_info = Get(ctx, concatkey(bet, VAL_PREFIX))
        val_list = Deserialize(val_info)

        # get the rep info
        rep_info = Get(ctx, REPKEY)
        rep_map = Deserialize(rep_info)

        # check if user agrees or disagrees with bet
        if for_against:
            # maps user to amount staked
            add_map(address, amount_staked, FM_PREFIX)
            add_user_list(address, FL_PREFIX)

            # update for staked
            val_list[2] += amount_staked

            # update for count
            val_list[4] += 1

            # update for rep
            val_list[0] += rep_map[address]
        else:
            # if people have already voted against this bet, take this action:
            if Get(ctx, concatkey(bet, AL_PREFIX)):
                add_map(address, amount_staked, AM_PREFIX)
                add_user_list(address, AL_PREFIX)

            # if not, create, update, and store against map and list for this bet
            else:
                against_map = {}
                against_list = []

                against_map[address] = rep_map[address]
                against_list.append(address)

                am_info = Serialize(against_map)
                al_info = Serialize(against_list)
                Put(ctx, concatkey(bet, AM_PREFIX), am_info)
                Put(ctx, concatkey(bet, AL_PREFIX), al_info)

            # update against staked
            val_list[3] += amount_staked

            # update against count
            val_list[5] += 1

            # update against rep
            val_list[1] += rep_map[address]

        # put val_list back onchain
        val_info = Serialize(val_list)
        Put(ctx, concatkey(bet, VAL_PREFIX), val_info)

        # update wallet and bank ledger, put latter back onchain
        bank_map[address] -= amount_staked
        bank_info = Serialize(bank_map)
        Put(ctx, BANKEY, bank_info)
        subtract_bank(address, amount_staked)

        return True


# distributes staked rep based on result of bet
def distribute(bet, result):
    # check if active bet list is populated/exists
    ab_info = Get(ctx, ABKEY)
    if ab_info:
        active_bets = Deserialize(ab_info)
    else:
        Notify(['There are no active bets'])
        return False

    # check if bet argument is an active bet
    if bet not in active_bets:
        Notify(['Bet is not active'])
        return False

    else:
        # FR, AR, FS, AS, FC, AC, UD, MA, TP, SE
        val_info = Get(ctx, concatkey(bet, VAL_PREFIX))
        val_list = Deserialize(val_info)

        # check result and set data structures accordingly
        # if this is an active bet, these maps and lists should all exist.
        # payout function will first check if there are stakes on both sides of the bet before distributing
        if result:
            wm_info = Get(ctx, concatkey(bet, FM_PREFIX))
            winners_map = Deserialize(wm_info)

            wl_info = Get(ctx, concatkey(bet, FL_PREFIX))
            winners_list = Deserialize(wm_info)

            lm_info = Get(ctx, concatkey(bet, AM_PREFIX))
            losers_map = Deserialize(lm_info)

            ll_info = Get(ctx, concatkey(bet, AL_PREFIX))
            losers_list = Deserialize(lm_info)

            win_stake = val_list[2]
            lose_stake = val_list[3]
        else:
            wm_info = Get(ctx, concatkey(bet, AM_PREFIX))
            winners_map = Deserialize(wm_info)

            wl_info = Get(ctx, concatkey(bet, AL_PREFIX))
            winners_list = Deserialize(wm_info)

            lm_info = Get(ctx, concatkey(bet, FM_PREFIX))
            losers_map = Deserialize(lm_info)

            ll_info = Get(ctx, concatkey(bet, FL_PREFIX))
            losers_list = Deserialize(lm_info)

            win_stake = val_list[3]
            lose_stake = val_list[2]

        # get rep and bank info for updating
        # these maps exist given this is an active and valid bet
        rep_info = Get(ctx, REPKEY)
        rep_map = Deserialize(rep_info)

        bank_info = Get(ctx, BANKEY)
        bank_map = Deserialize(bank_info)

        # distribute and update winners' rep, bank, wallet
        for address in winners_list:
            rep_map[address] += winners_map[address] * (1 + lose_stake / win_stake)
            bank_map[address] += winners_map[address] * (1 + lose_stake / win_stake)
            add_bank(address, winners_map[address] * (1 + lose_stake / win_stake))

        # only need to update losers' rep - bank and wallet updated already during staking
        for address in losers_list:
            rep_map[address] -= losers_map[address]

        # put public data structures back onchain
        rep_info = Serialize(rep_map)
        Put(ctx, REPKEY, rep_info)

        bank_info = Serialize(bank_map)
        Put(ctx, BANKEY, bank_info)

        return True


# checks the result of the bet's prediction
def check_result(bet, current_price):
    # check if active bet list is populated/exists
    ab_info = Get(ctx, ABKEY)
    if ab_info:
        active_bets = Deserialize(ab_info)
    else:
        Notify(['There are no active bets'])
        return False

    # check if bet argument is an active bet
    if bet not in active_bets:
        Notify(['Bet is not active'])
        return False

    if current_price < 0:
        Notify(['Invalid price'])
        return False

    else:
        # FR, AR, FS, AS, FC, AC, UD, MA, TP, SE
        val_info = Get(ctx, concatkey(bet, VAL_PREFIX))
        val_list = Deserialize(val_info)

        sign = val_list[6]
        target_price = val_list[8]
        current_price = dummy_oracle_current()

        # case where user bets that stock will rise
        if sign > 0:
            if current_price > target_price:
                return 1
            if current_price == target_price:
                return 0
            else:
                return -1
        # case where user bets that stock will fall
        if sign < 0:
            if current_price < target_price:
                return 1
            if current_price == target_price:
                return 0
            else:
                return -1
        else:
            Notify(['Stock was not predicted to make any movement'])
            return False


# carries out distribute function given the current price, uses check_result
def payout(bet, current_price):
    # check if active bet list is populated/exists
    ab_info = Get(ctx, ABKEY)
    if ab_info:
        active_bets = Deserialize(ab_info)
    else:
        Notify(['There are no active bets'])
        return False

    # check if bet argument is an active bet
    if bet not in active_bets:
        Notify(['Bet is not active'])
        return False

    # if this is an active bet, then there is at least one person for voted in favor.
    # we need to check if anyone voted against before any payout occurs.
    # for the real interface, this check will occur after voting period elapses.
    # for the test, this check occurs immediately when payout is called.
    am_info = Get(ctx, concatkey(bet, AM_PREFIX))
    if am_info:
        if current_price < 0:
            Notify(['Invalid price'])
            return False

        else:
            final_result = check_result(bet, current_price)
            distribute(bet, final_result)

            # delete onchain data structures specific to a bet
            Delete(ctx, concatkey(bet, FM_PREFIX))
            Delete(ctx, concatkey(bet, AM_PREFIX))
            Delete(ctx, concatkey(bet, FL_PREFIX))
            Delete(ctx, concatkey(bet, AL_PREFIX))
            Delete(ctx, concatkey(bet, ST_PREFIX))
            Delete(ctx, concatkey(bet, VAL_PREFIX))
            remove_list(bet)

            return True

    else:
        # if this is an active bet, the bank map exists
        bank_info = Get(ctx, BANKEY)
        bank_map = Deserialize(bank_info)

        # if this is an active bet, the for map and list must exist
        fm_info = Get(ctx, concatkey(bet, FM_PREFIX))
        for_map = Deserialize(fm_info)

        fl_info = Get(ctx, concatkey(bet, FL_PREFIX))
        for_list = Deserialize(fl_info)

        # return money to voters
        for address in for_list:
            bank_map[address] += for_map[address]
            add_bank(address, for_map[address])

        # store bank map
        bank_info = Serialize(bank_map)
        Put(ctx, BANKEY, bank_info)

        # delete used data structures
        Delete(ctx, concatkey(bet, FM_PREFIX))
        Delete(ctx, concatkey(bet, FL_PREFIX))
        Delete(ctx, concatkey(bet, ST_PREFIX))
        Delete(ctx, concatkey(bet, VAL_PREFIX))
        remove_list(bet)

        Notify(['Voted only on one side, money returned'])
        return False


# need timed payout

# displays all the necessary info for UI for a single bet
def bet_info(bet):
    # check if active bet list is populated/exists
    ab_info = Get(ctx, ABKEY)
    if ab_info:
        active_bets = Deserialize(ab_info)
    else:
        Notify(['There are no active bets'])
        return False

    # check if bet argument is an active bet
    if bet not in active_bets:
        Notify(['Bet is not active'])
        return False

    else:
        # FR, AR, FS, AS, FC, AC, UD, MA, TP, SE
        val_info = Get(ctx, concatkey(bet, VAL_PREFIX))
        val_list = Deserialize(val_info)

        fm_info = Get(ctx, concatkey(bet, FM_PREFIX))
        for_map = Deserialize(fm_info)
        am_info = Get(ctx, concatkey(bet, AM_PREFIX))
        against_map = Deserialize(am_info)

        stock_ticker = Get(ctx, concatkey(bet, ST_PREFIX))

        # retrieve values of interest for this bet from val_list
        for_rep = val_list[0]
        against_rep = val_list[1]
        for_staked = val_list[2]
        against_staked = val_list[3]
        for_count = val_list[4]
        against_count = val_list[5]
        sign = val_list[6]
        margin = val_list[7]
        target_price = val_list[8]
        seconds = val_list[9]
        # current price = use oracle

        # calculate avg rep on both sides of bet
        for_avg_rep = for_rep / for_count
        against_avg_rep = against_rep / against_count

        # calculate probability/odds from amount staked on both sides
        prob = for_staked / (for_staked + against_staked)

        # add current price
        return [stock_ticker, target_price, sign * margin, for_rep, against_rep, for_avg_rep, against_avg_rep,
                for_staked, against_staked, prob]


# returns bet info for all active bets, as a map
def feed():
    # check if active bet list is populated/exists
    ab_info = Get(ctx, ABKEY)
    if ab_info:
        active_bets = Deserialize(ab_info)
    else:
        Notify(['There are no active bets'])
        return False

    all_bet_info = {}

    # store all bet info lists in a new map, which will be returned
    for bet in active_bets:
        all_bet_info[bet] = bet_info(bet)

    return all_bet_info
