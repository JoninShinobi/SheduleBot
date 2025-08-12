const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GoogleCalendarService = require('../services/googleCalendar');
const moment = require('moment-timezone');

const calendarService = new GoogleCalendarService();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('current')
        .setDescription('Show what is currently happening on your calendar'),

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

            // Get current events
            const currentEvents = await calendarService.getCurrentEvents();
            const now = moment().tz(process.env.USER_TIMEZONE);

            if (currentEvents.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('🆓 No Current Events')
                    .setDescription(`Nothing scheduled right now!\n\n**Current Time:** ${now.format('dddd, MMM Do YYYY [at] HH:mm')}`)
                    .setFooter({ text: 'Chronos Schedule Assistant' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // Build current events embed
            const embed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle('🎯 Currently Happening')
                .setDescription(`**Current Time:** ${now.format('dddd, MMM Do YYYY [at] HH:mm')}\n\n`)
                .setFooter({ text: 'Chronos Schedule Assistant' })
                .setTimestamp();

            currentEvents.forEach(event => {
                const startTime = event.start.dateTime ? 
                    moment(event.start.dateTime).tz(process.env.USER_TIMEZONE) : 
                    moment(event.start.date).tz(process.env.USER_TIMEZONE);
                
                const endTime = event.end.dateTime ? 
                    moment(event.end.dateTime).tz(process.env.USER_TIMEZONE) : 
                    moment(event.end.date).tz(process.env.USER_TIMEZONE);

                const timeRange = event.start.dateTime ? 
                    `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}` : 
                    'All Day';

                embed.addFields({
                    name: `📅 ${event.summary || 'Untitled Event'}`,
                    value: `⏰ ${timeRange}${event.location ? `\n📍 ${event.location}` : ''}${event.description ? `\n📝 ${event.description.substring(0, 100)}...` : ''}`,
                    inline: false
                });
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in /current command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('Failed to fetch current events. Please try again.');
            
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};