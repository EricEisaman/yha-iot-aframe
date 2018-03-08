<img src="https://cdn.glitch.com/1a3d0526-b227-48ca-95b7-53e806694f71%2FYHA-IoT.png?1517077365840" >

# YHA-IoT A-Frame
This app provides a useful starting point for building your own Internet of Things application with user authentication. This starter application provides secure data transport with persistent client connectivity and is built with Node, Express, SocketIO, Firebase-Admin, and Nodemailer.

SocketIO is a lean JavaScript library for lightning fast realtime communication.

Firebase is Google's cloud backend as a service. Firebase provides many individual services including Authentication, Realtime Database, Cloud Firestore, Cloud Functions, and more. 

This starter project implements <a href="https://firebase.google.com/" noopener noreferrer>Firebase</a> to provide user login with Google Auth and to read and write to the database.

The Google Auth signin provides more security and a defined userbase from which you can start to build an application community.

This starter project includes a sample <a href="https://aframe.io/" noopener noreferrer>A-Frame</a> scene with a few aspects bound to Firebase database values.

![A-Frame](https://cdn.glitch.com/9417889b-8921-4cc4-b3f6-cc16e79c5b71%2Faframe.png?1520540610232)

## Getting Started
To get started, you need to:
- Set up your App in Firebase
- Add your app credentials to `.env`
- Finish configuring your app

For more detailed setup instructions, see `SETUP.md`.

For some important design considerations, see `DESIGN.md`.

