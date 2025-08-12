const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiAIService {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.initialize();
    }

    initialize() {
        try {
            console.log('🤖 Initializing Gemini AI service...');
            
            if (!process.env.GEMINI_API_KEY) {
                console.log('❌ No Gemini API key found in environment');
                return;
            }
            
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            console.log('✅ Gemini AI service initialized');
            
        } catch (error) {
            console.error('❌ Gemini AI initialization failed:', error.message);
        }
    }

    async generateCalendarInsight(events, context = 'current') {
        if (!this.model) {
            return { success: false, message: 'Gemini AI not initialized' };
        }

        try {
            const prompt = this.buildCalendarPrompt(events, context);
            const result = await this.model.generateContent(prompt);
            const insight = result.response.text();

            return { 
                success: true, 
                insight: insight,
                context: context
            };

        } catch (error) {
            console.error('Error generating AI insight:', error);
            return { 
                success: false, 
                message: `AI insight generation failed: ${error.message}` 
            };
        }
    }

    buildCalendarPrompt(events, context) {
        const eventList = events.map(event => {
            const title = event.summary || 'Untitled Event';
            const startTime = event.start.dateTime || event.start.date;
            const endTime = event.end.dateTime || event.end.date;
            const location = event.location || 'No location';
            const description = event.description || 'No description';
            
            return `• ${title} (${startTime} to ${endTime}) at ${location} - ${description}`;
        }).join('\n');

        const basePrompt = `You are an intelligent calendar assistant. Analyze these calendar events and provide helpful insights:

EVENTS:
${eventList}

CONTEXT: Analyzing ${context} schedule

Please provide:
1. 🎯 Key insights about the schedule
2. ⚡ Productivity recommendations  
3. 🧠 Strategic observations
4. ⏰ Time optimization suggestions

Keep response concise (under 300 words) and actionable. Focus on helping the user optimize their schedule.`;

        return basePrompt;
    }

    isReady() {
        return this.model !== null;
    }
}

module.exports = GeminiAIService;