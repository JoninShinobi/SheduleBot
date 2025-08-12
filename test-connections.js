const { Client, GatewayIntentBits } = require('discord.js');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

console.log('🔧 Testing connections...');

// Test Discord connection
async function testDiscord() {
    console.log('\n📡 Testing Discord connection...');
    try {
        const client = new Client({
            intents: [GatewayIntentBits.Guilds]
        });
        
        await client.login(process.env.DISCORD_TOKEN);
        console.log('✅ Discord connection successful!');
        console.log(`   Bot: ${client.user.tag}`);
        client.destroy();
        return true;
    } catch (error) {
        console.error('❌ Discord connection failed:', error.message);
        return false;
    }
}

// Test Google Calendar connection
async function testGoogleCalendar() {
    console.log('\n📅 Testing Google Calendar connection...');
    try {
        const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_CALENDAR_CREDENTIALS, 'utf8'));
        console.log('✅ Google credentials loaded');
        console.log(`   Project: ${credentials.web.project_id}`);
        
        // Check if token exists
        if (fs.existsSync(process.env.GOOGLE_CALENDAR_TOKEN)) {
            console.log('✅ OAuth token exists');
        } else {
            console.log('⚠️  OAuth token not found - will need manual setup');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Google Calendar setup failed:', error.message);
        return false;
    }
}

async function runTests() {
    const discordOk = await testDiscord();
    const googleOk = await testGoogleCalendar();
    
    console.log('\n🔍 Connection Test Results:');
    console.log(`Discord: ${discordOk ? '✅ Ready' : '❌ Failed'}`);
    console.log(`Google:  ${googleOk ? '✅ Ready' : '❌ Failed'}`);
    
    if (discordOk && googleOk) {
        console.log('\n🎉 All connections ready! Proceed with bot development.');
    } else {
        console.log('\n⚠️  Fix connection issues before continuing.');
    }
    
    process.exit(0);
}

runTests().catch(console.error);