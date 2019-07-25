const asyncHandler = require('express-async-handler')

module.exports = (app) => {
    const payout = require('../controllers/payout.controller.js');

    // Create a new bet
    app.post('/payouts', asyncHandler(async (req, res, next) => {
    const bar = await payout.init(req, res);
    // res.send(bar);
    }));

}