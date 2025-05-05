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

const port = 80;

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


// Initialize the Google Calendar API client
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Create a new event

const event = {
    summary: 'Google I/O 2023',
    location: 'Online',
    description: 'A chance to hear more about Google’s developer products.',
    start: {
        dateTime: '2023-10-01T09:00:00-07:00',
        timeZone: 'America/Los_Angeles',
    },
    end: {
        dateTime: '2023-10-01T17:00:00-07:00',
        timeZone: 'America/Los_Angeles',
    },
    recurrence: [
        'RRULE:FREQ=DAILY;COUNT=2'
    ],
};

// Route to create an event in the user's calendar

app.post('/create-event', async (req, res) => {
    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            auth: oauth2Client,
            sendUpdates: 'all',
        });
        res.status(200).send(`Event created: ${response.data.htmlLink}`);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send('Error creating event');
    }
});

// Route to list events in the user's calendar

app.get('/list-events', async (req, res) => {
    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        const events = response.data.items;
        if (events.length) {
            res.status(200).send(events);
        } else {
            res.status(200).send('No upcoming events found.');
        }
    } catch (error) {
        console.error('Error listing events:', error);
        res.status(500).send('Error listing events');
    }
});


// Add 
