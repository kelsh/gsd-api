//this should take config params and return an agenda
//instance with job processors.
const path = require('path');
const Agenda = require('agenda');
const agendaConfig = require('./agendaConfig');


const twilo = require(path.resolve('./lib/twilo/twiloHelper.js'));

class AgendaHelper {

	//needs a twiloHelper, is this bad boudnries?!?! , options object
	constructor(twiloHelper, options = null){

		this.agendaConfig = agendaConfig;

		//override defaults with options
		if(options){
			Object.keys(options).forEach((key)=>{
				if(this.agendaConfig.hasOwnProperty(key)){
					this.agendaConfig[key] = options[key]
				}
			})
		}

		this.agenda = new Agenda({
			db: {
				address: this.agendaConfig.address,
				collection: this.agendaConfig.collection
			},
			processEvery:this.agendaConfig.processInterval,
			maxConcurrency: this.agendaConfig.maxConcurrency,
			defaultConcurrency: this.agendaConfig.defaultConcurrency,
			lockLimit: this.agendaConfig.lockLimit,
			defaultLockLifetime: this.agendaConfig.defaultLockLifetime
		});

		if(!options || !options.isProduction){
			this.isProduction = false;
		}

		this.twilo = new twilo({
			isProduction: this.isProduction
		})

		this.agenda.define('sendText', (job, done) => {
			this.sendText( (data) => {
				formatThatData(data);
				sendThatData(data);
				done();
			});
		});

		this.agenda.define('sendCall', (job, done) => {
			sendCall(data => {
				formatThatData(data);
				sendThatData(data);
				done();
			});
		});

		this.agenda.define('sendFb', (job, done) => {
			sendFacebookMessage(data => {
				formatThatData(data);
				sendThatData(data);
				done();
			});
		});

		this.agenda.define('sendEmail', (job, done) => {
			sendEmail(data => {
				formatThatData(data);
				sendThatData(data);
				done();
			});
		});
	}

	//body{string}, to{string}, sender{string}
	async sendText(data){

		let body = data.body;
		let to = data.to;
		let sender = data.sender ? data.sender : null;


		let messageSent = await this.twilo.sendText(body, to, sender);

		if(messageSent){
			console.log('successfully sent message')
		}else{
			//requre? fail job?
		}
	}


};

module.exports = new AgendaHelper;