'use strict';
// Just to remove error indicators in Glitch editor
var firebase = window.firebase;
var io = window.io;
// Shortcuts to DOM Elements.
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var userInfo = document.getElementById('user-ids');
var splashPage = document.getElementById('page-splash');
var gamePage = document.getElementById('page-game');
var listeningFirebaseRefs = [];
/**
 * Starts listening for changes to database references
 */
// [START adding db listeners]
function startDatabaseQueries() {
  // certain database references will require uid in path
  var myUserId = firebase.auth().currentUser.uid;
  // Email may also be accessed this way if needed
  //var myEmail = firebase.auth().currentUser.email;
  // Listen for changes to share node in database
  //var shareRef = firebase.database().ref('share/')
  //shareRef.on('value', function(snapshot) {
    //doSomethingWithNewValue(snapshot.val());
  //});
  // Keep track of all Firebase ref(s) we are listening to.
  // listeningFirebaseRefs.push(shareRef);
}
// [END adding db listeners]
/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId + '/profile').set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}
// [END basic_write]

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  userInfo.innerHTML = '';
  listeningFirebaseRefs.forEach(function(ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

function userExistsCallback(user, exists) {
  if (exists) {
    
  } else {
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    socket.emit('tq');
  }
}

function checkIfUserExists(user) {
  var usersRef = firebase.database().ref('users/' + user.uid + '/profile');
  usersRef.once('value', function(snapshot) {
    var exists = (snapshot.val() !== null);
    userExistsCallback(user, exists);
  });
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;
var socket;
var aframeRunning = false;
/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid || !user && currentUID === null) {
    return;
  }
  currentUID = user ? user.uid : null;

  cleanupUi();
  if (user) {
    splashPage.style.display = 'none';
    checkIfUserExists(user);
    startDatabaseQueries();
    userInfo.innerHTML += `<h3>Your Google Firebase UID is ${user.uid}</h3>`;
    socket = io();
    socket.on('connect',function(){
      userInfo.innerHTML += `<h3>Your SocketIO ID is ${socket.id}</h3>`;
      socket.emit('sendFBData',{uid:user.uid,email:user.email});
      if(!aframeRunning)startAframe(socket);
    });
  } else {
    // Display the splash page where you can sign-in.
    splashPage.style.display = '';
  }
}

// Bindings on load.
window.addEventListener('load', function() {
  // Bind Sign in button.
  signInButton.addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });

  // Bind Sign out button.
  signOutButton.addEventListener('click', function() {
    firebase.auth().signOut();
    socket.close();
  });

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

}, false);

/*
  AFRAME SCENE
*/
/* Start Things Going After User Logs In
 ——————————————————————————————————————————————*/
