var express = require('express');
var router = express.Router();
var path = require('path');
var DB = require(path.resolve( './databaseConnection.js') );

const AuthHelper = require(path.resolve("./lib/authHelper.js"));
const authHelper = new AuthHelper();

router.get('/', function(req, res, next) {

	authHelper.auth(req).then((validUser)=>{

		if(validUser){
			next();
		}
		else{
			res.json('nah')
		}
	});

});

/* GET users listing. */
router.get('/', async (req, res, next)  => {
	console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
	req.connection.on('close',function(){
	  // code to handle connection abort
	  console.log('user cancelled');
	});

	try{
		let dbConnection = new DB;
		let queryTasks = await dbConnection.getTasks();

		res.json(queryTasks);
	}

	catch(e){
		console.log('error in getting tasks', e)
		res.json('fail');
	}


});

module.exports = router;
