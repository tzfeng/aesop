var Ont = require('ontology-ts-sdk');

const Parameter = Ont.Parameter;
const ParameterType = Ont.ParameterType;

exports.create_bet = async function(req, res) {

    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey('KzoEKnsELm3P8zRJz1rzNVLGqPVuuVmVWeBnSrFrddA2PqRnkuVs');
    const account = Ont.Account.create(privateKey, 'l', 'test');
    console.log(account.address.serialize());
    
    const contract = Ont.utils.reverseHex('25820d2448a7c42a0f9ffc3e5271762768a5a599');
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'create_bet';

    const params = [
        new Parameter('args', ParameterType.Array,
            [
                new Parameter('Address', ParameterType.String, 'Acuj41fD4MdubYa8FmEMtYHS9eD2AxnXF5'),
                new Parameter('Amount_staked', ParameterType.Integer, 1),
                new Parameter('Ticker', ParameterType.String, 'AAPL'),
                new Parameter('Sign', ParameterType.Integer, -1),
                new Parameter('Margin', ParameterType.Integer, 1),
                new Parameter('Date', ParameterType.String, '10-07-2019'),
                new Parameter('Init_Price', ParameterType.Integer, 1)
            ]
        )
    ];

    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '20000');
    Ont.TransactionBuilder.signTransaction(tx, privateKey);
    res = await restClient.sendRawTransaction(tx.serialize(), false, true); // 2nd arg is if you read it 
    console.log(JSON.stringify(res));

}

exports.payout = async function(req, res) {
    
    const restClient = new Ont.RestClient();

    const privateKey = new Ont.Crypto.PrivateKey('KzoEKnsELm3P8zRJz1rzNVLGqPVuuVmVWeBnSrFrddA2PqRnkuVs');
    const account = Ont.Account.create(privateKey, 'l', 'test');
    console.log(account.address.serialize());

    const contract = reverseHex('ab01641c418af066402075c78dc8cb8279a7c074');
    const contractAddr = new Ont.Crypto.Address(contract);
    const method = 'payout';

    const params = [
        new Parameter('args', ParameterType.Array,
            [
                new Parameter('BetID', ParameterType.Integer, 1),
                new Parameter('Current_Price', ParameterType.Integer, 10)
            ]
        )
    ];

    const tx = Ont.TransactionBuilder.makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
    Ont.TransactionBuilder.signTransaction(tx, privateKey);
    res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
    console.log(JSON.stringify(res));

}