document.querySelector('a-scene').pause();
function startAframe(socket){
  document.querySelector('#trigger').load();
  //var element = document.querySelector('#some-id');
  var scene = document.querySelector('#scene-1');
  window.scn=scene;
  var twitterSign = document.querySelector('#twitter-sign');
  var instructions = `Set your firebase share/sign value and the text will appear here!`;
  twitterSign.setAttribute('text',`value:${instructions};
                                   align:center;
                                   width:15;
                                   wrap-count:15; 
                                   color:black`);
  var musicSign = document.querySelector('#music-sign');
  var instructions2 = `Set your firebase database share/music value to
  either \"DJ\" , \"birds\" , \"magical\" , \"EDM\" , \"Solstice Coil\" or \"Beatles\" to change the music!`;
  musicSign.setAttribute('text',`value:${instructions2};
                                   align:center;
                                   width:15;
                                   wrap-count:16; 
                                   color:black`);
  var skySign = document.querySelector('#sky-sign');
  var instructions3 = `Set your firebase database share/sky value to
  either \"blue\" , \"orange\" or \"gray\"  to change the sky color!`;
  skySign.setAttribute('text',`value:${instructions3};
                                   align:center;
                                   width:15;
                                   wrap-count:15; 
                                   color:black`);
  var buzzSign = document.querySelector('#buzz-sign');
  var instructions4 = `You can even trigger your ESP8266 buzzer from within this VR world!`;
  buzzSign.setAttribute('text',`value:${instructions4};
                                   align:center;
                                   width:15;
                                   wrap-count:15; 
                                   color:black`);
  
  var torch1flame = document.querySelector('#torch-1-flame');
  var torch2flame = document.querySelector('#torch-2-flame');
  
  var playerEl = document.querySelector('#player');
  
  socket.emit("getSettings");
  
  socket.on("setSkyColor", (color)=>{
    console.log(`Set sky color to ${color}`);
    switch(color){
      case "blue":
        scene.setAttribute("environment","skyColor:blue");
        break;
      case "gray":
        scene.setAttribute("environment","skyColor:gray");
        break;
      case "orange":
        scene.setAttribute("environment","skyColor:#f48f42");
        break;
    }
  });
  
  socket.on("setSignContent", (content)=>{
    console.log(`Set sign content to ${content}`);
    twitterSign.setAttribute('text',`value:${content};
                                       align:center;
                                       width:15;
                                       wrap-count:15; 
                                       color:black`);
  });
  
  socket.on("setMusic", (song)=>{
    console.log(`Set music to ${song}`);
    playSong(song);
  });
  
  socket.on("setBuzz", (bool)=>{
    console.log(`Set sign content to ${bool}`);
    buzzSign.setAttribute('text',`value: Buzzing - ${bool} \n ${instructions4};
                                       align:center;
                                       width:15;
                                       wrap-count:15; 
                                       color:black`);
  });
  
  
  $("body").on("keydown",(e)=>{
    
    switch(e.keyCode){
      //SPACE KEY PRESSED  
      case 32: 
        
        break;
      //RETURN KEY PRESSED
      case 13: 
        
        break;
    }
     
  });
  
  $("body").on("keyup",(e)=>{
    
  });
  
  var totalTime = 0;
  //GAME WORLD UPDATE FUNCTION
  function update(dt){
    totalTime += dt;
    torch1flame.object3D.rotateY(dt/100);
    torch2flame.object3D.rotateY(dt/100);
    if(playerEl.object3D.position.y < 0.8){
      let x = playerEl.object3D.position.x;
      let z = playerEl.object3D.position.z;
      playerEl.body.el.setAttribute("position",`${x} 1.6 ${z}`);
      playerEl.body.el.setAttribute("velocity","0 0 0");
    }
  }
  //GAME LOOP
  var frameRate = 1000/60;
  var lastFrame = 0;
  var startTime = 0;
  var currentFrame;
  function gameLoop(time){  
    // time in ms accurate to 1 micro second 1/1,000,000th second
      currentFrame = Math.round((time - startTime) / frameRate);
      var deltaTime = (currentFrame - lastFrame) * frameRate;
      update(deltaTime);
      lastFrame = currentFrame;
      requestAnimationFrame(gameLoop);
    }
  window.requestAnimationFrame(gameLoop);
  
  var songs = [346610198,341744814,344571103,342016953,343772359,346595228,333552685,341887850,331296039,339886804,362216789];
  var currentSongIndex = 0;
  
  var bgm = document.createElement('audio');
  var bgmUrlStart = 'https://api.soundcloud.com/tracks/';
  var bgmUrlEnd = '/stream?client_id=b9d11449cd4c64d461b8b5c30650cd06';
  bgm.src = bgmUrlStart + 346610198 + bgmUrlEnd;
  bgm.crossorigin = 'anonymous';
  bgm.autoplay = 'autoplay';
  bgm.loop = true;
  bgm.volume = 0.2;
  document.body.appendChild(bgm);
            
  //button to play music on IOS
  let b = document.createElement('button');
  b.innerHTML = 'PLAY';
  b.addEventListener('click', onSelect.bind(this));
  document.body.appendChild(b);
  
  function onSelect(){
    bgm.src = bgmUrlStart + this.sel.val + bgmUrlEnd;
    bgm.crossorigin = 'anonymous';
    bgm.autoplay = 'autoplay';
    
    bgm.play();
    bgm.volume = 0.2;
  }
  
  function playNextSong(){
    currentSongIndex++;
    if(currentSongIndex == songs.length) currentSongIndex = 0;
    bgm.src = bgmUrlStart + songs[currentSongIndex] + bgmUrlEnd;
    bgm.crossorigin = 'anonymous';
    bgm.autoplay = 'autoplay';
    bgm.load();
    bgm.loop = true;
    bgm.volume = 0.2;
  }
  
  var SolsticeCoilCredit = "Now Playing:\n Brilliance by Solstice Coil!";
  function playSong(song){
    console.log("Playing you a song.");
    switch(song){
      case "DJ":
        bgm.src = bgmUrlStart + 362216789 + bgmUrlEnd;
        break;
      case "birds":
        bgm.src = bgmUrlStart + 195090745 + bgmUrlEnd;
        break;
      case "magical":
        bgm.src = bgmUrlStart + 124813445 + bgmUrlEnd;
        break;
      case "EDM":
        bgm.src = bgmUrlStart + 192669043 + bgmUrlEnd;
        break;
      case "Solstice Coil":
        bgm.src = bgmUrlStart + 4989864 + bgmUrlEnd;
        // twitterSign.setAttribute('text',`value:${SolsticeCoilCredit};
        //                                align:center;
        //                                width:15;
        //                                wrap-count:15; 
        //                                color:black`);
        break;
      case "Beatles":
        bgm.src = bgmUrlStart + 33224546 + bgmUrlEnd;
        break;
    }
    bgm.crossorigin = 'anonymous';
    bgm.autoplay = 'autoplay';
    bgm.load();
    bgm.loop = true;
    bgm.volume = 0.2;
  }
  aframeRunning = true;
}