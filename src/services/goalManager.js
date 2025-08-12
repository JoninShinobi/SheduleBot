const fs = require('fs');
const path = require('path');
const GeminiAIService = require('./geminiAI');

class GoalManagerService {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data');
        this.goalsFile = path.join(this.dataPath, 'goals.json');
        this.skillsFile = path.join(this.dataPath, 'user-skills.json');
        this.aiService = new GeminiAIService();
        this.initialize();
    }

    initialize() {
        try {
            console.log('🎯 Initializing Goal Manager service...');
            
            // Create data directory if it doesn't exist
            if (!fs.existsSync(this.dataPath)) {
                fs.mkdirSync(this.dataPath, { recursive: true });
                console.log('📁 Created data directory');
            }
            
            // Initialize goals file if it doesn't exist
            if (!fs.existsSync(this.goalsFile)) {
                fs.writeFileSync(this.goalsFile, JSON.stringify([], null, 2));
                console.log('📝 Created goals.json file');
            }
            
            // Initialize skills file if it doesn't exist
            if (!fs.existsSync(this.skillsFile)) {
                const defaultSkills = {
                    userId: null,
                    skills: {},
                    lastUpdated: new Date().toISOString()
                };
                fs.writeFileSync(this.skillsFile, JSON.stringify(defaultSkills, null, 2));
                console.log('🎓 Created user-skills.json file');
            }
            
            console.log('✅ Goal Manager service initialized');
            
        } catch (error) {
            console.error('❌ Goal Manager initialization failed:', error.message);
        }
    }

    async saveGoal(userId, goalData) {
        try {
            const goals = this.loadGoals();
            
            const newGoal = {
                id: Date.now().toString(),
                userId: userId,
                title: goalData.title,
                description: goalData.description,
                targetDate: goalData.targetDate,
                priority: goalData.priority || 'medium',
                status: 'active',
                createdAt: new Date().toISOString(),
                tasks: [],
                estimatedHours: null,
                actualHours: 0
            };
            
            goals.push(newGoal);
            fs.writeFileSync(this.goalsFile, JSON.stringify(goals, null, 2));
            
            console.log(`📝 Goal saved: ${newGoal.title} (ID: ${newGoal.id})`);
            return { success: true, goal: newGoal };
            
        } catch (error) {
            console.error('❌ Error saving goal:', error.message);
            return { success: false, error: error.message };
        }
    }

    async analyzeGoalWithAI(goalDescription, targetDate, currentSkillLevel = 'beginner') {
        if (!this.aiService.isReady()) {
            return { success: false, message: 'AI service not available' };
        }

        try {
            const planId = Date.now().toString(); // Unique plan ID for tracking
            
            const prompt = `You are an expert goal analysis assistant. Analyze this goal and provide a structured breakdown in JSON format:

GOAL: ${goalDescription}
TARGET DATE: ${targetDate}
CURRENT SKILL LEVEL: ${currentSkillLevel}

Return ONLY this JSON structure:
{
  "success": true,
  "complexity": "Simple|Moderate|Complex|Expert",
  "estimatedHours": 20,
  "feasible": true,
  "analysis": "Brief overall assessment",
  "tasks": [
    {
      "title": "Task name",
      "description": "What needs to be done",
      "estimatedHours": 5,
      "priority": "high|medium|low",
      "dependencies": [],
      "skillsRequired": ["skill1", "skill2"]
    }
  ],
  "learningRequirements": ["Any new skills needed"],
  "timeline": "Realistic timeline assessment"
}

Create 3-5 specific, actionable tasks. Focus on realistic planning for the skill level.`;

            const result = await this.aiService.model.generateContent(prompt);
            const response = result.response.text().trim();
            
            // Parse AI's structured response
            const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            const aiResult = JSON.parse(cleanResponse);
            
            if (aiResult.success) {
                return { 
                    success: true,
                    planId: planId,
                    analysis: aiResult.analysis,
                    complexity: aiResult.complexity.toLowerCase(),
                    estimatedHours: aiResult.estimatedHours,
                    feasible: aiResult.feasible,
                    tasks: aiResult.tasks,
                    learningRequirements: aiResult.learningRequirements,
                    timeline: aiResult.timeline,
                    structuredPlan: aiResult // Keep full structure for /create and /revise
                };
            } else {
                return { success: false, message: 'AI could not analyze goal' };
            }

        } catch (error) {
            console.error('❌ Error analyzing goal with AI:', error.message);
            return { success: false, message: error.message };
        }
    }

    extractComplexity(analysisText) {
        const complexityMatch = analysisText.match(/complexity.*?(Simple|Moderate|Complex|Expert)/i);
        return complexityMatch ? complexityMatch[1].toLowerCase() : 'moderate';
    }

    extractEstimatedHours(analysisText) {
        const hoursMatch = analysisText.match(/(\d+)[\s-]*hours?/i);
        return hoursMatch ? parseInt(hoursMatch[1]) : 10;
    }

    loadGoals() {
        try {
            const data = fs.readFileSync(this.goalsFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Error loading goals:', error.message);
            return [];
        }
    }

    isReady() {
        return fs.existsSync(this.goalsFile) && fs.existsSync(this.skillsFile);
    }
}

module.exports = GoalManagerService;