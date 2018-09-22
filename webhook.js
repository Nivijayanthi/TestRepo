var express = require('express'),
  app = express(),
  http = require('http'),
  httpServer = http.Server(app),
  session = require('express-session');
const crypto = require('crypto');
var router = express.Router();
var moment = require('moment');
var momentTz = require('moment-timezone');
var dbs = require('./db');
var MicrosoftGraph = require("@microsoft/microsoft-graph-client");
var authHelper = require('./helper');

var dateUTC = moment().utc().format()
let startdate = dateUTC;
let enddate = moment().add(15, 'minutes').utc().format();
console.log(startdate);
console.log(enddate);
var bodyParser = require('body-parser');
var fs = require('fs');
const requestAPI = require('request');
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ 
  extended: true
}));


var jsonIncompleteTran = [];


app.get('/', function (req, res) {
  res.send("/richowebsites");
});
app.post("/webhook",async (req,res)=>{
  var options = {
    url: "https://api.dialogflow.com/v1/query?v=20150910",
    method: "POST",
    headers: { 'Authorization': 'Bearer ' + '072373aef15e4eeba755d991e20ab919', 'Content-Type': 'application/json'},
    body: req.body,
    json: true
  };
  await requestAPI(options, function (error, response, body) {
   res.send(body);
  });
})



app.get('/auth', function (req, res) {
  let parms = {};
  parms.signInUrl = authHelper.getAuthUrl();
  res.redirect(parms.signInUrl);
});
app.get('/authorize', async function (req, res, next) {
  const code = req.query.code;
  if (code) {
    let token;
    try {
      token = await authHelper.getTokenFromCode(code);
      res.redirect('chatwindow?token=' + token);
    } catch (error) {
      res.send('error', JSON.stringify({
        error: error
      }));
    }
  } else {
    res.send('Authorization failed');
  }

});
app.post('/updateSessionState', function (req, res) {
  callServiceNowApi("https://p3ep1jeoz4.execute-api.us-east-1.amazonaws.com/Dev/updatesession", {
    type: req.body.params,
    sessionID: req.body.sessionId,
  }, "POST", function (err, data) {

    res.send(data);
  })
})
app.get('/chatwindow', function (req, res) {
    res.sendfile(__dirname + '/chatwindow1.html');

});
app.get('/chat', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

function callServiceNowApi(url, dataService, type, callback) {
  try {
    const header = {
      'Cache-Control': 'no-cache',
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    var options = {
      url: url,
      method: type,
      header: header,
      body: dataService,
      json: true,
      auth: {
        user: "admin",
        password: "pj10GXYsUTej"
      }
    };

    requestAPI(options, function (error, response, body) {
      if (error) {
        callback(error, null)
      } else {
        callback(null, body);
      }
    });
  } catch (err) {
  }
};
app.listen(process.env.PORT || 9000);
