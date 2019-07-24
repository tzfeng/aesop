const axios = require('axios');
const config = require('./config.js');
const Ont = require('ontology-ts-sdk');
const BigNumber = require('bignumber.js');
const moment = require('moment');

const restfulUrl = config.url + ":20334";

const fetchLastBlock = async function () {
    const url = restfulUrl + '/api/v1/block/height';
    const res = await axios.get(url);
    console.log(res.data.Result);
    var height;
    if(res && res.data && res.data.Result) {
        height = res.data.Result;
    } else {
        height = 0;
    }
    return height;
}

const fetchScEventsByBlock = async function (height) {
    const url = restfulUrl + '/api/v1/smartcode/event/transactions/' + height;
    console.log(url);
    const res = await axios.get(url);
    if(!res || !res.data) {
        return;
    }
    const txs = res.data.Result;
    if (txs!= "") {
        console.log('txs are : ' + JSON.stringify(txs));
    }
    
    const events = []
    for (const tx of txs) {
        for (const notify of tx.Notify) {
            if (notify.ContractAddress === config.myContractHash) {
                notify.TxHash = tx['TxHash']
                events.push(notify)
                // break;
            }
        }
    }
    return events;
}

exports.syncBet = async function (current_hash) {

    const height = await fetchLastBlock();
    
    const notifyList = await fetchScEventsByBlock(height);
    

    if (notifyList.length > 0) {
        for (const notify of notifyList) {
            const states = notify['States'];
            const contractHash = notify['ContractAddress']; 
            // console.log("\n*** the whole notify is " + JSON.stringify(notify));

            if (contractHash == config.myContractHash) {
                if (notify.TxHash == current_hash) {
                    const bet = parseInt(states[0], 16);                  
                    // const address = Ont.utils.hexstr2str(states[2]);
                    // const time = moment().format('YYYY-MM-DD');
                    // const val = [bet, address, time];
                    // console.log("check out this info" + JSON.stringify(val));
                    return bet;
                }                 
            }          
        }
    }
}

exports.syncFeed = async function (current_hash) {

    const height = await fetchLastBlock();
    
    const notifyList = await fetchScEventsByBlock(height);
    
    const betEvents = [];

    if (notifyList.length > 0) {
        for (const notify of notifyList) {
            const states = notify['States'];
            const contractHash = notify['ContractAddress']; 
            // console.log("\n*** the whole notify is " + JSON.stringify(notify));

            if (contractHash == config.myContractHash) {
                if (notify.TxHash === current_hash) {
                    map = new Map();

                    for (let i = 0; i < states.length; i++) {
                        const bet = parseInt(states[i][0], 16);
                        const ticker = Ont.utils.hexstr2str(states[i][1], 16);
                        const target_price = parseInt(states[i][2], 16);
                        const change = parseInt(states[i][3], 16) * parseInt(states[i][4], 16);
                        const for_avg_rep = (parseInt(states[i][5], 16) / 1e8) - 1e8;
                        const against_avg_rep = (parseInt(states[i][6], 16) / 1e8) - 1e8;
                        const for_staked = parseInt(states[i][7], 16) / 1e8;
                        const against_staked = parseInt(states[i][8], 16) / 1e8;
                        const date = Ont.utils.hexstr2str(states[i][9], 16)
                        const prob = parseInt(states[i][10], 16) / 1e8;

                        const val = [ticker, target_price, change, for_avg_rep, against_avg_rep, for_staked, against_staked, date, prob];
                        map.set(bet, val);
                        }

                    return map;
                }  
            }          
        }
    }
}

exports.syncRecord = async function (current_hash) {

    const height = await fetchLastBlock();
    
    const notifyList = await fetchScEventsByBlock(height);

    if (notifyList.length > 0) {
        for (const notify of notifyList) {
            // e means each event 
            const states = notify['States'];
            const contractHash = notify['ContractAddress']; 
            // console.log("\n*** the whole notify is " + JSON.stringify(notify));

            if (contractHash == config.myContractHash) {
                if (notify.TxHash === current_hash) {
                    const bets = states[0];
                    const results = states[1];
                    const net = states[2];
                    for (let i = 0; i < bets.length; i++) {
                        bets[i] = parseInt(bets[i], 16);
                        results[i] = parseInt(results[i], 16);
                        net[i] = parseInt(net[i], 16);
                    }
                    const val = [bets, results, net];
                    return val; 
                }  
            }          
        }
    }
}



