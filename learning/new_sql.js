var sqlite3 = require('sqlite3').verbose();
var db;

function createDb() {
    db = new sqlite3.Database(':memory:', createTable);
}


function createTable() {
    db.run("CREATE TABLE IF NOT EXISTS BetInfo (bet_id INTEGER, exp TEXT, vote_exp TEXT, sector TEXT)", 
    	insertRow);
}

function insertRow() {
    var stmt = db.prepare("INSERT INTO BetInfo VALUES (?, ?, ?, ?)");

    stmt.run(1, 'now', 'tn', 'tech');

    stmt.finalize(read);
}

function read() {
	let string = 'sector';
    db.all(`SELECT bet_id, sector FROM BetInfo where ${string}=?`, ['tech'], function(err, rows) {
        rows.forEach(function (row) {
            console.log(row.bet_id + ' : ' + row.sector);
        });
        closeDb();
    });
}

function closeDb() {
    db.close();
}

function runAll() {
    createDb();
}

runAll();
