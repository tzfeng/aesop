// const Payout = require('../models/payout.model.js');
const scrape = require('../scrape/scraper.ts');
const sc = require('../sc/sc.js');
const schedule = require('node-schedule');
const moment = require('moment');
const Bet = require('../models/bet.model.js');
const Payout = require('../models/payout.model.js');

exports.init = async function(req, res) {

		//const now = moment().format('YYYY-MM-DD');
		const now = "01-01-2019";

		// for everything in database with exp date now
		Bet.find({ date: now }, async(err, payout_bets) => {
			// console.log("payout is running .. ");

			if (err) return console.log("beginning of payout " + err);

			if (payout_bets.length == 0) console.log("no bets that match");
		
			for (let bet of payout_bets) {

				var id = bet['_id'];
				console.log(id);

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

		        var params = [id, Number(current_price)];		        
   
		        try {
		            var bet_result = await sc.payout(params, null);
		        }
		        catch (e) {
		        	console.log("bet_result await sc payout")
		        	console.error(e);
		        	process.exit(0);
		        }

		        const payout = new Payout({
	        		betId: id,
					ticker: bet['ticker'],
					change: Number(bet['change']),
					target_price: Number(bet['target_price']),
					date: bet['date'],
				 	for_staked: Number(bet['for_staked']),
				 	against_staked: Number(bet['against_staked']),
				 	for_avg_rep: Number(bet['for_avg_rep']),
				 	against_avg_rep: Number(bet['against_avg_rep']),
				 	prob: Number(bet['prob']),
					sector: bet['sector'],
					result: bet_result
		        });

		        await bet.remove();

    // Save bet in the database
			    payout.save()
			    .then(data => {
			        // res.send(data);
			    }).catch(err => {
			    	throw err;
			        /*res.status(500).send({
			            message: err.message || "Some error occurred while creating the bet."
			        });*/
			    });
			    
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

// Retrieve and return all expired bets from the database.
exports.findAll = (req, res) => {
    Payout.find()
    .then(payouts => {
        res.send(payouts);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving expired bets."
        });
    });
};