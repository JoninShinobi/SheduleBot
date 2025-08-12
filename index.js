const ScheduleAssistant = require('./src/bot');

const bot = new ScheduleAssistant();
bot.start().catch(console.error);