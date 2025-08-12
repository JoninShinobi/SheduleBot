const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ScheduleAssistant {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.commands = new Collection();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log(`🤖 Schedule Assistant Bot ready! Logged in as ${this.client.user.tag}`);
        });

        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;

            const command = this.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error('Command execution error:', error);
                const reply = { content: 'Something went wrong!', ephemeral: true };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            }
        });
    }

    async start() {
        await this.client.login(process.env.DISCORD_TOKEN);
    }
}

module.exports = ScheduleAssistant;