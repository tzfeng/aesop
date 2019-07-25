var Ont = require('ontology-ts-sdk');
const sync_block = require('../sync/sync_block.js');
const records = require('../controllers/record.controller.js');

const Parameter = Ont.Parameter;
const ParameterType = Ont.ParameterType;

const PRI_KEY = 'b9d8b1d1b5536e5967e5b6ad59137323a72aa63bb7bbd49a9494b234aca3e3a6';
const ADDRESS = 'AdvGwt5SBmFnRzHU7LxsWnyKsJKthSEvpb';
const CONTRACT_HASH = '1e158575e2c2ab55ab3fbfcd8351657be149f83e';
const CONST = Math.pow(10, 8);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export async function create_user(req, res) {
    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey(PRI_KEY);
    const account = Ont.Account.create(privateKey, 'l', 'test');
    console.log(account.address.serialize());
    
    const contract = Ont.utils.reverseHex(CONTRACT_HASH);
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'create_user';

    const params = [
                new Parameter('Address', ParameterType.String, ADDRESS)
    ];

    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '27047', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);
    res = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    console.log(JSON.stringify(res));

    const init_record = await records.create(req, res);
}

export async function create_bet(req, res) {

    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey(PRI_KEY);
    const account = Ont.Account.create(privateKey, 'l', 'test');
    // console.log(account.address.serialize());
    
    const contract = Ont.utils.reverseHex(CONTRACT_HASH);
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'create_bet';

    const params = [
                new Parameter('String', ParameterType.String, req[0]),
                new Parameter('Amount_staked', ParameterType.Integer, req[1] * CONST),
                new Parameter('Ticker', ParameterType.String, req[2]),
                new Parameter('Sign', ParameterType.Integer, req[3]),
                new Parameter('Margin', ParameterType.Integer, req[4]),
                new Parameter('Date', ParameterType.String, req[5]),
                new Parameter('Init_Price', ParameterType.Integer, req[6] * CONST)
    ];
    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '60000', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);

    try {
    var txnString = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    var txn = txnString["Result"];
    console.log(JSON.stringify(txn));
    res = txn;

    }
    catch (e) { throw e; }

    await sleep(3000);

    try {
        var val = await sync_block.syncBet(txn);
        console.log("val ? " + JSON.stringify(val));
        return val;
        } 
        catch (e) {
            console.log(e);
            console.log("error: sync_block syncBet; exiting");
            process.exit();
        }
}

export async function vote(req, res) {

    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey(PRI_KEY);
    const account = Ont.Account.create(privateKey, 'l', 'test');
    // console.log(account.address.serialize());
    
    const contract = Ont.utils.reverseHex(CONTRACT_HASH);
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'vote';

    const params = [
                new Parameter('Bet', ParameterType.Integer, req[0]),
                new Parameter('Address', ParameterType.String, req[1]),
                new Parameter('Amount_Staked', ParameterType.Integer, req[2] * CONST),
                new Parameter('For_Against', ParameterType.Boolean, req[3])
    ];
    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '60000', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);

    try {
    var txnString = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    var txn = txnString["Result"];
    console.log(JSON.stringify(txn));
    res = txn;

    }
    catch (e) { throw e; }

    await sleep(3000);

    try {
        var val = await sync_block.syncVote(txn);
        console.log("val ? " + JSON.stringify(val));
        return val;
        } 
        catch (e) {
            console.log(e);
            console.log("error: sync_block syncVote; exiting");
            process.exit();
        }
}

export async function payout(req, res) {
    
    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey(PRI_KEY);
    const account = Ont.Account.create(privateKey, 'l', 'test');
    // console.log(account.address.serialize());

    const contract = Ont.utils.reverseHex(CONTRACT_HASH);
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'payout';

    const params = [
                new Parameter('BetID', ParameterType.Integer, req[0]),
                new Parameter('Current_Price', ParameterType.Integer, req[1] * CONST)
                ];

    // console.log(JSON.stringify(params));

    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '30000', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);

    try {
    var txnString = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    var txn = txnString["Result"];
    console.log(JSON.stringify(txn));
    }
    catch (e) { console.log("sc err");
        throw e; }

    await sleep(3000);

    try {
    var val = await sync_block.syncHistory(txn);
    console.log("val ? " + val);
    } 
    catch (e) {
        console.log("sync block err");
        throw e;
    }
    return val;

}

// user record
export async function record(req, res) {
    
    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey(PRI_KEY);
    const account = Ont.Account.create(privateKey, 'l', 'test');
    // console.log(account.address.serialize());

    const contract = Ont.utils.reverseHex(CONTRACT_HASH);
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'user_record';

    const params = [
                new Parameter('Address', ParameterType.String, req[0])
                ];

    console.log("param " + JSON.stringify(params));

    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '27026', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);

    try {
    var txnString = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    var txn = txnString["Result"];
    console.log(JSON.stringify(txn));
    }
    catch (e) { console.log("sc err");
        throw e; }

    await sleep(3000);

    try {
    var val = await sync_block.syncRecord(txn);
    console.log("val ? " + JSON.stringify(val));
    } 
    catch (e) {
        console.log("sync block err");
        throw e;
    }
    return val;

}

export async function feed(req, res) {
    
    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey(PRI_KEY);
    const account = Ont.Account.create(privateKey, 'l', 'test');

    const contract = Ont.utils.reverseHex(CONTRACT_HASH);
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'feed';

    const params = [];

    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '27026', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);

    try {
    var txnString = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    var txn = txnString["Result"];
    console.log(JSON.stringify(txn));
    }
    catch (e) { throw e; }

    await sleep(3000);

    try {
    var val = await sync_block.syncFeed(txn);

    console.log("val ? " + JSON.stringify(val));
    } 
    catch (e) {
        throw e;
    }

    return val;

}

// record([ADDRESS], null).then((ans)=>{console.log(JSON.stringify(ans))});
// feed().then((ans)=>{console.log(JSON.stringify(ans))});
// create_user();

