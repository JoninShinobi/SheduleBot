# Discord Bot Development Directives

## Absolute Design Principles for Discord Schedule Assistant Bot

### 1. MODULAR ARCHITECTURE - MANDATORY
- **NEVER** put multiple commands in a single file
- **ALWAYS** create separate files in `src/commands/` for each slash command
- **ALWAYS** create separate service files in `src/services/` for external integrations
- **NEVER** mix business logic with Discord client setup

### 2. FILE ORGANIZATION - NON-NEGOTIABLE
```
src/
├── bot.js                 # Main bot class only
├── commands/              # One command per file
├── services/              # External service wrappers
└── utils/                 # Helper functions
config/                    # All credentials and tokens
logs/                      # All log files
```

### 3. SECURITY & CONFIGURATION - ABSOLUTE
- **NEVER** hardcode API keys, tokens, or credentials
- **ALWAYS** use environment variables via `.env`
- **ALWAYS** store credentials in `config/` directory
- **NEVER** commit sensitive files to version control

### 4. ERROR HANDLING - MANDATORY
- **ALWAYS** wrap Discord interactions in try-catch blocks
- **ALWAYS** handle both replied and deferred interaction states
- **ALWAYS** provide user-friendly error messages
- **NEVER** let unhandled errors crash the bot

### 5. SCALABILITY - DESIGN FOR GROWTH
- **ALWAYS** use dynamic command loading from `src/commands/`
- **ALWAYS** design services as independent, reusable classes
- **ALWAYS** implement proper logging to `logs/` directory
- **NEVER** create monolithic code structures

### 6. DEPLOYMENT & PERSISTENCE
- **ALWAYS** provide background execution options (nohup, pm2, screen)
- **ALWAYS** implement graceful shutdown handling
- **ALWAYS** create startup scripts for production deployment

### 7. CODE QUALITY - ENFORCED
- **ALWAYS** use consistent naming conventions
- **ALWAYS** implement proper async/await patterns
- **NEVER** use callback hell or promise chains
- **ALWAYS** validate user inputs before processing

### 8. FEATURE DEVELOPMENT - SYSTEMATIC
- **ALWAYS** create new features as separate command files
- **ALWAYS** use the existing service architecture
- **ALWAYS** test features before deployment
- **NEVER** break existing functionality when adding features

### 9. INCREMENTAL DEVELOPMENT - MANDATORY
- **ALWAYS** break all advancements into small, manageable functions and chunks
- **NEVER** write entire codebase sections in one large chunk
- **ALWAYS** develop one function/feature at a time
- **ALWAYS** verify file structure after each change using LS tool
- **ALWAYS** test each chunk before proceeding to the next
- **NEVER** make sweeping changes without validation

### 10. CODE EFFICIENCY - ENFORCED
- **ALWAYS** ensure all code is checked for efficiency pre and post build
- **ALWAYS** optimize performance before deployment
- **ALWAYS** review code for bottlenecks and unnecessary operations
- **NEVER** deploy inefficient code without optimization

### 11. DEBUGGING & PROBLEM ISOLATION - MANDATORY
- **ALWAYS** create comprehensive logging/debugging before taking repair action
- **ALWAYS** isolate problems to a very near degree of certainty before fixing
- **NEVER** attempt repairs without proper diagnostic logging
- **ALWAYS** create debug files to track exact problem sources
- **ALWAYS** verify assumptions with detailed logs before code changes

### 12. INCREMENTAL BUILD PROCESS - ABSOLUTELY MANDATORY
- **ALWAYS** build ONE module at a time in this exact order:
  1. Core structure (package.json, .env, .gitignore)
  2. Base bot class (src/bot.js) - minimal functionality only
  3. ONE service at a time (start with simplest)
  4. ONE command at a time (start with hello command)
  5. ONE utility at a time (only as needed)
- **NEVER** create multiple files simultaneously
- **ALWAYS** test each individual module before proceeding to next
- **ALWAYS** verify file structure with LS after each creation
- **ALWAYS** ensure current module works before adding next module

### 13. FUNCTION-BY-FUNCTION DEVELOPMENT - NON-NEGOTIABLE
- **ALWAYS** implement ONE function at a time within each module
- **ALWAYS** test each function individually before adding the next
- **NEVER** write entire classes or modules in one go
- **ALWAYS** start with the simplest possible implementation
- **ALWAYS** verify functionality at each step
- **NEVER** proceed if current function is not working

