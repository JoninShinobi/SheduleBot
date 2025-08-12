const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const GoalManagerService = require('./services/goalManager');
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
        this.goalManager = new GoalManagerService();
        this.loadCommands();
        this.setupEventHandlers();
    }

    loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        if (!fs.existsSync(commandsPath)) return;

        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                this.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.log(`⚠️ Command ${file} is missing required "data" or "execute" property.`);
            }
        }
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log(`🤖 Schedule Assistant Bot ready! Logged in as ${this.client.user.tag}`);
            this.registerCommands();
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

    async registerCommands() {
        try {
            const commandData = Array.from(this.commands.values()).map(command => command.data.toJSON());
            
            await this.client.application.commands.set(commandData);
            console.log(`✅ Registered ${commandData.length} slash commands`);
        } catch (error) {
            console.error('❌ Error registering commands:', error);
        }
    }

    async start() {
        await this.client.login(process.env.DISCORD_TOKEN);
    }
}

module.exports = ScheduleAssistant;