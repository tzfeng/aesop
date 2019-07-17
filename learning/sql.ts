const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(':memory:', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to in-memory database');
});

db.close((err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connection closed');
});