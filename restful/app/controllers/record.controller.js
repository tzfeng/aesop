/*const Record = require('../models/record.model.js');
const sc = require('../sc/sc.js');

exports.create = async function(req, res) {

	// Validate request
    if(!req.body.address) {
        return res.status(400).send({
            message: "address can not be empty"
        });
    }

    // Create a record
    const record = new Record({
        title: "oh no", 
        _id: req.body.address || 'Invalid address',
        bets: null,
        results: null,
        net: null		
    });

    // Save bet in the database
    record.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the record."
        });
    });

};

// Find a single bet with a betId
exports.findOne = (req, res) => {
    Bet.findById(req.params.address)
    .then(record => {
        if(!bet) {
            return res.status(404).send({
                message: "record not found with address " + req.params.address
            });            
        }
        res.send(record);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "record not found with address " + req.params.address
            });                
        }
        return res.status(500).send({
            message: "Error retrieving record with address " + req.params.address
        });
    });
};

exports.update = async function(req, res) {
	    // Validate Request
    if(!req.body.address) {
        return res.status(400).send({
            message: "bet address can not be empty"
        });
    }

    const params = [ req.body.address ];

    let val = await sc.record(params, null);
    console.log(JSON.stringify(val));

    // Find bet and update it with the request body
    Payout.findByIdAndUpdate(req.params.address, {
        bet: Array(val[0]),
        results: Array(val[1]),
        net: Array(val[2])
    }, {new: true})
    .then(record => {
        if(!record) {
            return res.status(404).send({
                message: "record not found with address " + req.params.address
            });
        }
        res.send(bet);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "record not found with address " + req.params.address
            });                
        }
        return res.status(500).send({
            message: "record updating bet with address " + req.params.address
        });
    });
}*/