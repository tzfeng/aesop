// const Payout = require('../models/payout.model.js');
const scrape = require('../scrape/scraper.ts');
const sc = require('../sc/sc2.js');
const sched = require('node-schedule');
const moment = require('moment');
const Bet = require('../controllers/bet.model.js')

exports.init = async function(req, res) {

	var payout_check = schedule.scheduleJob('30 0 0 * * *', () => {
		const now = moment().format('YYYY-MM-DD');

		// for everything in database with exp date now
		payout_bets = Bet.find({ date: now }, (err, bets) => {
			if (err) return console.error(err);
			console.log(bets);
		});
		for (let bet in payout_bets) {
			id = bet['betID'];
			ticker = bet['ticker'];

			let current_price = -1;
    		try { current_price = await scrape.scrapePrice(ticker);
    		console.log(current_price);
    		}
    		catch (error) {
        		return res.status(400).send("scraper died");
    		}

    		const params = [{ type: 'Integer', value: id },
	          				{ type: 'Integer', value: current_price }];

	        try {
	            const payout = await payout(params);
	        } catch (error) {
	            return response.status(400).send(error);
	        }
		}
		Bet.deleteMany(bets);

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
