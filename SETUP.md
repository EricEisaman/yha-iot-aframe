## What You Need
*   A [Google Account](https://firebase.google.com/)

## Step 1: Set up your App in Firebase
Start by [remixing this starter project](https://glitch.com/edit/#!/remix/yha-iot), so that you have your own copy of the code. Then create a new project from the [Firebase Console](https://console.firebase.google.com/) by selecting 'Create new project' and setting your project name and region. You can then create a Service Account by clicking on the Settings cog icon and selecting Project Settings > Service Accounts. This will default to a Firebase-Admin service account.  Click the button shown to generate and download a JSON key file containing your credentials.

## Step 2: Adding credentials and email setup
Using the details in that JSON file, we can now enter our Firebase app credentials into the `.env` file.

If you are going to use SendGrid to send notification emails, sign up at <a href="https://sendgrid.com" no-opener no-referrer>sendgrid.com</a>, create an API Key, and place it in the `.env` file.

If you instead are going to use a Gmail account to send notification emails, then add your details for `GMAIL_ADDRESS` and `GMAIL_PASSWORD` into the `.env` file too. To send notification emails, GMAIL requires you <a href="https://myaccount.google.com/lesssecureapps?pli=1" no-opener no-referrer>"Allow Less Secure Web Apps"</a>, specifically apps that won't trigger verification questions. To use GMAIL, you must also **comment out** lines 22,23 and **uncomment** lines 27-35 , 37-43 in `server.js`. 

Now you need to paste the initialization snippet (Select 'Add Firebase to your web app' from your app's homepage in Firebase) into the head of `public/index.html`, replacing `lines 17-29`.

## Step 3: Configure Your App
Lastly, since this example uses Google Auth, we need to enable Google Auth from the Auth > Sign-in Method tab in Firebase. Then add your project's publish URL to the list of 'OAuth redirect domains' further down the page. Your project's publish URL is the URL shown when you click 'Show' and will have the format project-name.glitch.me. So in our example, we entered 'yha-iot.glitch.me' after selecting 'Add Domain', and then we click 'Add' to finish.

## Code Overview
The important parts of the code are mainly split between two files. Both are well commented, so I'll avoid duplicating their comments here. But essentially:

*   `server.js` implements:
    * the [Firebase-Admin API](https://firebase.google.com/docs/database/admin/start) which has full read/write access to the entire database.
    * the back-end components for sending notification emails, updating project metadata and listening out for in-app events and HTTP requests.

*   `public/main.js` implements:
    * the [Firebase JavaScript API](https://www.firebase.com/docs/web/api/) for enabling clients direct access to the database. Appropriate [database rules](https://pastebin.com/raw/qK3gfzK3) must be published to restrict client READ/WRITE access to a subset of the database.
    * [Socket.IO](https://socket.io/) enabling persistant web socket connections to the Node.js server, which can be used for realtime IoT network interaction controlled by your Glitch project.

You can now go to your app and login with Google Auth. Your next step is to design and build your own IoT network flow using this wonderful starter app.
