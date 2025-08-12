const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = process.env.GOOGLE_CALENDAR_TOKEN;
const CREDENTIALS_PATH = process.env.GOOGLE_CALENDAR_CREDENTIALS;

async function setupOAuth() {
    console.log('🔧 Setting up Google Calendar OAuth...');
    
    // Load credentials
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    // Generate auth URL
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    
    console.log('\n📋 Steps to authorize:');
    console.log('1. Open this URL in your browser:');
    console.log(`   ${authUrl}`);
    console.log('2. Sign in and authorize the application');
    console.log('3. Copy the authorization code from the callback URL');
    console.log('4. Enter the code below\n');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    rl.question('Enter the authorization code: ', (code) => {
        rl.close();
        
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error('❌ Error retrieving access token:', err);
                return;
            }
            
            // Store the token
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
            console.log('✅ Token stored successfully!');
            console.log(`   Saved to: ${TOKEN_PATH}`);
            
            // Test the token
            testCalendarAccess(oAuth2Client, token);
        });
    });
}

async function testCalendarAccess(auth, token) {
    console.log('\n📅 Testing calendar access...');
    
    auth.setCredentials(token);
    const calendar = google.calendar({ version: 'v3', auth });
    
    try {
        const res = await calendar.events.list({
            calendarId: process.env.PRIMARY_CALENDAR_ID,
            timeMin: new Date().toISOString(),
            maxResults: 1,
            singleEvents: true,
            orderBy: 'startTime',
        });
        
        console.log('✅ Calendar access successful!');
        console.log(`   Calendar: ${process.env.PRIMARY_CALENDAR_ID}`);
        console.log(`   Found ${res.data.items.length} upcoming events`);
        
        console.log('\n🎉 OAuth setup complete! Ready to build the bot.');
        
    } catch (error) {
        console.error('❌ Calendar access failed:', error.message);
    }
}

setupOAuth().catch(console.error);