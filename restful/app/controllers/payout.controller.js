// const Payout = require('../models/payout.model.js');
const scrape = require('../scrape/scraper.ts');
const sc = require('../sc/sc.js');
const schedule = require('node-schedule');
const moment = require('moment');
const Bet = require('../models/bet.model.js')

exports.init = async function(req, res) {

	var payout_check = schedule.scheduleJob('2 * * * * *', () => {
		//const now = moment().format('YYYY-MM-DD');
		const now = '0505';

		// for everything in database with exp date now
		Bet.find({ date: now }, async(err, payout_bets) => {
			console.log("payout is running .. ");
			if (err) return console.error(err);

			if (payout_bets.length == 0) console.log("no bets that match");
		
		for (let bet of payout_bets) {
			// console.log(bet);

			const id = 5;// bet['betID'];
			const ticker = bet['ticker'];

			let current_price = -1;
    		try { current_price = await scrape.scrapePrice(ticker);
    		// console.log(current_price);
    		}
    		catch (error) {
        		return res.status(400).send("scraper died");
    		}

    		const params = [Number(id), Number(current_price)];
	        //console.log("id ->" + id);
	        //console.log("current_price ->" + current_price);

	        // bet.remove();

	        try {
	            const payout = await sc.payout(params);
	        } catch (error) {
	        	console.log(error);
	            //return res.status(400).send(error);
	        }
		}
		

		});

		// vote_bets = Bet.find({vote_date: now}, (err, bets) => {
		// 	if (err) return console.error(err);
		// 	console.log(bets);
		// });
		// for (let bet in vote_bets) {
			// do something to remove voting functionality
			// maybe display that the voting period has elapsed on frontend
	// 	}

	});

}