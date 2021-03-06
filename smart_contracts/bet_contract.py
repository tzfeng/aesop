from ontology.builtins import concat
from ontology.builtins import len
from ontology.interop.Ontology.Runtime import Base58ToAddress
from ontology.interop.System.App import RegisterAppCall
from ontology.interop.System.ExecutionEngine import GetExecutingScriptHash
from ontology.interop.System.Runtime import Notify, Serialize, Deserialize, CheckWitness
from ontology.interop.System.Storage import Put, Get, GetContext, Delete

# keys and prefixes for data storage onchain
REPKEY = 'Rep'  # public reputation of all users
BANKEY = 'Bank'  # bank balances of all users
BETKEY = 'Bets'  # the current bet key
USERKEY = 'Users'  # list of all users
SUPPKEY = 'Supply'  # the current token supply
FM_PREFIX = 'FM'  # for map
AM_PREFIX = 'AM'  # against map
FL_PREFIX = 'FL'  # for list
AL_PREFIX = 'AL'  # against list
VAL_PREFIX = 'VAL'
ST_PREFIX = 'ST'  # stock_ticker
ABKEY = 'AB'  # active bets
BL_PREFIX = 'BL'  # bets a user has participated in
RC_PREFIX = 'RC'  # user's track record
PT_PREFIX = 'PT' # user's profit per bet
BT_PREFIX = 'BT' # bet prefix for track record storage
AB_PREFIX = 'AB' # bet prefix for active bets
SD_PREFIX = 'SD' # standard deviation of user's bet history

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
FACTOR = 100000000
contract_address = GetExecutingScriptHash()

# call OEP4 contract for transfer of tokens
RepContract = RegisterAppCall('7f0ac00575b34c1f8a4fd4641f6c58721f668fd4', 'operation', 'args')
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
        if len(args) != 7:
            return False
        address = args[0]
        amount_staked = args[1]
        stock_ticker = args[2]
        sign = args[3]
        margin = args[4]
        date = args[5]
        init_price = args[6]
        return create_bet(address, amount_staked, stock_ticker, sign, margin, date, init_price)

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

    if operation == 'users':
        return users()

    if operation == 'token_supply':
        return token_supply()
        
    if operation == 'user_tab':
        if len(args) != 1:
            return False
        address = args[0]
        return user_tab(address)
        
    if operation == 'user_record':
        if len(args) != 1:
            return False
        address = args[0]
        return user_record(address)
        
    if operation == 'active_bets':
        return active_bets()


# initialize all necessary data structures to be stored onchain
def init():
    if Get(ctx, BETKEY):
        Notify(['Already initialized'])
        return False
    else:
        BETID = 1
        Put(ctx, BETKEY, BETID)
        Notify(['BETID inited'])

        subtract_bank(token_owner, 100000 * FACTOR)
        Notify(['Rep tokens transferred to contract'])

        Notify(['Successfully inited'])
        return True


# method to concatenate prefixes with corresponding keys
def concatkey(str1, str2):
    return concat(concat(str1, '_'), str2)


def token_supply():
    supply = Get(ctx, SUPPKEY)
    Notify(['token supply', supply])
    return supply


# used for all bet-specific maps
def add_map(bet, key, value, prefix):
    map_info = Get(ctx, concatkey(bet, prefix))
    maps = Deserialize(map_info)

    # add data
    maps[key] = value
    map_info = Serialize(maps)
    Put(ctx, concatkey(bet, prefix), map_info)
    Notify(['add_map', key, value])
    return True


def add_user_list(bet, element, prefix):
    list_info = Get(ctx, concatkey(bet, prefix))
    lists = Deserialize(list_info)

    lists.append(element)
    list_info = Serialize(lists)
    Put(ctx, concatkey(bet, prefix), list_info)
    Notify(['add_user_list', element, prefix])
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
    if ab_info:
        ab = Deserialize(ab_info)
    else:
        Notify(['Active bet list is empty before remove'])
        return False
    
    # find the index of the element to remove
    index = binary_search(ab, element)
    ab.remove(index)
    
    ab_info = Serialize(ab)
    if ab_info:
        Put(ctx, ABKEY, ab_info)
        Notify(["remove_list", element])
        return True
    else:
        Delete(ctx, ABKEY)
        Notify(['Active bet list is empty after remove'])
        return False
        
