var Ont = require('ontology-ts-sdk');
const sync_block = require('../sync/sync_block.js');

const Parameter = Ont.Parameter;
const ParameterType = Ont.ParameterType;

exports.create_user = async function(req, res) {
    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey('6ac187607c14403ae96327137b230349eebd8693bd2a7be6b63da3449598bb63');
    const account = Ont.Account.create(privateKey, 'l', 'test');
    console.log(account.address.serialize());
    
    const contract = Ont.utils.reverseHex('e6c6a65757950ccb73c5b9791cbf4e12dc8203b8');
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'create_user';

    const params = [
                new Parameter('Address', ParameterType.String, 'Acuj41fD4MdubYa8FmEMtYHS9eD2AxnXF5')
    ];

    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '27026', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);
    res = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    console.log(JSON.stringify(res));
}

exports.create_bet = async function(req, res) {

    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey('6ac187607c14403ae96327137b230349eebd8693bd2a7be6b63da3449598bb63');
    const account = Ont.Account.create(privateKey, 'l', 'test');
    console.log(account.address.serialize());
    
    const contract = Ont.utils.reverseHex('e6c6a65757950ccb73c5b9791cbf4e12dc8203b8');
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'create_bet';

    const params = [
                new Parameter('String', ParameterType.String, req[0]),
                new Parameter('Amount_staked', ParameterType.Integer, req[1]),
                new Parameter('Ticker', ParameterType.String, req[2]),
                new Parameter('Sign', ParameterType.Integer, req[3]),
                new Parameter('Margin', ParameterType.Integer, req[4]),
                new Parameter('Date', ParameterType.String, req[5]),
                new Parameter('Init_Price', ParameterType.Integer, req[6])
    ];
    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '57803', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);

    try {
    txnString = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    txn = txnString["Result"];
    console.log(JSON.stringify(txn));
    res = txn;
    // return res;
    }
    catch (e) { throw e; }

    try {
    var val = await sync_block.syncBet(txn);
    // console.log("val ? " + JSON.stringify(val));
    } 
    catch (e) {
        console.log(e);
    }
    
    return val;
    // const res2 = await restClient.getRawTransaction(res["Result"]);
    // console.log(res2);
}

exports.payout = async function(req, res) {
    
    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey('6ac187607c14403ae96327137b230349eebd8693bd2a7be6b63da3449598bb63');
    const account = Ont.Account.create(privateKey, 'l', 'test');
    // console.log(account.address.serialize());

    const contract = Ont.utils.reverseHex('e6c6a65757950ccb73c5b9791cbf4e12dc8203b8');
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'payout';

    const params = [
                new Parameter('BetID', ParameterType.Integer, req[0]),
                new Parameter('Current_Price', ParameterType.Integer, req[1])
                ];

    // console.log(JSON.stringify(params));

    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '27026', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);
    try {
    res = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    console.log(JSON.stringify(res));
    } catch (e) {
        console.error(e);
    }

}

let params = [ "Acuj41fD4MdubYa8FmEMtYHS9eD2AxnXF5",
  1,
  "FB",
  1,
  1,
  "01-01-2019",
  1];

// create_bet(params, null).then((ans)=> {console.log("out > " + ans)});

