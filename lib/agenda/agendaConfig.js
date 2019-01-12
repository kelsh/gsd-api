
const agendaConfig = {
	address : 'mongodb://127.0.0.1/agenda',
	collection : "scheduledTasks",
	processInterval : "1 minute",
	maxConcurrency : 20,
	defaultConcurrency  : 5,
	lockLimit : 0, //infinte
	defaultLockLifetime : 120000
	//isProduction : process.env.isProduction
}

module.exports = agendaConfig;