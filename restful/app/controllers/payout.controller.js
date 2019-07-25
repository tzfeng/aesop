// const Payout = require('../models/payout.model.js');
const scrape = require('../scrape/scraper.ts');
const sc = require('../sc/sc.js');
const schedule = require('node-schedule');
const moment = require('moment');
const Bet = require('../models/bet.model.js')

exports.init = async function(req, res) {

		//const now = moment().format('YYYY-MM-DD');
		const now = '2019-07-23';

		// for everything in database with exp date now
		Bet.find({ date: now }, async(err, payout_bets) => {
			// console.log("payout is running .. ");

			if (err) return console.log("beginning of payout " + err);

			if (payout_bets.length == 0) console.log("no bets that match");
		
			for (let bet of payout_bets) {

				var id = bet['betID'];
				if (id == -404) { 
					bet.remove(); 
					// console.log("removed 404 ");
					continue; 
				}

				// console.log(id);
				var ticker = bet['ticker'];

				// let current_price = 5;
	    		try { 
	    		var current_price = await scrape.scrapePrice(ticker);
	    		// console.log("price " + current_price);
	    		}
	    		catch (error) {
	        		return res.status(400).send("scraper died");
	    		}

	    		
		        //console.log("id ->" + id);
		        //console.log("current_price ->" + current_price);

		        var params = [Number(id), Number(current_price)];

		        bet.remove();
   
		        try {
		            await sc.payout(params, res);
		        }
		        catch (e) {
		        	console.error(e);
		        }
		         /*catch (error) {
		        	// console.log("sc payout err");
		        	console.error(error);
		            //return res.status(400).send(error);
		        }*/
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

	

}