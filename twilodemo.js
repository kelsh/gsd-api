var path = require('path');

const twilo = require(path.resolve('./lib/twilo/twiloHelper.js') );
let url = 'https://handler.twilio.com/twiml/EH179259e0f23b47e9ad079b630e6e1cee';

let a = new twilo();
let d = [
"17204128694",
"13038882729"
]
d.forEach((number)=>{ a.sendCall(url, number)})
