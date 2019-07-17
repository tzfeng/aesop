function del(expiry) {
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('./temp.db');
	console.log('Connection opened');

	db.serialize(() => {
    	db.all(`DELETE FROM BetInfo WHERE exp=?`, [expiry]);
	});
}

del('yo');

// module.exports = { deleteDatBitch };