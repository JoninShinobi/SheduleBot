const { google } = require('googleapis');
const moment = require('moment-timezone');
const fs = require('fs');
require('dotenv').config();

class GoogleCalendarService {
    constructor() {
        this.calendar = null;
        this.auth = null;
        this.initialize();
    }

    async initialize() {
        try {
            console.log('🔧 Initializing Google Calendar service...');
            
            // Load credentials from environment
            const credentials = require('../../config/credentials.js');
            const { client_secret, client_id, redirect_uris } = credentials.web;
            
            // Create OAuth2 client
            this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            
            // Load token if exists
            const tokenPath = process.env.GOOGLE_CALENDAR_TOKEN;
            if (fs.existsSync(tokenPath)) {
                const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
                this.auth.setCredentials(token);
                
                // Create calendar instance
                this.calendar = google.calendar({ version: 'v3', auth: this.auth });
                console.log('✅ Google Calendar service initialized');
            } else {
                console.log('❌ No OAuth token found - manual setup required');
            }
            
        } catch (error) {
            console.error('❌ Google Calendar initialization failed:', error.message);
        }
    }

    async getCurrentEvents() {
        if (!this.calendar) return [];
        
        try {
            const now = moment().tz(process.env.USER_TIMEZONE);
            const fiveMinutesAgo = now.clone().subtract(5, 'minutes').toISOString();
            const fiveMinutesFromNow = now.clone().add(5, 'minutes').toISOString();
            
            const response = await this.calendar.events.list({
                calendarId: process.env.PRIMARY_CALENDAR_ID,
                timeMin: fiveMinutesAgo,
                timeMax: fiveMinutesFromNow,
                singleEvents: true,
                orderBy: 'startTime'
            });
            
            return response.data.items || [];
        } catch (error) {
            console.error('Error fetching current events:', error);
            return [];
        }
    }

    isCalendarReady() {
        return this.calendar !== null;
    }
}

module.exports = GoogleCalendarService;