def binary_search(lis, want):
    lo = 0
    hi = len(lis) - 1
    
    while lo <= hi:
        mid = lo + (hi - lo) / 2
        
        if lis[mid] < want:
            lo = mid + 1
            
        elif lis[mid] > want:
            hi = mid - 1
            
        else:
            return mid


# add to address's wallet
def add_bank(address, amount):
    byte_address = Base58ToAddress(address)
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    if token_supply() < amount:
        Notify(['Not enough tokens'])
        return False

    else:
        from_acct = contract_address
        to_acct = byte_address

        supply = Get(ctx, SUPPKEY)
        if supply < amount:
            Notify(['Not enough tokens in supply'])
            return False
        else:
            supply -= amount
            Put(ctx, SUPPKEY, supply)
            Notify(['Supply decreased by', amount])

            params = [from_acct, to_acct, amount]
            return RepContract('transfer', params)


# subtract from address's wallet
def subtract_bank(address, amount):
    byte_address = Base58ToAddress(address)
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    params = [byte_address]
    if RepContract('balanceOf', params) < amount:
        Notify(['Wallet balance too low'])
        return False

    else:
        from_acct = byte_address
        to_acct = contract_address

        supply = Get(ctx, SUPPKEY)
        supply += amount
        Put(ctx, SUPPKEY, supply)
        Notify(['Supply increased by', amount])

        params = [from_acct, to_acct, amount]
        return RepContract('transfer', params)


# create a user and give 100 free rep. Store corresponding info onchain
def create_user(address):
    byte_address = Base58ToAddress(address)
    # only the address can invoke the method
    assert (CheckWitness(byte_address))
    # check if user list has been created. if not, initialize it
    user_info = Get(ctx, USERKEY)
    if user_info:
        all_users = Deserialize(user_info)
    else:
        all_users = []

    if address in all_users:
        Notify(['User already created'])
        return False

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
        rep_map[address] = (100 + 100000000) * FACTOR
        rep_info = Serialize(rep_map)
        Put(ctx, REPKEY, rep_info)
        Notify(['rep_map updated'])

        # update and put user list
        all_users.append(address)
        user_info = Serialize(all_users)
        Put(ctx, USERKEY, user_info)
        Notify(['all_users updated'])

        # check if bank map has been created. if not, initialize it
        bank_info = Get(ctx, BANKEY)
        if bank_info:
            bank_map = Deserialize(bank_info)
        else:
            bank_map = {}

        # update and put bank map
        bank_map[address] = 100 * FACTOR
        bank_info = Serialize(bank_map)
        Put(ctx, BANKEY, bank_info)
        Notify(['bank_map updated'])

        # add to wallet of user
        add_bank(address, 100 * FACTOR)
        Notify(['user wallet updated'])

        return True


# allow an existing user to purchase more rep, only modified bank_map and actual wallet
# need way to create and reflect real transaction
def purchase_bank(address, amount):
    byte_address = Base58ToAddress(address)
    assert (CheckWitness(byte_address))

    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    else:
        # check if user has been created. if not, create the user
        user_info = Get(ctx, USERKEY)
        if user_info:
            all_users = Deserialize(user_info)
        else:
            Notify(['No existing users'])
            create_user(address)

        if address not in all_users:
            Notify(['not a registered user'])
            create_user(address)

        # if the user has been created, that means the bank map exists. update the user's bank and wallet
        else:
            bank_info = Get(ctx, BANKEY)
            bank_map = Deserialize(bank_info)
            bank_map[address] += amount
            bank_info = Serialize(bank_map)
            Put(ctx, BANKEY, bank_info)
            Notify(['bank_map updated'])

            add_bank(address, amount)
            Notify(['user wallet updated'])

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
        rep_balance = rep_map[address] 
        Notify([rep_balance])
        return rep_balance


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
        bank_balance = bank_map[address]
        Notify([bank_balance])
        return bank_balance


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
        wallet_balance = RepContract("balanceOf", params)
        if wallet_balance == '':
            wallet_balance = 0
        Notify([wallet_balance])
        return wallet_balance


