const Bet = require('../models/bet.model.js');
const sc = require('../sc/sc.js');
const scrape = require('../scrape/scraper.ts');
const sync_block = require('../sync/sync_block.js');

// const sync = require('../../sync/sync_block.js');
// const sc = require('../../node_modules/ontology-ts-sdk/')

// Create and Save a new bet
exports.create = async function(req, res) {

	// Validate request
    if(!req.body.address) {
        return res.status(400).send({
            message: "bet add can not be empty"
        });
    }

    // scrape price
    let init_price1 = -1;
    try { init_price1 = 11; // await scrape.scrapePrice("AAPL");
    //console.log(init_price1);
    }
    catch (error) {
        return res.status(400).send("scraper died");
    }

    // scrape sector
    let sect1 = "unrendered";
    try { sect1 = "strings"; // await scrape.scrapeSect("AAPL");
    //console.log(sect1);
    }
    catch (error) {
        return res.status(400).send("scraper died");
    }
    
    // SC
       const params = [ req.body.address,
          req.body.amount_staked,
          req.body.ticker,
          req.body.sign,
          req.body.margin,
          req.body.date,
          init_price1];
   
    let val = await sc.create_bet(params, null);
    console.log(JSON.stringify(val));

    // Create a bet
    const bet = new Bet({
        title: "oh no", 
        _id: Number(val[0]) || -404,
        ticker: val[1] || 'Invalid ticker',
        change: Number(val[2]) || -404,
        target_price: Number(val[3]) || -404,
        date: val[4] || 'Invalid date',
        for_staked: Number(val[5]),
        against_staked: Number(val[6]),
        for_avg_rep: Number(val[7]),
        against_avg_rep: Number(val[8]),
        prob: Number(val[9]),
        sector: sect1
    });

    // Save bet in the database
    bet.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the bet."
        });
    });

};

// Retrieve and return all bets from the database.
exports.findAll = (req, res) => {
    Bet.find()
    .then(bets => {
        res.send(bets);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving bets."
        });
    });
};

// Find a single bet with a betId
exports.findOne = (req, res) => {
    Bet.findById(req.params.betId)
    .then(bet => {
        if(!bet) {
            return res.status(404).send({
                message: "bet not found with id " + req.params.betId
            });            
        }
        res.send(bet);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "bet not found with id " + req.params.betId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving bet with id " + req.params.betId
        });
    });
};

// Update a bet identified by the betId in the request
exports.update = async function(req, res) {
    // Validate Request
    if(!req.body.betId) {
        return res.status(400).send({
            message: "bet address can not be empty"
        });
    }


    const params = [ req.body.betId,
    req.body.address,
    req.body.amount_staked,
    req.body.for_against ];

    let val = await sc.vote(params, null);
    console.log(JSON.stringify(val));
    console.log(req.params.betId);

    // Find bet and update it with the request body
    Bet.findByIdAndUpdate(req.params.betId, {
        for_staked: Number(val[5]),
        against_staked: Number(val[6]),
        for_avg_rep: Number(val[7]),
        against_avg_rep: Number(val[8]),
        prob: Number(val[9]),
    }, {new: true})
    .then(bet => {
        if(!bet) {
            return res.status(404).send({
                message: "bet not found with id " + req.params.betId
            });
        }
        res.send(bet);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "bet not found with id " + req.params.betId
            });                
        }
        return res.status(500).send({
            message: "Error updating bet with id " + req.params.betId
        });
    });
};

// Delete a bet with the specified betId in the request
exports.delete = (req, res) => {
    bet.findByIdAndRemove(req.params.betId)
    .then(bet => {
        if(!bet) {
            return res.status(404).send({
                message: "bet not found with id " + req.params.betId
            });
        }
        res.send({message: "bet deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "bet not found with id " + req.params.betId
            });                
        }
        return res.status(500).send({
            message: "Could not delete bet with id " + req.params.betId
        });
    });
};
