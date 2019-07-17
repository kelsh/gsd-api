const path = require('path')
const endpointUrl = "redis-11260.c89.us-east-1-3.ec2.cloud.redislabs.com:11260"
const redisPass = require( path.resolve('./lib/redis/redisConfig.js'));

const redis = require("redis");
const redisClient = redis.createClient({
	host: "redis-11260.c89.us-east-1-3.ec2.cloud.redislabs.com",
	port: 11260,
	password: redisPass,
});

redisClient.on("error", function (err) {
    console.log("Redis fucked up" + err);
});

redisClient.on("connect", function () {
    console.log("Redis is connected ");

});

redisClient.on("ready", function () {

    let keys = redisClient.keys("*", (err, res)=>{

    	res.forEach( (key)=>{
    		let value = redisClient.get(key,  (err, res)=>{
    			console.log(key, res)
    		})

    	})
    })

});

redisClient.on("end", function () {
    console.log("Redis connection closed");
});

module.exports = redisClient;