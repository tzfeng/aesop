// const Payout = require('../models/payout.model.js');
const scrape = require('../scrape/scraper.ts');
const sc = require('../sc/sc2.js');
const sched = require('node-schedule');

exports.init = async function(req, res) {

	var payout_check = schedule.scheduleJob('16 * * * * ', () => {
		const now = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0, 0);

		// for everything in database with exp date now
		payout_bets = db.collection.find({ date: now });
		for (let bet in payout_bets) {
			id = bet['betId'];
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

	        db.collection.deleteOne({betId : id});
		}

		vote_bets = db.collection.find({vote_date: now});
		for (let bet in vote_bets) {
			// do something to remove voting functionality
			// maybe display that the voting period has elapsed on frontend
		}

	});

}
