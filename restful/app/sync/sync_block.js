const axios = require('axios');
const config = require('./config.js');
const Ont = require('ontology-ts-sdk');
const BigNumber = require('bignumber.js');
const moment = require('moment');

const restfulUrl = config.url + ":20334";

function HexToInt(num) {
    return parseInt('0x'+num.match(/../g).reverse().join(''));
}

const fetchLastBlock = async function () {
    const url = restfulUrl + '/api/v1/block/height';
    const res = await axios.get(url);    
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
    // console.log(url);
    const res = await axios.get(url);
    if(!res || !res.data) {
        return;
    }
    const txs = res.data.Result;
    if (txs!= "") {
        // console.log('txs are : ' + JSON.stringify(txs));
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

    try { 
    var height = await fetchLastBlock();
    }
    catch (e) { throw e };
    
    try {
    var notifyList = await fetchScEventsByBlock(height);  
    }
    catch (e) { throw e }; 

    if (notifyList.length > 0) {
        for (const notify of notifyList) {
            const states = notify['States'];
            
            const contractHash = notify['ContractAddress']; 
            // console.log("\n*** the whole notify is " + JSON.stringify(notify));
            if (contractHash == config.myContractHash) {
                if (notify.TxHash == current_hash) {
                    const key = Ont.utils.hexstr2str(states[0]);

                    if (key == 'bet') {
                        // console.log(JSON.stringify(states[2][9]));
                        const bet = HexToInt(states[1]);
                        // const for_rep = HexToInt(states[2][0]);
                        // const against_rep = HexToInt(states[2][1]);                 
                        const for_staked = HexToInt(states[2][2]) / 1e8;
                        const against_staked = HexToInt(states[2][3]) / 1e8;
                        const change = HexToInt(states[2][6]) * HexToInt(states[2][7]);
                        const target_price = HexToInt(states[2][8]) / 1e8;
                        const date = Ont.utils.hexstr2str(states[2][9]);
                        const ticker = Ont.utils.hexstr2str(states[2][10]);
                        const for_avg_rep = HexToInt(states[2][11]) / 1e8 - 1e8;
                        var against_avg_rep;
                        if (against_staked == 0) { against_avg_rep = 0; }
                        else { against_avg_rep = HexToInt(states[2][12]) / 1e8 - 1e8; }
                        const prob = HexToInt(states[2][13]) / 1e8;

                        const val = [bet, ticker, change, target_price, date, for_staked, against_staked, for_avg_rep, against_avg_rep, prob];
                        return val;
                    }
                }                 
            }          
        }
    }
}

exports.syncVote = async function (current_hash) {

    const height = await fetchLastBlock();
    
    const notifyList = await fetchScEventsByBlock(height);
    

    if (notifyList.length > 0) {
        for (const notify of notifyList) {
            const states = notify['States'];
            const contractHash = notify['ContractAddress']; 
            // console.log("\n*** the whole notify is " + JSON.stringify(notify));

            if (contractHash == config.myContractHash) {
                if (notify.TxHash == current_hash) {
                    const key = Ont.utils.hexstr2str(states[0]);
                    if (key == 'vote') {
                        // console.log(JSON.stringify(states[2][9]));
                            const bet = HexToInt(states[1]);
                        // const for_rep = HexToInt(states[2][0]);
                        // const against_rep = HexToInt(states[2][1]);                 
                        const for_staked = HexToInt(states[2][2]) / 1e8;
                        const against_staked = HexToInt(states[2][3]) / 1e8;
                        const change = HexToInt(states[2][6]) * HexToInt(states[2][7]);
                        const target_price = HexToInt(states[2][8]) / 1e8;
                        const date = Ont.utils.hexstr2str(states[2][9]);
                        const ticker = Ont.utils.hexstr2str(states[2][10]);
                        const for_avg_rep = HexToInt(states[2][11]) / 1e8 - 1e8;
                        var against_avg_rep;
                        if (against_staked == 0) { against_avg_rep = 0; }
                        else { against_avg_rep = HexToInt(states[2][12]) / 1e8 - 1e8; }
                        const prob = HexToInt(states[2][13]) / 1e8;

                        const val = [bet, ticker, change, target_price, date, for_staked, against_staked, for_avg_rep, against_avg_rep, prob];
                        return val;
                    }
                }                 
            }          
        }
    }
}

exports.syncFeed = async function (current_hash) {

    const height = await fetchLastBlock();
    
    try { 
        var notifyList = await fetchScEventsByBlock(height);
    }
    catch (e) { throw e };
    
    const betEvents = [];

    if (notifyList.length > 0) {
        for (const notify of notifyList) {
            const states = notify['States'];
            const contractHash = notify['ContractAddress']; 
            // console.log("\n*** the whole notify is " + JSON.stringify(notify));

            
            if (notify.TxHash === current_hash) {
                const key = Ont.utils.hexstr2str(states[0]);
                if (key == 'feed') {
                    var map = new Map();

                    for (let i = 0; i < states[1].length; i++) {
                        // console.log(JSON.stringify(states[1][i]));
                        const bet = HexToInt(states[1][i][0]);
                        const ticker = Ont.utils.hexstr2str(states[1][i][1], 16);

                        console.log("raw " + states[1][i][2]);
                        console.log("after parse " + HexToInt(states[1][i][2]));

                        const target_price = HexToInt(states[1][i][2]) / 1e8;

                        const change = parseInt(states[1][i][3], 16) * parseInt(states[1][i][4], 16);


                        const for_avg_rep = (HexToInt(states[1][i][5]) / 1e8) - 1e8;

                        const for_staked = HexToInt(states[1][i][7]) / 1e8;
                        const against_staked = HexToInt(states[1][i][8]) / 1e8;


                        const against_avg_rep = (HexToInt(states[1][i][6]) / 1e8) - 1e8;
                        if (against_staked == 0) { against_avg_rep = 0; }

                        const date = Ont.utils.hexstr2str(states[1][i][9], 16)
                        const prob = HexToInt(states[1][i][10]) / 1e8;

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
                    const key = Ont.utils.hexstr2str(states[0]);
                    if (key == 'record') {
                        const bets = states[1];
                        const results = states[2];
                        const net = states[3];
                        for (let i = 0; i < bets.length; i++) {
                            bets[i] = parseInt(bets[i], 16);
                            results[i] = parseInt(results[i], 16);
                            net[i] = parseInt(net[i], 16);
                        }
                        const val = [bets, results, net];
                        return val; 
                    }
                    if (key == 'No bets') { return [ null, null, null ]; }                       
                }  
            }          
        }
    }
}

exports.syncHistory = async function (current_hash) {

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
                    const key = Ont.utils.hexstr2str(states[0]);
                        if (key == 'Final result') {
                        var result = HexToInt(states[1]);
                        switch (result) {
                            case -1: result = 'Incorrect';
                            case 0: result = 'No price change';
                            case 1: result = 'Correct';
                            case 2: result = 'Incomplete';
                        }
                        return result;
                    }
                }  
            }          
        }
    }
}