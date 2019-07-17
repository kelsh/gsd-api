//this should take config params and return a twilo
//instance with helper methods.

const twiloConfig = require("./twiloConfig.js")
const authToken = twiloConfig.prodTwiloConfig.authToken;
const sid = twiloConfig.prodTwiloConfig.sid;
const client = require('twilio')(sid, authToken);

module.exports = class TwiloHelper{

	//takes options object
	constructor(options){

		this.twiloConfig = twiloConfig;

		//override defaults with options
		if(options){
			Object.keys(options).forEach((key)=>{
				if(this.twiloConfig.hasOwnProperty(key)){
					this.twiloConfig[key] = options[key]
				}
			});
		}

		this.isProduction = options && options.isProduction ? options.isProduction : false ;

		//we only have production and dev configs
		if(this.isProduction){

			this.authToken = this.twiloConfig.prodTwiloConfig.authToken;
			this.sid = this.twiloConfig.prodTwiloConfig.sid;
		}
		else{

			this.authToken = this.twiloConfig.devTwiloConfig.authToken;
			this.sid = this.twiloConfig.devTwiloConfig.sid;
		}

		this.client = require('twilio')(sid, authToken);

	}

	async sendText(body, to, sender = null){

		return new Promise( (resolve, reject) =>{
			//dont set sender to random numbers lol
			if(!sender && !this.twiloConfig.ownedPhoneNumbers.includes(sender)){
				sender = this.twiloConfig.ownedPhoneNumbers[0];
			}

			try{
				client.messages.create({
					body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
					from: this.twiloConfig.ownedPhoneNumbers[0],
					to: // redacted phone number
				})
				.then(
					(message) => { resolve( message ) }
				)
				.done();
			}
			catch(e){
				reject(e);
			}

		});
	}

	async sendCall(url, to, sender = null){

		return new Promise( (resolve, reject) =>{
			//dont set sender to random numbers lol
			if(!sender && !this.twiloConfig.ownedPhoneNumbers.includes(sender)){
				sender = this.twiloConfig.ownedPhoneNumbers[0];
			}

			try{
				client.calls.create(
				{
					url: url,
					to: to,
					from: sender
				})
				.then(call => console.log(call.sid))
				.done();
			}
			catch(e){
				reject(e);
			}

		});
	}
}