# dummy oracle function to "get" an initial stock price
def dummy_oracle_init():
    Notify(['Dummy initial price'])
    return 100 * FACTOR


# dummy oracle function to "get" a current stock price
def dummy_oracle_current():
    Notify(['Dummy current price'])
    return 105 * FACTOR


# change timing to month/date/yr + exceptions
# creates a bet, storing necessary info onchain and putting the user on the "for" side of the bet
def create_bet(address, amount_staked, stock_ticker, sign, margin, date, init_price):
    byte_address = Base58ToAddress(address)
    assert (CheckWitness(byte_address))

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
        for_avg_rep = rep_map[address]
        against_avg_rep = 0
        prob = FACTOR * 100
        Notify(['Data structures successfully inited'])

        # update data
        target_price = init_price + init_price * sign * margin / 100
        for_map[address] = amount_staked
        for_list.append(address)
        for_staked += amount_staked
        Notify(['Data structures successfully updated'])

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
        val_list.append(date)
        val_list.append(stock_ticker)
        val_list.append(for_avg_rep)
        val_list.append(against_avg_rep)
        val_list.append(prob)
        
        Notify(['val_list successfully populated'])

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
        Notify(['Data structures stored onchain'])

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
        Notify(['Active bets updated', bet])

        # add bet to list of bets the user has participated in
        bl_info = Get(ctx, concatkey(address, BL_PREFIX))
        if bl_info:
            bet_list = Deserialize(bl_info)
        else:
            bet_list = []

        bet_list.append(bet)
        bl_info = Serialize(bet_list)
        Put(ctx, concatkey(address, BL_PREFIX), bl_info)

        Notify(['User bet list updated'])

        # update winners' track record
        record_info = Get(ctx, concatkey(address, RC_PREFIX))
        if record_info:
            record_map = Deserialize(record_info)
        else:
            record_map = {}
            
        # 1 means bet in progress
        record_map[concatkey(bet, BT_PREFIX)] = 1 
        record_info = Serialize(record_map)
        Put(ctx, concatkey(address, RC_PREFIX), record_info)
        Notify(['User track record updated'])
        
        profit_info = Get(ctx, concatkey(address, PT_PREFIX))
        if profit_info:
            profit_map = Deserialize(profit_info)
        else:
            profit_map = {}
        
        # 0 profit so far for this bet because the bet is still ongoing
        profit_map[concatkey(bet, BT_PREFIX)] = 0
        profit_info = Serialize(profit_map)
        Put(ctx, concatkey(address, PT_PREFIX), profit_info)
        Notify(['User profit per bet updated'])

        # update current bet number and put back onchain
        new_bet = bet + 1
        Put(ctx, BETKEY, new_bet)

        # update bet creator's public bank ledger and actual wallet
        bank_map[address] -= amount_staked
        bank_info = Serialize(bank_map)
        Put(ctx, BANKEY, bank_info)
        Notify(['bank_map updated'])

        subtract_bank(address, amount_staked)
        Notify(['user wallet updated'])

        # timing: voting period, observation period, payout.
        # result checking func handled by oracle
        # for testing only: use payout on specific bet, manually remember bet IDs
        # figure out how to automate payout as soon as bet is created.
        Notify(['bet', bet, val_list])
        return True


