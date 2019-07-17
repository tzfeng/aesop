function get(category, criteria) {
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('./temp.db');
	console.log('Connection opened');
	bets = new Array();

	db.serialize(() => {
    	db.all(`SELECT * FROM BetInfo WHERE ${category}=?`, [criteria], function(err, rows) {
        rows.forEach(function (row) {
        	bets.push(row.bet_id);
            console.log(row);
        	});
    	});
        db.close();
	});

	return bets;
}

let getArray = get('sector', 'tech');
console.log(getArray[0])

// module.exports = { getDatBitch };