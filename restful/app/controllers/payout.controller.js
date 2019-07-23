exports.init = async function(req, res) {

	const dateNow = new Date();

	// for everything in database with exp date now:

	db.collection.find({}, { date: dateNow })

}