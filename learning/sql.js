var sqlite3 = require('sqlite3').verbose();
var db;

bet = 1;
exp = 'tn';
vote = 'soon';
sect = 'tech';
key = 'industry';

function openDB() {
	db = new sqlite3.Database(':memory:', openTable(), (err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Connected to in-memory database');
	});
}

function openTable() {
	db.run('CREATE TABLE IF NOT EXISTS BetInfo (bet_id INTEGER, exp TEXT, vote_exp TEXT, industry TEXT)', insert(), (err) => {
			if (err) {
				return console.error(err.message);
			}
	});
}

function insert() {
	var stmt = db.prepare(`INSERT INTO BetInfo VALUES(?, ?, ?, ?)`);
	stmt.run(`(${bet}, ${exp}, ${vote}, ${sect})`);
	stmt.finalize(get(key, sect));
}

function get() {
	let sql = `SELECT bet_id 
			   FROM BetInfo
			   WHERE ${key} = ${sect}`;


	db.all(sql, (err, rows) => {
		if (err) {
	    	throw err;
	  	}
	  	rows.forEach((row) => {
	    	console.log(row.id + ' : ' + row.bet_id);
	  	});
	});
	closeDB();
}

function closeDB() {
	db.close((err) => {
	  	if (err) {
	    	return console.error(err.message);
	  	}	
	});
}

function wholeThing() {
	openDB();
}

wholeThing();
