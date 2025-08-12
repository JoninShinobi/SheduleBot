const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GoalManagerService = require('../services/goalManager');

const goalManager = new GoalManagerService();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('goal')
        .setDescription('Set and analyze a new goal with AI-powered breakdown')
        .addStringOption(option =>
            option.setName('description')
                .setDescription('What do you want to achieve?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('target_date')
                .setDescription('When do you want to complete this? (e.g., "February 13th 2025", "next Friday", "in 3 weeks")')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('priority')
                .setDescription('Goal priority level')
                .setRequired(false)
                .addChoices(
                    { name: 'Low', value: 'low' },
                    { name: 'Medium', value: 'medium' },
                    { name: 'High', value: 'high' },
                    { name: 'Critical', value: 'critical' }
                ))
        .addStringOption(option =>
            option.setName('skill_level')
                .setDescription('Your current skill level for this goal')
                .setRequired(false)
                .addChoices(
                    { name: 'Beginner', value: 'beginner' },
                    { name: 'Intermediate', value: 'intermediate' },
                    { name: 'Advanced', value: 'advanced' },
                    { name: 'Expert', value: 'expert' }
                )),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Check if goal manager is ready
            if (!goalManager.isReady()) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Goal System Not Ready')
                    .setDescription('Goal management system is not initialized properly.');
                
                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }

            const description = interaction.options.getString('description');
            const targetDate = interaction.options.getString('target_date');
            const priority = interaction.options.getString('priority') || 'medium';
            const skillLevel = interaction.options.getString('skill_level') || 'beginner';

            // Validate input data
            const validation = await validateGoalInput(description, targetDate);
            if (!validation.isValid) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Invalid Goal Input')
                    .setDescription(validation.error);
                
                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }

            const parsedDate = validation.parsedDate;
            const formattedDate = parsedDate.toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            // Show analyzing message first
            const analyzingEmbed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle('🎯 Goal Received')
                .setDescription(`**Goal:** ${description}\n**Target Date:** ${formattedDate}\n**Priority:** ${priority}\n**Skill Level:** ${skillLevel}`)
                .setFooter({ text: 'Chronos Goal Assistant • Analyzing goal with AI...' })
                .setTimestamp();

            await interaction.editReply({ embeds: [analyzingEmbed] });

            // Analyze goal with AI
            const analysis = await goalManager.analyzeGoalWithAI(description, parsedDate.toISOString(), skillLevel);
            
            if (analysis.success) {
                // Save goal to storage
                const goalData = {
                    title: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
                    description: description,
                    targetDate: parsedDate.toISOString(),
                    priority: priority,
                    complexity: analysis.complexity,
                    estimatedHours: analysis.estimatedHours
                };
                
                const saveResult = await goalManager.saveGoal(interaction.user.id, goalData);
                
                // Show results with AI analysis
                const resultEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('🎯 Goal Analysis Complete & Saved')
                    .setDescription(`**Goal:** ${description}\n**Target Date:** ${formattedDate}\n**Priority:** ${priority}\n**Skill Level:** ${skillLevel}`)
                    .addFields({
                        name: '🤖 AI Analysis & Recommendations',
                        value: analysis.analysis.substring(0, 1000) + (analysis.analysis.length > 1000 ? '...' : ''),
                        inline: false
                    })
                    .setFooter({ text: `Chronos Goal Assistant • Complexity: ${analysis.complexity} • Est: ${analysis.estimatedHours}h • Saved: ${saveResult.success ? 'Yes' : 'Failed'}` })
                    .setTimestamp();

                await interaction.editReply({ embeds: [resultEmbed] });
            } else {
                // Show error if AI analysis failed
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff9900)
                    .setTitle('⚠️ Goal Saved (AI Analysis Failed)')
                    .setDescription(`**Goal:** ${description}\n**Target Date:** ${formattedDate}\n**Priority:** ${priority}\n**Skill Level:** ${skillLevel}\n\n❌ AI analysis unavailable: ${analysis.message}`)
                    .setFooter({ text: 'Chronos Goal Assistant • Goal saved without AI analysis' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [errorEmbed] });
            }

        } catch (error) {
            console.error('Error in /goal command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('Failed to process goal. Please try again.');
            
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};

async function validateGoalInput(description, targetDate) {
    // Validate description
    if (!description || description.trim().length < 10) {
        return { 
            isValid: false, 
            error: 'Goal description must be at least 10 characters long and meaningful.' 
        };
    }

    if (description.length > 200) {
        return { 
            isValid: false, 
            error: 'Goal description must be less than 200 characters. Please be more concise.' 
        };
    }

    // Parse natural language date with AI (Rule #18 compliance)
    const dateResult = await parseSimpleDate(targetDate);
    if (!dateResult.isValid) {
        return { 
            isValid: false, 
            error: dateResult.error 
        };
    }

    const parsedDate = dateResult.date;
    const now = new Date();
    
    if (parsedDate <= now) {
        return { 
            isValid: false, 
            error: 'Target date must be in the future. Choose a date after today.' 
        };
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    if (parsedDate > maxDate) {
        return { 
            isValid: false, 
            error: 'Target date cannot be more than 2 years in the future.' 
        };
    }

    return { isValid: true, parsedDate: parsedDate };
}

async function parseSimpleDate(dateString) {
    try {
        // Basic data validation only
        if (!dateString || dateString.trim().length === 0) {
            return { 
                isValid: false, 
                error: 'Date string cannot be empty.' 
            };
        }

        // Send ALL date strings to Gemini AI
        const GeminiAIService = require('../services/geminiAI');
        const aiService = new GeminiAIService();
        
        if (!aiService.isReady()) {
            return { 
                isValid: false, 
                error: 'AI service not available for date parsing.' 
            };
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const prompt = `Parse this date expression into JSON format. Today is ${today}.

Date expression: "${dateString}"

Return ONLY this JSON format:
{"success": true, "date": "YYYY-MM-DD"}

If invalid:
{"success": false, "error": "explanation"}

Examples:
- "February 13 2025" → {"success": true, "date": "2025-02-13"}
- "next Friday" → {"success": true, "date": "2025-01-17"}
- "in 3 weeks" → {"success": true, "date": "2025-02-03"}`;

        const result = await aiService.model.generateContent(prompt);
        const response = result.response.text().trim();
        
        // Parse AI's JSON response (checking format only)
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const aiResult = JSON.parse(cleanResponse);
        
        // Validate JSON format matches expected structure
        if (typeof aiResult.success !== 'boolean') {
            return { 
                isValid: false, 
                error: 'AI returned invalid response format.' 
            };
        }
        
        if (aiResult.success) {
            if (!aiResult.date || typeof aiResult.date !== 'string') {
                return { 
                    isValid: false, 
                    error: 'AI returned success but no valid date.' 
                };
            }
            
            // Validate date is in YYYY-MM-DD format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(aiResult.date)) {
                return { 
                    isValid: false, 
                    error: 'AI returned date in wrong format.' 
                };
            }
            
            // Convert AI's date string to JavaScript Date object
            const parsedDate = new Date(aiResult.date);
            if (isNaN(parsedDate.getTime())) {
                return { 
                    isValid: false, 
                    error: 'AI returned invalid date.' 
                };
            }
            
            return { isValid: true, date: parsedDate };
        } else {
            return { 
                isValid: false, 
                error: aiResult.error || 'AI could not parse date.' 
            };
        }
        
    } catch (error) {
        console.error('Date parsing error:', error);
        return { 
            isValid: false, 
            error: 'Failed to parse date with AI.' 
        };
    }
}