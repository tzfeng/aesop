function insert(bet_id, exp, vote_exp, sector) {
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('./temp.db');
	console.log('Connection opened');

	db.serialize(() => {
		db.run("CREATE TABLE IF NOT EXISTS BetInfo (bet_id INTEGER, exp TEXT, vote_exp TEXT, sector TEXT)");
		console.log('Table created')

		var stmt = db.prepare("INSERT INTO BetInfo VALUES (?, ?, ?, ?)");
    	stmt.run(bet_id, exp, vote_exp, sector);
    	stmt.finalize();
    	console.log('Values inserted')

    	db.all(`SELECT * FROM BetInfo`, function(err, rows) {
        rows.forEach(function (row) {
            console.log(row);
        	});
    	});

        db.close();
	});
}

// module.exports = { insertDatBitch };

insert(1, 'yo', 'bro', 'tech');