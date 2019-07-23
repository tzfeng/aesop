var Ont = require('ontology-ts-sdk');

const Address = Ont.crypto;

/*
const Address = require('../src/crypto');
const RestClient = require('../src/network/rest/restClient');
const WebsocketClient = require('../src/network/websocket/websocketClient');
const makeTransactionsByJson = require('../src/transaction/transactionBuilder');
const signTransaction = require('./../src/transaction/transactionBuilder');
*/
exports.create_bet = async function(req, res) {

    const private2 = new PrivateKey('KzoEKnsELm3P8zRJz1rzNVLGqPVuuVmVWeBnSrFrddA2PqRnkuVs');
    const address2 = new Address('AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX');
    const restClient = new Ont.network.rest.restClient();

    const json = {
        action: 'invoke',
        params: {
            login: false,
            message: 'test',
            invokeConfig: {
                contractHash: '25820d2448a7c42a0f9ffc3e5271762768a5a599',
                functions: [{
                    operation: 'create_bet',
                    args: [{
                        name: 'address',
                        value: 'String:Acuj41fD4MdubYa8FmEMtYHS9eD2AxnXF5'
                    }, {
                        name: 'amount_staked',
                        value: 10
                    }, {
                        name: 'ticker',
                        value: 'String:AAPL'
                    }, {
                        name: 'sign',
                        value: 10
                    }, {
                        name: 'margin',
                        value: 10
                    }, {
                        name: 'date',
                        value: 'String: 0505'
                    }, {
                        name: 'init_price',
                        value: 10
                    }]
                }],
                gasLimit: 20000,
                gasPrice: 500
                // payer: 'AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX'
            }
        }
    };
    const txs = Ont.transactiontransactionBuilder(json);
    Ont.transaction.transactionBuilder(txs[0], private2);
    res = await restClient.sendRawTransaction(txs[0].serialize(), false);
    console.log(res);
}