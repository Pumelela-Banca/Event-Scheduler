const express = require('express');
const dotenv = require('dotenv');
const  { google } = require('googleapis');

dotenv.config();

const scopes = ['https://www.googleapis.com/auth/calendar'];

// OAuth2 client setup

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const app = express();

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
    res.send("Welcome to the Event Scheduler API");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Route to authenicate user

app.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    res.redirect(authUrl);
}
);


// Route to handle the callback from Google after user has authenticated

app.get("/auth/redirectt", async (req, res) => {
    const {tokens} = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
    res.send("Authentication successful! You can close this tab.");
});

