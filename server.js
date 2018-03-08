'use strict';   
    
var admin = require('firebase-admin');
var nodemailer = require('nodemailer');
const browserify = require('browserify-middleware');
const glslify = require('glslify');
var express = require('express');
var app = express()
    .use('/js', browserify('./client', {transform: [glslify]}))
    .use(express.static('public'));
var http = require('http').Server(app);
var io = require('socket.io')(http); 
var serverStartTime = Math.floor(new Date() / 1);

var mailTemplates = require('./mail-templates.json');
 
/*
 * USE EITHER SendGrid OR GMAIL for Notifications NOT BOTH
 *
 * SendGrid is set-up as default. 
 * If you are going to use GMAIL, comment out lines 
 * 22,23 and uncomment lines 27-35 , 37-43
*/
// using SendGrid's v3 Node.js Library 
// https://github.com/sendgrid/sendgrid-nodejs
const mail = require('@sendgrid/mail');
mail.setApiKey(process.env.SENDGRID_API_KEY);

// Configure the email transport using the default SMTP transport and a GMail account.
// See: https://nodemailer.com/
// var mail = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true, // true for 465, false for other ports
//         auth: {
//             user: process.env.GMAIL_ADDRESS,
//             pass: process.env.GMAIL_PASSWORD
//         }
//     });     
// verify connection configuration  
// mail.verify(function(error, success) {
//    if (error) {
//         console.log(error);
//    } else {
//         console.log('Server is ready to take our messages');
//    }     
// });

// Tell Socket.io to start accepting connections
// 1 - Keep a dictionary of all the players as key/value 
var members = {};
io.on('connection', function(socket){
    console.log("New member has connected with socket id:",socket.id);
    socket.on('new-member',function(state_data){ // Listen for new-member event on this client 
      console.log("New member has state:",state_data);
      // 2 - Add the new player to the dict
      members[socket.id] = state_data;
      // Send an update event
      io.emit('update-members',members);
    })
  
    socket.on('getSettings',function(){
      console.log('getting settings for client');
      io.sockets.emit("setMusic",currentMusic || "195090745");
      io.sockets.emit("setSignContent",currentSignContent || "Node-RED instance is down for maintanance. Please try again later. @SirFizX_ELHS");
      io.sockets.emit("setSkyColor",currentSkyColor || "blue");
      io.sockets.emit("setBuzz",currentBuzz || "false");
    });
    
    socket.on('sendFBData',function(data){
      socket.uid = data.uid;
      socket.email = data.email;
      console.log(`Received member's Google Firebase UID of ${data.uid}`);
      console.log(`Received member's email of ${data.email}`);  
    });  
  
    socket.on('addBoard',function(data){
      let boards={};
      boards[data.board] = true;
      console.log(`Adding ${data.board} to user boards.`);
      updateUserData(socket.uid,'data/boards',boards);
    });
  
    socket.on('tq',function(data){
      sendThankYouEmail(socket.email,'thankyou');
    });
  
    socket.on('disconnect',function(){
      // 3- Delete from dict on disconnect
      delete members[socket.id];
      // Send an update event 
      io.emit('update-members',members);
    })
  // Realtime member data throughput (i.e. chat text...)
    socket.on('send-update',function(data){
      if(members[socket.id] == null) return;
      members[socket.id].text = data.text;
      io.emit('update-members',members);
    })
  
})

// [START initialize Firebase]
// Initialize the app with a service account, granting admin privileges       
admin.initializeApp({
  credential: admin.credential.cert({
    "projectId": process.env.PROJECT_ID,
    "clientEmail": process.env.CLIENT_EMAIL,
    "privateKey": process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
  }), 
  databaseURL: 'https://'+process.env.PROJECT_ID+'.firebaseio.com'
});
// [END initialize Firebase]
    
// Set our simple Express server to serve up our front-end files
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

// This function is not used. It remains as an example for Timestamp and multiple updates at once.
function updateLastActiveUser(uid){
  var update = {};
  update['/users/' + uid + '/data/lastActive'] = admin.database.ServerValue.TIMESTAMP;
  update['/users/lastActive'] = uid;
  admin.database().ref().update(update);
}
/**
 * Update user data on Firebase
 */
// [START single_value_read]
function updateUserData(uid,path,value) {
  var userRef = admin.database().ref('/users/' + uid + '/' + path);
  console.log(`Firebase user reference obtained for ${uid}`);
  userRef.update(value).catch(function(error) {
    console.log('Failed to update user Firebase:', error);
  });
}   
// [END single_value_read]
/**
 * Send mail to user
 */  
function sendThankYouEmail(email,type) {
  console.log(`Attempting email to ${email}`);
  var mailOptions = mailTemplates[type];
  mailOptions.to = email;
  //console.log(mailOptions);
  return mail.send(mailOptions).then(function() {
    console.log('New thank you email sent to: ' + email);
  }).catch(function(e){
    console.log(e);
  });
} 
// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var signDataRef = db.ref("share/sign");
var skyDataRef = db.ref("share/sky");
var musicDataRef = db.ref("share/music");
var buzzDataRef = db.ref("share/buzz");
var currentSignContent,
    currentSkyColor,
    currentMusic,
    currentBuzz;

// Attach an asynchronous callback to read the data at our posts reference
signDataRef.on("value", function(snapshot) {
  let v = snapshot.val();
  v = v.replace('#elhsgamedev','');
  v = v.replace('sign','');
  console.log(v);
  io.sockets.emit("setSignContent",v);
  currentSignContent = v;
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

skyDataRef.on("value", function(snapshot) {
  let v = snapshot.val();
  console.log(v);
  io.sockets.emit("setSkyColor",v);
  currentSkyColor = v;
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
 
musicDataRef.on("value", function(snapshot) {
  let v = snapshot.val();
  console.log(v);
  io.sockets.emit("setMusic",v);
  currentMusic = v;
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

buzzDataRef.on("value", function(snapshot) {
  let v = snapshot.val();
  console.log(v);
  io.sockets.emit("setBuzz",v);
  currentBuzz = v;
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
}); 

/**
 * Illustrates firebase-admin access to all of database.
 * Note: grabbing the entire database state should not
 * be done routinely. Database references should be made as
 * narrow as possible.
 */ 
// var rootRef = admin.database().ref('/');
// rootRef.once('value').then(function(d){
//   console.log(d.val());
// })
// .catch(function(e){console.log(e)});
// Listen for http requests
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});