# votes on a side of the bet and immediately updates relevant data structures
def vote(bet, address, amount_staked, for_against):
    byte_address = Base58ToAddress(address)
    assert (CheckWitness(byte_address))

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
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    # check if bank is sufficient for staking
    bank_info = Get(ctx, BANKEY)
    bank_map = Deserialize(bank_info)
    
    # add bet to list of bets the user has participated in
    bl_info = Get(ctx, concatkey(address, BL_PREFIX))
    if bl_info:
        bet_list = Deserialize(bl_info)
        if bet in bet_list:
            Notify(['User already voted on this bet'])
            return False
    else:
        bet_list = []

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
            add_map(bet, address, amount_staked, FM_PREFIX)
            add_user_list(bet, address, FL_PREFIX)

            # update for staked
            val_list[2] += amount_staked

            # update for count
            val_list[4] += 1

            # update for rep
            val_list[0] += rep_map[address]
            
            # update for avg rep 
            val_list[11] = val_list[0] / val_list[4]
            
            Notify(['For values updated'])
        else:
            # if people have already voted against this bet, take this action:
            if Get(ctx, concatkey(bet, AL_PREFIX)):
                add_map(bet, address, amount_staked, AM_PREFIX)
                add_user_list(bet, address, AL_PREFIX)
                Notify(['Existing against_map and against_list'])

            # if not, create, update, and store against map and list for this bet
            else:
                against_map = {}
                against_list = []

                against_map[address] = bank_map[address]
                against_list.append(address)

                am_info = Serialize(against_map)
                al_info = Serialize(against_list)
                Put(ctx, concatkey(bet, AM_PREFIX), am_info)
                Put(ctx, concatkey(bet, AL_PREFIX), al_info)
                Notify(['against_map and against_list inited'])

            # update against staked
            val_list[3] += amount_staked

            # update against count
            val_list[5] += 1

            # update against rep
            val_list[1] += rep_map[address]
            
            # update against avg rep 
            val_list[12] = val_list[1] / val_list[5]
            Notify(['Against values updated'])
        
        # update probability
        val_list[13] = FACTOR * val_list[2] / (val_list[2] + val_list[3]) * 100
        # put val_list back onchain
        val_info = Serialize(val_list)
        Put(ctx, concatkey(bet, VAL_PREFIX), val_info)

        # update wallet and bank ledger, put latter back onchain
        bank_map[address] -= amount_staked
        bank_info = Serialize(bank_map)
        Put(ctx, BANKEY, bank_info)
        Notify(['bank_map updated'])

        subtract_bank(address, amount_staked)
        Notify(['user wallet updated'])

        bet_list.append(bet)
        bl_info = Serialize(bet_list)
        Put(ctx, concatkey(address, BL_PREFIX), bl_info)
        Notify(['User bet list updated'])

        # update track record
        record_info = Get(ctx, concatkey(address, RC_PREFIX))
        if record_info:
            record_map = Deserialize(record_info)
        else:
            record_map = {}
        
        # bet in progress
        record_map[concatkey(bet, BT_PREFIX)] = 1
        record_info = Serialize(record_map)
        Put(ctx, concatkey(address, RC_PREFIX), record_info)
        Notify(['User track record updated'])
        
        # update profit per bet info
        profit_info = Get(ctx, concatkey(address, PT_PREFIX))
        if profit_info:
            profit_map = Deserialize(profit_info)
        else:
            profit_map = {}
        
        # 0 profit so far for this bet because the bet is still ongoing
        profit_map[concatkey(bet, BT_PREFIX)] = 0
        profit_info = Serialize(profit_map)
        Put(ctx, concatkey(address, PT_PREFIX), profit_info)
        
        Notify(['vote', bet, val_list])
        

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
        
        # case in which bet is a draw
        if result == 0:
            Notify(['The bet was a draw'])
            # if this is an active bet, the bank map exists
            bank_info = Get(ctx, BANKEY)
            bank_map = Deserialize(bank_info)
    
            # if this is an active bet, the for map and list must exist
            fm_info = Get(ctx, concatkey(bet, FM_PREFIX))
            for_map = Deserialize(fm_info)
    
            fl_info = Get(ctx, concatkey(bet, FL_PREFIX))
            for_list = Deserialize(fl_info)
            
            am_info = Get(ctx, concatkey(bet, AM_PREFIX))
            against_map = Deserialize(am_info)
    
            al_info = Get(ctx, concatkey(bet, AL_PREFIX))
            against_list = Deserialize(al_info)
    
            # return money to for voters
            for address in for_list:
                bank_map[address] += for_map[address]
                add_bank(address, for_map[address])
    
                # update participants' track record
                record_info = Get(ctx, concatkey(address, RC_PREFIX))
                record_map = Deserialize(record_info)
                # 0 means bet is a draw
                record_map[concatkey(bet, BT_PREFIX)] = 0
                record_info = Serialize(record_map)
                Put(ctx, concatkey(address, RC_PREFIX), record_info)
            
            # return money to against voters   
            for address in against_list:
                bank_map[address] += against_map[address]
                add_bank(address, against_map[address])
    
                # update participants' track record
                record_info = Get(ctx, concatkey(address, RC_PREFIX))
                record_map = Deserialize(record_info)
                # 0 means bet is a draw
                record_map[concatkey(bet, BT_PREFIX)] = 0
                record_info = Serialize(record_map)
                Put(ctx, concatkey(address, RC_PREFIX), record_info)
                
            # profit for both for and against voters stays 0 for case of a draw
    
            Notify(['Money has been returned to voters, bank_map and wallet updated'])
    
            # store bank map
            bank_info = Serialize(bank_map)
            Put(ctx, BANKEY, bank_info)
    
            # delete used data structures
            # Delete(ctx, concatkey(bet, FM_PREFIX))
            # Delete(ctx, concatkey(bet, AM_PREFIX))
            # Delete(ctx, concatkey(bet, FL_PREFIX))
            # Delete(ctx, concatkey(bet, AL_PREFIX))
            # Delete(ctx, concatkey(bet, ST_PREFIX))
            # Delete(ctx, concatkey(bet, VAL_PREFIX))
            # remove_list(bet)
            Notify(['Data structures removed, bet incomplete', bet])
    
            return False
        
        # check result and set data structures accordingly
        # if this is an active bet, these maps and lists should all exist.
        # payout function will first check if there are stakes on both sides of the bet before distributing
        elif result > 0:
            wm_info = Get(ctx, concatkey(bet, FM_PREFIX))
            winners_map = Deserialize(wm_info)

            wl_info = Get(ctx, concatkey(bet, FL_PREFIX))
            winners_list = Deserialize(wl_info)

            lm_info = Get(ctx, concatkey(bet, AM_PREFIX))
            losers_map = Deserialize(lm_info)

            ll_info = Get(ctx, concatkey(bet, AL_PREFIX))
            losers_list = Deserialize(ll_info)

            win_stake = val_list[2]
            lose_stake = val_list[3]
            Notify(['for_map = winners'])
        else:
            wm_info = Get(ctx, concatkey(bet, AM_PREFIX))
            winners_map = Deserialize(wm_info)

            wl_info = Get(ctx, concatkey(bet, AL_PREFIX))
            winners_list = Deserialize(wl_info)

            lm_info = Get(ctx, concatkey(bet, FM_PREFIX))
            losers_map = Deserialize(lm_info)

            ll_info = Get(ctx, concatkey(bet, FL_PREFIX))
            losers_list = Deserialize(ll_info)

            win_stake = val_list[3]
            lose_stake = val_list[2]
            Notify(['against_map = winners'])

        # get rep and bank info for updating
        # these maps exist given this is an active and valid bet
        rep_info = Get(ctx, REPKEY)
        rep_map = Deserialize(rep_info)

        bank_info = Get(ctx, BANKEY)
        bank_map = Deserialize(bank_info)

        for address in winners_list:
            # distribute and update winners' rep, bank, wallet
            winnings = winners_map[address] + winners_map[address] * lose_stake / win_stake
            rep_map[address] += winners_map[address] * lose_stake / win_stake
            bank_map[address] += winnings
            add_bank(address, winnings)

            # update winners' track record. already initialized in vote/create
            record_info = Get(ctx, concatkey(address, RC_PREFIX))
            record_map = Deserialize(record_info)
            # 2 means bet is a victory
            record_map[concatkey(bet, BT_PREFIX)] = 2
            record_info = Serialize(record_map)
            Put(ctx, concatkey(address, RC_PREFIX), record_info)
            
            # update participants' profit per bet
            profit_info = Get(ctx, concatkey(address, PT_PREFIX))
            profit_map = Deserialize(profit_info)
            # winners have positive profit proportional to their stake and total loser stake
            profit_map[concatkey(bet, BT_PREFIX)] += winners_map[address] * lose_stake / win_stake
            profit_info = Serialize(profit_map)
            Put(ctx, concatkey(address, PT_PREFIX), profit_info)

        Notify(['Winner rep, bank, wallet, and record updated'])

        # only need to update losers' rep - bank and wallet updated already during staking
        for address in losers_list:
            rep_map[address] -= losers_map[address]

            # update losers' track record
            record_info = Get(ctx, concatkey(address, RC_PREFIX))
            record_map = Deserialize(record_info)
            # -1 means bet is a loss
            record_map[concatkey(bet, BT_PREFIX)] = -1
            record_info = Serialize(record_map)
            Put(ctx, concatkey(address, RC_PREFIX), record_info)
            
            # update participants' profit per bet
            profit_info = Get(ctx, concatkey(address, PT_PREFIX))
            profit_map = Deserialize(profit_info)
            # losers have net loss equal to their stake
            profit_map[concatkey(bet, BT_PREFIX)] -= losers_map[address]
            profit_info = Serialize(profit_map)
            Put(ctx, concatkey(address, PT_PREFIX), profit_info)

        Notify(['Loser rep updated'])

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

    else:
        # FR, AR, FS, AS, FC, AC, UD, MA, TP, SE
        val_info = Get(ctx, concatkey(bet, VAL_PREFIX))
        val_list = Deserialize(val_info)

        sign = val_list[6]
        target_price = val_list[8]
        
        # get the margin of the bet
        val_info = Get(ctx, concatkey(bet, VAL_PREFIX))
        val_list = Deserialize(val_info)
        margin = val_list[7]
        
        if margin == 0:
            if current_price == target_price:
                Notify(['No price change'])
                return 0

        # case where user bets that stock will rise
        if sign > 0:
            if current_price >= target_price:
                Notify(['For side correctly predicted rise'])
                return 1
            else:
                Notify(['Against side correctly predicted fall'])
                return -1
        # case where user bets that stock will fall
        if sign < 0:
            if current_price <= target_price:
                Notify(['For side correctly predicted fall'])
                return 1
            else:
                Notify(['Against side correctly predicted rise'])
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
    Notify(['111 still working'])
    if am_info:
        Notify(['There are voters on both sides of the bet'])
        final_result = check_result(bet, current_price)
        distribute(bet, final_result)

        # delete onchain data structures specific to a bet
        Delete(ctx, concatkey(bet, FM_PREFIX))
        Delete(ctx, concatkey(bet, AM_PREFIX))
        Delete(ctx, concatkey(bet, FL_PREFIX))
        Delete(ctx, concatkey(bet, AL_PREFIX))
        Delete(ctx, concatkey(bet, VAL_PREFIX))
        remove_list(bet)
        Notify(['Final result', final_result])

        return True

    else:
        Notify(['There are no against voters'])
        # if this is an active bet, the bank map exists
        bank_info = Get(ctx, BANKEY)
        bank_map = Deserialize(bank_info)

        # if this is an active bet, the for map and list must exist
        fm_info = Get(ctx, concatkey(bet, FM_PREFIX))
        for_map = Deserialize(fm_info)

        fl_info = Get(ctx, concatkey(bet, FL_PREFIX))
        for_list = Deserialize(fl_info)
        
        Notify(['222 We made it'])

        # return money to voters
        for address in for_list:
            bank_map[address] += for_map[address]
            add_bank(address, for_map[address])

            # update participants' track record
            record_info = Get(ctx, concatkey(address, RC_PREFIX))
            record_map = Deserialize(record_info)
            # 0 means bet is a draw
            record_map[concatkey(bet, BT_PREFIX)] = 0
            record_info = Serialize(record_map)
            Put(ctx, concatkey(address, RC_PREFIX), record_info)

        Notify(['Money has been returned to voters, bank_map and wallet updated'])

        # store bank map
        bank_info = Serialize(bank_map)
        Put(ctx, BANKEY, bank_info)

        # delete used data structures
        Delete(ctx, concatkey(bet, FM_PREFIX))
        Delete(ctx, concatkey(bet, FL_PREFIX))
        Delete(ctx, concatkey(bet, VAL_PREFIX))
        remove_list(bet)
        Notify(['Final result', 2]

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

    # since this is an active bet, all of the below data structures are populated
    else:
        # FR, AR, FS, AS, FC, AC, UD, MA, TP, SE
        val_info = Get(ctx, concatkey(bet, VAL_PREFIX))
        val_list = Deserialize(val_info)

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
        date = val_list[9]
        stock_ticker = val_list[10]
        # current price = use oracle

        # calculate avg rep on both sides of bet. will be accurate to two decimal places
        # need to divide by 10^8 for frontend display because smartx can't handle decimals
        for_avg_rep = for_rep / for_count
        against_avg_rep = against_rep / against_count
        Notify(['for_avg_rep, against_avg_rep', for_avg_rep, against_avg_rep])

        # calculate probability/odds from amount staked on both sides
        prob = FACTOR * for_staked / (for_staked + against_staked) * 100
        Notify(['probability of bet', prob])

        Notify(['bet_info', bet, stock_ticker, target_price, sign, margin, for_rep, against_rep, for_avg_rep, against_avg_rep,
                for_staked, against_staked, date, prob])
        return ['bet_info', bet, stock_ticker, target_price, sign, margin, for_rep, against_rep, for_avg_rep, against_avg_rep,
                for_staked, against_staked, date, prob]


# returns addresses of all registered users
def users():
    user_info = Get(ctx, USERKEY)
    if user_info:
        all_users = Deserialize(user_info)
        
        Notify([all_users])
        return all_users
    else:
        Notify(['There are no users'])

        return False


def user_tab(address):
    byte_address = Base58ToAddress(address)
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
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    total_rep = view_rep(address)
    total_bank = view_bank(address)
    total_wallet = view_wallet(address)
    
    Notify([total_rep, total_bank, total_wallet])
    return [total_rep, total_bank, total_wallet]


def user_record(address):
    byte_address = Base58ToAddress(address)
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
    if len(byte_address) != 20:
        Notify(['Invalid address'])
        return False

    # check if user has participated in any bets
    bl_info = Get(ctx, concatkey(address, BL_PREFIX))
    if bl_info:
        bet_list = Deserialize(bl_info)
    else:
        Notify(['User has not participated in any bets'])
        return False

    # if the user has participated in bets, he/she has a track record_info, as well as profit info
    record_info = Get(ctx, concatkey(address, RC_PREFIX))
    record_map = Deserialize(record_info)
    profit_info = Get(ctx, concatkey(address, PT_PREFIX))
    profit_map = Deserialize(profit_info)

    # create returnable list of user's record
    record_list = []
    profit_list = []
    
    for bet in bet_list:
        record_list.append(record_map[concatkey(bet, BT_PREFIX)])
        profit_list.append(profit_map[concatkey(bet, BT_PREFIX)])
    
    Notify([bet_list, record_list, profit_list])
    return [bet_list, record_list, profit_list]
    
def active_bets():
    ab_info = Get(ctx, ABKEY)
    if not ab_info:
        Notify(['Active bet list is empty'])
        return False
    else:
        active_bets = Deserialize(ab_info)
        Notify([active_bets])
        return active_bets
