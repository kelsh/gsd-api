const express = require('express');
const router = express.Router();
const path = require('path');

const AuthHelper = require(path.resolve("./lib/auth/authHelper.js"));
const authHelper = new AuthHelper()


/* GET users listing. */
router.get('/', function(req, res, next) {

	authHelper.auth(req).then((validUser)=>{

		if(validUser){
			res.json(validUser);
		}
		else{
			console.log("what the fuck", validUser)
			res.json('nah dduuuuuuudeee           '+validUser)
			res.end();
		}
	});


});

module.exports = router;
