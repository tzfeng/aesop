const mongoose = require('mongoose');

// address, amt_staked, ticker, sign, margin, time
const BetSchema = mongoose.Schema({
	address: String,
	amount_staked: Number,
	ticker: String,
	sign: Number,
	margin: Number,
	date: String,
	init_price: Number,
	sector: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Bet', BetSchema);