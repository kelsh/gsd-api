const MongoClient = require('mongodb').MongoClient;
//TODO please insert a real config file here
const fakeConfig = {
	url: 'mongodb://127.0.0.1:27017',
	dbName: "gsd"
}

class DB {

	constructor(){

		this.connection = null;

		this.allowedUpdateFields = [
			"completed",
			"trashed",
			"desciption",
			"userDefinedName",
			"userDefinedCompletionDate",
			'subtasks',
			'options',
			'topic'
		];

		this.allFields=[
			"type",
			"id",
			"userDefinedName",
			"lastModified",
			"modificationHistory",
			"completed",
			"trashed",
			"completedDate",
			"userDefinedCompletionDate",
			"subtasks",
			"options",
			"topic",
			"description",
			"created",
			"userid"
		];

		this.nestedTaskFields = [
			"modificationHistory",
			"subtasks",
			"options"
		]

		this.immutableFields = [
			"created",
			"modificationHistory",
			"id",
			"type",
			"userid"
		]

		this.taskOptionFields = [
			"callsEnabled",
			"emailEnabled",
			"interactionNag",
			"facebookEnabled"
		]

		this.subTaskFields =[
			"type",
          "userDefinedName",
          "description",
          "topic",
          "created",
          "trashed",
          "completedDate",
          "userDefinedCompletionDate"
		]
	}

	//if the user wants to update a task, make sure they
	//only update an allowed fields.
	//takes an object that represents changes to be made to the task in the db
	//returns to the caller an object with just the allowed fields
	getUpdateAllowedFields(task){

		let updatedObj = {}
		let taskKeys= Object.keys(task);

		taskKeys.forEach((key)=>{

			if( this.allowedUpdateFields.includes(key) ){
				updatedObj[key] = task[key]
			}

		});

		return updatedObj
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

		//schedule new tasks

		let insert = await tasks.insertOne(newtask, { w: 1});

		return insert;
	}

	async trashTaskById(userid, taskid){
		let connection = await this.connect().then( db => {return db}, err => {console.log('got an err in connecting to db when adding a task', err)} )
		let thisDB = connection.db(fakeConfig.dbName);
		let tasks = thisDB.collection('tasks');
		console.log('args: ', userid, taskid)


		//schedule tasks based on whats updated
		let originalDocument = await tasks.findOne( {userid: userid, id:taskid} );



		let insert = await tasks.findOneAndUpdate( {userid: userid, id:taskid}, { $set: { trashed: true } }, {upsert: false, returnNewDocument:true} );
		return insert.value;
	}

	async updateTaskById(userid, taskid, task){

		console.log('updating task with: ', this.getUpdateAllowedFields(task));

		let connection = await this.connect().then( db => {return db}, err => {console.log('got an err in connecting to db when adding a task', err)} )
		let thisDB = connection.db(fakeConfig.dbName);
		let tasks = thisDB.collection('tasks');

		//add in a comparison function here.
		//schedule tasks based on whats updated
		let originalDocument = await tasks.findOne( {userid: userid, id:taskid} );

		console.log('got differences: ', this.getDifferenceBetweenTasks(originalDocument, task));

		let insert = await tasks.findOneAndUpdate( {userid: userid, id:taskid}, { $set: this.getUpdateAllowedFields(task) }, {upsert: false, returnNewDocument:true} );
		return insert.value;

	}

	//we have a couple nested fields, and we got a couple special fields.
	//this function takes the old and new tasks, and gives you an array
	//of keys that have different values between the two
	getDifferenceBetweenTasks(oldTask, newTask){

		let changedFields = this.allFields.filter((field)=>{

			if(oldTask.hasOwnProperty(field) === false || newTask.hasOwnProperty(field) === false){

				console.log("oh fuck, we dun goofed or this is a subtask")
			}

			if(field === "options"){

				let optionsFields = this.taskOptionFields.filter((optionField)=>{

					if(oldTask.options[optionField] !== newTask.options[optionField]){

						return true;
					}

					return false;
				});

				if(optionsFields.length > 0){
					return true;
				}

				return false;
			}

			if(field === "subtasks"){

				return false
			}

			if(this.immutableFields.includes(field)){

				if(oldTask[field] !== newTask[field]){

					console.log("we got a real fucked up task over here, someone is trying to change an immutableFields.  Field, taskid: ", field, oldTask.id);
					return false;
				}
			}

			if(oldTask[field] !== newTask[field]){

				return true;
			}
		})

		let changedFieldsObj =  changedFields.map((field)=> { return {field: field, old: oldTask[field], new: newTask[field] }})
		let changedSubTasksObj = this.getDifferenceBetweenSubTasks(oldTask, newTask);

		let returnObj = {}

		if(changedFieldsObj){
			returnObj.changedFieldsObj = changedFieldsObj;
		}
		if(changedSubTasksObj.changed.length > 0 || changedSubTasksObj.deleted.length > 0 || changedSubTasksObj.created.length > 0){
			returnObj.changedSubTasksObj = changedSubTasksObj;
		}

		if(returnObj){
			return returnObj
		}

		return false;
	}

	getDifferenceBetweenSubTasks(oldTask, newTask){

		let returnObj = {

			deleted:[],
			created:[],
			changed:[]
		}

		let oldTaskSubTaskIds = oldTask.subtasks.map( (subtask) => { return subtask.id });
		let newTaskSubTaskIds = newTask.subtasks.map( (subtask) => { return subtask.id });

		oldTaskSubTaskIds.forEach( (subTaskId) => {

			if( newTaskSubTaskIds.includes(subTaskId) === false){
				//looks like we deleted this subtask
				returnObj.deleted.push(subTaskId);
			}
		})

		newTaskSubTaskIds.forEach( (subTaskId) => {

			if( oldTaskSubTaskIds.includes(subTaskId) === false){
				//looks like we deleted this subtask
				returnObj.created.push(subTaskId);
			}
		})

		oldTask.subtasks.forEach((subtask)=>{

			if( returnObj.deleted.includes(subtask.id) === false && returnObj.created.includes(subtask.id) === false){

				let oldSubTaskId = subtask.id
				let newSubTaskObj = newTask.subtasks.find((subtask)=>{return subtask.id === oldSubTaskId})

				if(!newSubTaskObj){
					return;
				}

				Object.keys(subtask).forEach((key)=>{

					if(subtask[key] !== newSubTaskObj[key]){
						returnObj.changed.push({id: oldSubTaskId, key: key, value: newSubTaskObj[key] })
					}
				})
			}
		})

		return returnObj;
	}
}

module.exports =  DB;