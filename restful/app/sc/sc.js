var Ont = require('ontology-ts-sdk');
const sync_block = require('../sync/sync_block.js');

const Parameter = Ont.Parameter;
const ParameterType = Ont.ParameterType;

const PRI_KEY = '9c3171cfde42e7578468b0f7a2cca7f3ec40c868688b3fbd445c981d945a15af';
const ADDRESS = 'AZpuvTA3aqqKe5Tb29FHMcZV651hhRDuLQ';
const CONTRACT_HASH = 'fc7e578406960105abbe40865eb33696c1076990';
const CONST = Math.pow(10, 8);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function create_user(req, res) {
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
}

exports.create_bet = async function(req, res) {

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
            console.log("error: sync_block synBet; exiting");
            process.exit();
        }
}

exports.payout = async function(req, res) {
    
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
    var resp = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    console.log("sendRawTransaction success" + JSON.stringify(resp));
    return 0;
    // return res;
    } catch (e) {
        return res.status(400).send("sendRawTransaction err ");
        console.log("sendRawTransaction err ");
        console.error(e);
    }

}

// user record
async function record(req, res) {
    
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

async function feed(req, res) {
    
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
//create_user();

