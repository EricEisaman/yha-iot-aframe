# Design Considerations
The structure of this starter app should be considered as you design your fully fledged IoT application.

## Security, Responsibility, and Data Governance
All applications should be served over **HTTPS**, which provides the first level of security.

The web client direct Firebase connection should, in most cases, have **limited READ/WRITE access** by publishing <a href="https://pastebin.com/raw/qK3gfzK3" no-open no-referrer>**appropriate database rules**</a>.

<a href="https://termsfeed.com/blog/sample-terms-and-conditions-template/" no-open no-referrer>**Terms and Conditions**</a> , <a href="https://termsfeed.com/privacy-policy/generator/2?utm_expid=116232541-317.ZR0FPU4wRKK3HeyABnI9_A.1" no-open no-referrer>**Privacy Policy**</a>, and <a href="http://www.ibmbigdatahub.com/blog/data-governance-story-how-develop-policies-rules" no-open no-referrer>**Data Governance Policy**</a> should be conveyed to potential users prior to signup/signin.

## Limits to Free Google Firebase Usage
Under the free **Google Firebase Spark Plan**, their **Realtime Database** is a better option than their **Cloud Firebase** product, particularly if you are making many reads/writes and you have 100 or less simultaneous connections.

![Realtime Database Spark Plan](https://cdn.glitch.com/1a3d0526-b227-48ca-95b7-53e806694f71%2Frdb.png?1518976428784)

![Realtime Database Spark Plan](https://cdn.glitch.com/1a3d0526-b227-48ca-95b7-53e806694f71%2Fcfs.png?1518976435244)

## IoT Device Connections
You can communicate with IoT devices via **REST API** with your **Node.js** server, or authenticate and store data directly on the **Firebase Realtime Database**. Here is an example <a href="https://github.com/EricEisaman/esp8266/blob/master/ino/buzz-buzzer-firebase-and-local-control.ino" no-open no-referrer>**Arduino Sketch**</a> using a deprecated, but still functioning Firebase API.

## Temporary Shared Data
Data such as chat messages, which don't require permanent storage, can be handled with **Socket.IO** and the **Node.js** server. **Note**: In memory data storage **will NOT be reliable on Glitch**, as Glitch is offered as an **educational tool** and **NOT meant for commercial application deployment**.

## Glitch -vs- ZEIT
As you connect more clients, you will notice performance issues with your application hosted on **Glitch**, which is expected because **Glitch** is designed as a learning tool for collaborative development.  

<a href="https://zeit.co/" no-open no-referrer>**ZEIT**</a> provides highly performant **Node** app hosting with a free tier and terrific commercial tiers.  As long as your application hosted at **ZEIT** is not sleeping, it will not throttle connections. **Note**: Free plans at **ZEIT** are **Open Source** and have a **1Gb Monthly Bandwidth**. <a href="https://zeit.co/now" no-open no-referrer>**ZEIT Now**</a> makes deploying **Node** apps as simple as typing **"Now"**!