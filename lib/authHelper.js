
const path = require('path');
const redisClient = require(path.resolve('./redisConnection.js'));
const crypto = require('crypto');
const DB = require(path.resolve( './dbHelper.js') );
const {promisify} = require('util');
const getRedisAsync = promisify(redisClient.get).bind(redisClient);

class AuthHelper{

	constructor(){
		this.db = new DB();
	}

	generateKey() {
	    var sha = crypto.createHash('sha256');
	    sha.update(Math.random().toString());
	    return sha.digest('hex');
	}

	//first look for a session token, if there is one, get user by id
	//if there is no valid session token attempt username and password lookup,
	//or just return false who gives a fuck
	async auth(req){

		//you gotta have some sort of authentication you doof
		if(req.headers.sessiontoken == false && ( req.headers.username &&  req.headers.password ) == false){
			return false
		}

		//if they're sending us a sesstion token
		if(req.headers.sessiontoken){

			let validUser = await this.validateToken( req.headers.sessiontoken);

			if(validUser){
				return validUser;
			}

		}

		//else they better be sending us a valid username and pass
		let validUser = await this.db.validateUsernameAndPass( req.headers.username,  req.headers.password);

		if(!validUser){
			//you're not a valid user, maybe you should sign up?
			return false;
		}

		//we just got a valid user via username and pass but we need to
		//give them back a session token, so we gotta create one
		let newToken = this.generateKey();

		//we might as well make sure our token is unique
		let tokenLookup = await this.validateToken(newToken);

		if(tokenLookup){
			//lol what the fuck? 2 random people got the same keys
			console.log('we tried to generate a key that already exists... wtf?');

			//there is no way this can happen twice right?
			//TODO this is the wrong way to do this
			newToken = this.generateKey();
		}

		//set new token
		await redisClient.set(newToken, validUser.userid,  'EX', 604800);
		validUser.sessionToken = newToken;

		return validUser;
	}

	//fuck it can probably look up username and pass at same time.
	//seperate validation for user data won't come till wayyy later

	validateUsernameAndPass(username, pass){

		let users = {
			"test": "pass"
		}

		if(users[username] && users[username] === pass){

			//this username and password is valid. we should check to see if
			//it this user has a session token.  If they do we remove it
			//create a new one, save it and return it.

			//if they
			return true;
		}

		return false
	}

	async validateToken(sessionToken){

		let valid = await getRedisAsync(sessionToken).then(async (reply) =>{

		    if(reply){

	    		let foundUser = await this.db.getUserById(reply);

	    		if(!foundUser){
		    		console.log('oh no, we had a session for a user, but no user with that id was found.  Here is the user ID:', reply);
		    		return false;
		    	}
		    	return foundUser;

		    }

		    //just in case?
		    return false;
		})

		return valid
	}
}

module.exports = AuthHelper;