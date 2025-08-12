const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GoogleCalendarService = require('../services/googleCalendar');
const moment = require('moment-timezone');

const calendarService = new GoogleCalendarService();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('today')
        .setDescription('Show today\'s complete schedule'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Check if calendar service is ready
            if (!calendarService.isCalendarReady()) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Calendar Not Ready')
                    .setDescription('Google Calendar service is not initialized. Please check your OAuth setup.');
                
                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }

            // Get today's events
            const todaysEvents = await calendarService.getTodaysEvents();
            const today = moment().tz(process.env.USER_TIMEZONE);

            if (todaysEvents.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('📅 No Events Today')
                    .setDescription(`You have a free day!\n\n**Date:** ${today.format('dddd, MMM Do YYYY')}`)
                    .setFooter({ text: 'Chronos Schedule Assistant' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // Build today's schedule embed
            const embed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle('📅 Today\'s Schedule')
                .setDescription(`**${today.format('dddd, MMM Do YYYY')}**\n\n`)
                .setFooter({ text: `Chronos Schedule Assistant • ${todaysEvents.length} event${todaysEvents.length !== 1 ? 's' : ''}` })
                .setTimestamp();

            // Group events by time and add to embed
            todaysEvents.forEach((event, index) => {
                const startTime = event.start.dateTime ? 
                    moment(event.start.dateTime).tz(process.env.USER_TIMEZONE) : 
                    moment(event.start.date).tz(process.env.USER_TIMEZONE);
                
                const endTime = event.end.dateTime ? 
                    moment(event.end.dateTime).tz(process.env.USER_TIMEZONE) : 
                    moment(event.end.date).tz(process.env.USER_TIMEZONE);

                const timeRange = event.start.dateTime ? 
                    `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}` : 
                    'All Day';

                // Status indicator
                const now = moment().tz(process.env.USER_TIMEZONE);
                let statusIcon = '⏳'; // Future
                if (event.start.dateTime) {
                    if (now.isAfter(endTime)) statusIcon = '✅'; // Past
                    else if (now.isBetween(startTime, endTime)) statusIcon = '🔴'; // Current
                }

                let fieldValue = `${statusIcon} **${timeRange}**`;
                if (event.location) fieldValue += `\n📍 ${event.location}`;
                if (event.description) {
                    const desc = event.description.substring(0, 100);
                    fieldValue += `\n📝 ${desc}${event.description.length > 100 ? '...' : ''}`;
                }

                embed.addFields({
                    name: `${event.summary || 'Untitled Event'}`,
                    value: fieldValue,
                    inline: false
                });
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in /today command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('Failed to fetch today\'s events. Please try again.');
            
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};