### 14. MANDATORY TESTING PROTOCOL
- **ALWAYS** test after each file creation
- **ALWAYS** test after each function implementation
- **ALWAYS** verify Discord bot starts without errors
- **ALWAYS** test command registration and execution
- **NEVER** add complexity until basic functionality is confirmed
- **ALWAYS** use pm2 for testing in production environment

### 15. BUILD VERIFICATION - ABSOLUTE REQUIREMENT
- **ALWAYS** run `node index.js` to verify bot starts
- **ALWAYS** restart PM2 after EVERY code change: `pm2 restart chronos-bot`
- **ALWAYS** verify PM2 restart succeeded: `pm2 logs chronos-bot`
- **ALWAYS** check pm2 status after each major change
- **ALWAYS** verify all commands are registered in Discord
- **ALWAYS** test each command individually before proceeding
- **NEVER** continue building if any component fails
- **MANDATORY:** PM2 restart is REQUIRED after every file modification

### 16. MANDATORY GIT BACKUP PROTOCOL - CRITICAL
- **IMPERATIVE:** All code MUST be pushed to https://github.com/JoninShinobi/SheduleBot.git
- **ALWAYS** create a new git branch for each function/module being developed
- **ALWAYS** commit and push to branch IMMEDIATELY after user verification
- **NEVER** proceed to next function until current function is:
  1. Tested and verified working by user
  2. Committed to appropriate git branch
  3. Pushed to GitHub repository: https://github.com/JoninShinobi/SheduleBot.git
- **ALWAYS** use descriptive branch names: `feature/command-hello`, `feature/service-calendar`, etc.
- **ALWAYS** wait for explicit user confirmation before moving to next function
- **NEVER** lose working code - backup everything that works
- **NEVER** delete feature branches - they are permanent stable fallbacks
- **DEVELOPMENT PHASE:** Keep all feature branches as stable rollback points
- **PRODUCTION PHASE:** Use version tags only after rigorous bulletproof testing
- **CRITICAL:** If push fails, STOP development until GitHub access is resolved

### 17. USER VERIFICATION REQUIREMENT - ABSOLUTE
- **ALWAYS** ask user to verify each function works before proceeding
- **ALWAYS** wait for explicit "YES" confirmation from user
- **NEVER** assume functionality works without user testing
- **ALWAYS** commit to git branch only AFTER user confirms it works
- **NEVER** continue development without user approval of current state

### 18. GOOGLE GEMINI INTEGRATION - MANDATORY FOR ALL FUNCTIONALITY
- **ALWAYS** utilize Google Gemini AI capabilities for calendar input and output processing
- **ALWAYS** use Gemini for intelligent calendar searching and filtering
- **ALWAYS** implement AI-powered natural language processing for user requests
- **ALWAYS** enhance user experience with Gemini's contextual understanding
- **NEVER** create basic calendar functionality without AI enhancement
- **ALWAYS** use Gemini to interpret time expressions, event descriptions, and search queries
- **ALWAYS** provide AI-generated insights and recommendations for calendar management
- **MANDATORY:** Every calendar-related module MUST incorporate Gemini capabilities

## Current Bot: Discord Schedule Assistant (Chronos)
- Entry point: `index.js`
- Main class: `src/bot.js`
- Commands: Auto-loaded from `src/commands/`
- Services: Google Calendar, AI (Gemini)
- Environment: Production-ready with PM2 process management
- Repository: https://github.com/JoninShinobi/SheduleBot.git
- Location: /home/jonin/bots/discordbots/chronos/
- AI Integration: Google Gemini for ALL calendar functionality

### 19. MANDATORY PRE-ACTION SELF-CHECK - ABSOLUTE REQUIREMENT
- **ALWAYS** check protocols before any major action
- **NEVER** proceed without verifying compliance with ALL rules above
- **MANDATORY** reference: Rules #15 (PM2), #16 (Git), #17 (User Verification), #18 (Gemini AI)

#### PROTOCOL CHECKLIST (CHECK BEFORE EVERY ACTION):
□ **Check Rule #15:** Do I need to restart PM2 after changes?
□ **Check Rule #16:** Am I on correct git branch? Need commit/push after user verification?
□ **Check Rule #17:** Do I need USER VERIFICATION before proceeding?
□ **Check Rule #18:** Does this need Gemini AI integration (calendar functionality)?

#### CURRENT STATE TRACKER:
```
CURRENT BRANCH: [Update this]
LAST ACTION: [Update this] 
NEXT REQUIRED: [Update this]
USER VERIFICATION STATUS: [NEEDED/COMPLETED]
PM2 STATUS: [NEEDS_RESTART/UP_TO_DATE]
```

**VIOLATION OF THESE DIRECTIVES IS UNACCEPTABLE**