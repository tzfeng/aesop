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

const syncBet = async function () {

    const height = await fetchLastBlock();
    
    const notifyList = await fetchScEventsByBlock(height);
    
    const betEvents = [];

    if (notifyList.length > 0) {
        for (const notify of notifyList) {
            // e means each event 
            const states = notify['States'];
            const contractHash = notify['ContractAddress']; 
            console.log("\n*** the whole notify is " + JSON.stringify(notify));

            if (contractHash = config.myContractHash) {
                const firstval = Ont.utils.hexstr2str(states[0]);
                if (firstval === 'bet') {
                    // need to parse hex number into base 10
                    const bet = parseInt(states[1], 16);                  
                    const address = Ont.utils.hexstr2str(states[2]);
                    const time = moment().format('YYYY-MM-DD HH:mm:ss');
                    const val = [bet, address, time];
                    console.log("check out this info" + JSON.stringify(val));
                    betEvents.push(val);
                }  
            }          
        }
    }

    return betEvents;
}

const syncFeed = async function (betID) {

    const height = await fetchLastBlock();
    
    const notifyList = await fetchScEventsByBlock(height);
    
    const betEvents = [];

    if (notifyList.length > 0) {
        for (const notify of notifyList) {
            // e means each event 
            const states = notify['States'];
            const contractHash = notify['ContractAddress']; 
            console.log("\n*** the whole notify is " + JSON.stringify(notify));

            if (contractHash = config.myContractHash) {
                const firstval = parseInt(states[0], 16);
                if (firstval === betID) {
                    return states;
                }  
            }          
        }
    }

}

module.exports = { syncBet, syncFeed }



