const MongoClient = require('mongodb').MongoClient;
//TODO please insert a real config file here
const fakeConfig = {
	url: 'mongodb://127.0.0.1:27017',
	dbName: "gsd"
}

class DB {

	constructor(){

		this.connection = null;

	}

	connect(config){

		return new Promise(function(resolve, reject) {

			MongoClient.connect(fakeConfig.url, (err, database) =>{

				if(err){
					console.log('got a db connection error', err);
					reject(err);
				}

				resolve(database);
			});

		})
	}

	async getTasksByUserID(userid){

		let connection = await this.connect().then( db => {return db}, err => {console.log('got an err in connecting to db when getting tasks', err)} )
		let thisDB = connection.db(fakeConfig.dbName)
		let tasks = thisDB.collection('tasks');

		let allTasks = await tasks.find({'userid': userid}).toArray();
		return allTasks
	}

	//lets do a plain text lookup of username and password :
	//   ( ͡° ͜ʖ ͡ -)
	async validateUsernameAndPass(username, password){

		let connection = await this.connect().then( db => {return db}, err => {console.log('got an err in connecting to db when validating username and pass', err)} )
		let thisDB = connection.db(fakeConfig.dbName)
		let users = thisDB.collection('users');

		let user = await users.findOne({username: username, password: password})
		return user
	}

	async getUserById(userID){

		let connection = await this.connect().then( db => {return db}, err => {console.log('got an err in connecting to db when getting user by id', err)} )
		let thisDB = connection.db(fakeConfig.dbName)
		let users = thisDB.collection('users');

		let user = await users.findOne({'userid': userID});

		return user
	}

	async createNewTask(userid, task){

		let connection = await this.connect().then( db => {return db}, err => {console.log('got an err in connecting to db when adding a task', err)} )
		let thisDB = connection.db(fakeConfig.dbName);
		let tasks = thisDB.collection('tasks');

		let newtask = {...task};

		newtask.userid = userid

		let insert = await tasks.insertOne(newtask, { w: 1});

		return insert;
	}

	async trashTaskById(userid, taskid){
		let connection = await this.connect().then( db => {return db}, err => {console.log('got an err in connecting to db when adding a task', err)} )
		let thisDB = connection.db(fakeConfig.dbName);
		let tasks = thisDB.collection('tasks');
		console.log('args: ', userid, taskid)
		let insert = await tasks.findOneAndUpdate( {userid: userid, id:taskid}, { $set: { trashed: true } }, {upsert: false, returnNewDocument:true} );
		return insert.value;
	}
}

module.exports = DB;