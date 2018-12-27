var express = require('express');
var router = express.Router();
var path = require('path');
var DB = require(path.resolve( './dbHelper.js') );

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
router.get('/:userid', async (req, res, next)  => {

	let userid =  req.params.userid
	try{
		let dbConnection = new DB;
		let queryTasks = await dbConnection.getTasksByUserID(userid);

		res.json(queryTasks);
	}

	catch(e){
		console.log('error in getting tasks', e)
		res.json('fail');
	}

	next();
});

/* create new task for user. */
router.post('/:userid', async (req, res, next)  => {

	console.log('attempting to post with body params: ', req.body)
	let userid =  req.params.userid
	try{
		let dbConnection = new DB;
		let newTask = req.body;
		let queryTasks = await dbConnection.createNewTask(userid, newTask);

		res.status(200);
		res.json(newTask)
		res.end();
	}

	catch(e){
		console.log('error in getting tasks', e)
		res.json('fail');
		res.end();
	}

	next();
});

/* create new task for user. */
router.delete('/:userid/:taskid', async (req, res, next)  => {

	console.log('attempting to delete with body params: ', req.params)
	let userid =  req.params.userid
	let taskid =  parseInt(req.params.taskid)

	try{
		let dbConnection = new DB;
		let newTask = req.body;
		let udpateTask = await dbConnection.trashTaskById(userid, taskid);
		console.log('this is my updated task: ', udpateTask)
		if(udpateTask){
			res.status(200);
			res.json(udpateTask)
			res.end();
		}
	}

	catch(e){
		console.log('error in getting tasks', e)
		res.json('fail');
		res.end();
	}

	next();
});


module.exports = router;
