var path = require('path');

const config = require('./appConfig.js');

//derp derp derp get config
/*if(config){

}*/

//singletons we're gonna use throughout the app lol someday
const redisClient = require(path.resolve('./lib/redis/redisConnection.js'));
const dbHelper = require(path.resolve('./lib/mongo/mongoHelper.js'));
const twilo = require(path.resolve('./lib/twilo/twiloHelper.js'));

//set up twilo
let twiloHelper = new twilo({});

const agenda = require(path.resolve('./lib/agenda/agendaHelper.js'));


const http = require('./http.js');