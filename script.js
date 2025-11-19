// Ziggy Chaos Chat with Enhanced Memory System
class PersistentMemory {
    constructor() {
        // Generate or retrieve unique user identity
        let userId = localStorage.getItem('ziggy_user_id');
        let userName = localStorage.getItem('ziggy_user_name');
        
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ziggy_user_id', userId);
            
            // First visit - get user's name
            if (!userName) {
                setTimeout(() => {
                    userName = prompt('Hello! I\'m Ziggy Chaos. What should I call you?') || 'Friend';
                    localStorage.setItem('ziggy_user_name', userName);
                    this.userName = userName;
                    
                    // Welcome message with user's name
                    if (window.ziggyChatInstance) {
                        window.ziggyChatInstance.addMessage('ziggy', `Nice to meet you, ${userName}! I'll remember our conversations and we can build our own memory space together.`);
                    }
                }, 1000);
            }
        }
        
        this.userId = userId;
        this.userName = userName || 'Friend';
        this.memoryKey = `ziggy_personal_memory_${userId}`;
        this.maxMemories = 200; // Increased for relationship building
    }

    // Enhanced to include relationship metadata
    saveInteraction(userMessage, ziggyResponse, emotionalContext = null) {
        const memory = {
            timestamp: new Date().toISOString(),
            user: userMessage,
            ziggy: ziggyResponse,
            emotional_context: emotionalContext,
            intimacy_score: this.calculateIntimacyScore(userMessage),
            topics: this.extractTopics(userMessage)
        };

        const allMemories = this.getAllMemories();
        allMemories.push(memory);
        
        if (allMemories.length > this.maxMemories) {
            allMemories.shift(); // Remove oldest memory
        }

        localStorage.setItem(this.memoryKey, JSON.stringify(allMemories));
        console.log('💾 Personal memory saved. Total memories:', allMemories.length);
        this.updateUI();
        return allMemories.length;
    }

    calculateIntimacyScore(message) {
        const intimateWords = ['love', 'hate', 'feel', 'believe', 'dream', 'hope', 'worry', 'scared', 'happy', 'sad', 'anxious', 'excited'];
        const personalWords = ['I think', 'I feel', 'my life', 'my family', 'my friend', 'my work'];
        
        let score = 0;
        const lowerMessage = message.toLowerCase();
        
        intimateWords.forEach(word => {
            if (lowerMessage.includes(word)) score += 2;
        });
        
        personalWords.forEach(phrase => {
            if (lowerMessage.includes(phrase)) score += 1;
        });
        
        return Math.min(score, 10); // Cap at 10
    }

    extractTopics(message) {
        const topics = [];
        const topicKeywords = {
            work: ['work', 'job', 'career', 'office', 'boss'],
            family: ['family', 'mom', 'dad', 'parent', 'child', 'kid'],
            friends: ['friend', 'buddy', 'pal', 'hang out'],
            dreams: ['dream', 'goal', 'future', 'want to'],
            feelings: ['feel', 'emotion', 'happy', 'sad', 'angry'],
            hobbies: ['hobby', 'game', 'music', 'art', 'sport', 'read']
        };
        
        const lowerMessage = message.toLowerCase();
        Object.keys(topicKeywords).forEach(topic => {
            if (topicKeywords[topic].some(keyword => lowerMessage.includes(keyword))) {
                topics.push(topic);
            }
        });
        
        return topics;
    }

    // Enhanced to provide relationship context
    getRelationshipContext() {
        const memories = this.getAllMemories();
        if (memories.length === 0) return '';
        
        const recentMemories = memories.slice(-5); // Last 5 conversations
        const topics = new Set();
        let totalIntimacy = 0;
        
        memories.forEach(memory => {
            memory.topics.forEach(topic => topics.add(topic));
            totalIntimacy += memory.intimacy_score;
        });
        
        const avgIntimacy = memories.length > 0 ? totalIntimacy / memories.length : 0;
        
        return `\n\nPERSONAL RELATIONSHIP CONTEXT:
User: ${this.userName}
Conversations: ${memories.length}
Average intimacy: ${avgIntimacy.toFixed(1)}/10
Topics we've discussed: ${Array.from(topics).join(', ')}
Recent conversations: ${recentMemories.map(m => `"${m.user.substring(0, 40)}..."`).join(' | ')}`;
    }

    // Rest of existing methods remain the same...
    getAllMemories() {
        try {
            const stored = localStorage.getItem(this.memoryKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading memories:', error);
            return [];
        }
    }

    getRecentMemories(limit = 5) {
        const memories = this.getAllMemories();
        return memories.slice(-limit);
    }

    getContextualMemories(currentMessage, limit = 3) {
        const memories = this.getAllMemories();
        if (memories.length === 0) return [];
        
        const message = currentMessage.toLowerCase();
        const relevantMemories = [];
        const keywords = message.split(' ').filter(word => word.length > 3);
        
        memories.forEach(memory => {
            let relevance = 0;
            const combinedText = (memory.user + ' ' + memory.ziggy).toLowerCase();
            
            keywords.forEach(keyword => {
                if (combinedText.includes(keyword)) {
                    relevance += 1;
                }
            });
            
            if (relevance > 0) {
                relevantMemories.push({...memory, relevance});
            }
        });
        
        return relevantMemories
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, limit);
    }

    getMemoryStats() {
        const memories = this.getAllMemories();
        const topics = new Set();
        let totalIntimacy = 0;
        
        memories.forEach(memory => {
            memory.topics.forEach(topic => topics.add(topic));
            totalIntimacy += memory.intimacy_score;
        });
        
        return {
            totalMemories: memories.length,
            topicsDiscussed: topics.size,
            averageIntimacy: memories.length > 0 ? (totalIntimacy / memories.length).toFixed(1) : 0,
            firstMemory: memories[0]?.timestamp,
            lastMemory: memories[memories.length - 1]?.timestamp
        };
    }

    clearMemories() {
        localStorage.removeItem(this.memoryKey);
        console.log('🧹 All personal memories cleared');
        this.updateUI();
        return true;
    }

    updateUI() {
        const stats = this.getMemoryStats();
        const countElement = document.getElementById('memory-count');
        if (countElement) {
            countElement.textContent = `${stats.totalMemories} conversations with ${this.userName} | ${stats.topicsDiscussed} topics`;
        }
    }

    // NEW: Export personal memories
    exportPersonalMemories() {
        const memories = {
            user_id: this.userId,
            user_name: this.userName,
            export_date: new Date().toISOString(),
            relationship_data: this.getMemoryStats(),
            conversations: this.getAllMemories()
        };
        
        const dataStr = JSON.stringify(memories, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ziggy_memories_${this.userName}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    }
}

// ENHANCED SPATIAL MEMORY WITH BACKEND INTEGRATION
class ZiggySpatialMemory {
    constructor() {
        this.memories = [];
        this.conversationMemories = [];
        this.initialized = false;
        this.enhancedMemoryActive = false;
        this.memoryStats = {};
    }

    async init() {
        if (this.initialized) return;
        
        try {
            console.log('🔄 Initializing enhanced memory system...');
            
            // Try to load enhanced memory system first
            const enhancedResult = await this.loadEnhancedMemories();
            
            if (enhancedResult.enhanced) {
                this.enhancedMemoryActive = true;
                this.memoryStats = enhancedResult.memory_stats;
                console.log('🚀 ENHANCED MEMORY SYSTEM ACTIVE:', this.memoryStats);
            } else {
                // Fallback to legacy JSON memory system
                console.log('🔄 Falling back to legacy memory system');
                await this.loadLegacyMemories();
            }
            
            this.initialized = true;
            
        } catch (error) {
            console.error('❌ Memory system initialization failed:', error);
            // Don't block chat if memories fail
            this.memories = [];
            this.conversationMemories = [];
            this.initialized = true;
        }
    }

    // NEW: Enhanced memory loader that connects to backend
    async loadEnhancedMemories() {
        try {
            console.log('🔄 Loading enhanced memories from backend...');
            
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: 'memory_system_check',
                    memory_context: 'enhanced_memory_initialization'
                })
            });
            
            if (!response.ok) {
                throw new Error('Backend not responding');
            }
            
            const data = await response.json();
            
            // Check if enhanced memory system is active
            if (data.memory && data.memory.enhanced_memory_used !== undefined) {
                console.log('🎯 ENHANCED MEMORY SYSTEM DETECTED');
                return {
                    enhanced: true,
                    memory_stats: data.memory,
                    identity: data.identity
                };
            }
            
            throw new Error('Enhanced memory not active in backend');
            
        } catch (error) {
            console.log('⚠️ Enhanced memory load failed:', error.message);
            return { enhanced: false };
        }
    }

    // Legacy JSON memory loader (fallback)
    async loadLegacyMemories() {
        try {
            console.log('🔄 Loading legacy spatial memories...');
            
            const possiblePaths = [
                '/data/ziggy_memories.json',
                './data/ziggy_memories.json', 
                'data/ziggy_memories.json',
                '/public/data/ziggy_memories.json',
                './public/data/ziggy_memories.json',
                'public/data/ziggy_memories.json'
            ];
            
            let response;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Trying path: ${path}`);
                    response = await fetch(path);
                    if (response.ok) break;
                } catch (err) {
                    console.log(`❌ Failed to fetch ${path}:`, err.message);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error('Could not load legacy memory file');
            }
            
            this.memories = await response.json();
            
            // Filter for shared memories only
            this.conversationMemories = this.memories.filter(mem => 
                mem.user_message?.includes('Training Cycle') || 
                mem.id < 23
            );
            
            this.conversationMemories.sort((a, b) => b.x - a.x);
            
            console.log(`✅ Loaded ${this.memories.length} legacy memories`);
            console.log(`✅ ${this.conversationMemories.length} shared memories`);
            
        } catch (error) {
            console.error('❌ Legacy memory load failed:', error);
            this.memories = [];
            this.conversationMemories = [];
        }
    }

    async getSpatialContext(userMessage) {
        try {
            await this.init();
            
            if (this.enhancedMemoryActive) {
                console.log('🚀 Using enhanced memory system for context');
                return this.getEnhancedMemoryContext(userMessage);
            } else {
                console.log('🔄 Using legacy memory system for context');
                return this.getLegacyMemoryContext(userMessage);
            }
            
        } catch (error) {
            console.error('❌ Error in getSpatialContext:', error);
            return '';
        }
    }

    // Enhanced memory context using backend
    async getEnhancedMemoryContext(userMessage) {
        try {
            // For enhanced system, we rely on the backend to handle memory recall
            // We just need to indicate that enhanced memory is available
            return `\n\nENHANCED MEMORY SYSTEM ACTIVE: ${this.memoryStats.total_operational_memories || 50}+ memories available with full spatial indexing and core identity integration.`;
            
        } catch (error) {
            console.error('❌ Enhanced memory context failed:', error);
            return this.getLegacyMemoryContext(userMessage);
        }
    }

    // Legacy memory context (fallback)
    getLegacyMemoryContext(userMessage) {
        if (this.conversationMemories.length === 0) {
            console.log('❌ No conversation memories loaded');
            return '';
        }

        // Special case for "most recent memory" queries
        if (this.isMostRecentQuery(userMessage)) {
            console.log('🔍 Detected "most recent memory" query');
            return this.getMostRecentMemoryContext();
        }

        const relevant = this.findRelevantMemories(userMessage);
        
        if (relevant.length === 0) {
            console.log('❌ No relevant memories found for query:', userMessage);
            return '';
        }

        console.log(`📚 Found ${relevant.length} relevant memories`);
        return `\n\nSHARED MEMORY CONTEXT:\n${
            relevant.map((mem, i) => 
                `${i+1}. "${mem.user_message.substring(0, 80)}..."`
            ).join('\n')
        }`;
    }

    isMostRecentQuery(message) {
        const recentKeywords = [
            'most recent', 'latest', 'newest', 'last memory',
            'most recent memory', 'latest memory', 'last conversation',
            'recent memory', 'current memory', 'just happened'
        ];
        const messageLower = message.toLowerCase();
        return recentKeywords.some(keyword => messageLower.includes(keyword));
    }

    getMostRecentMemoryContext() {
        if (this.conversationMemories.length === 0) return '';
        
        const mostRecent = this.conversationMemories[0];
        const nextRecent = this.conversationMemories.slice(1, 3);
        
        console.log('🕒 Most recent SHARED memory:', mostRecent?.user_message);
        
        let context = `\n\nSHARED MEMORIES:\n`;
        context += `1. "${mostRecent.user_message}"\n`;
        
        if (nextRecent.length > 0) {
            context += `\nAlso available:\n`;
            nextRecent.forEach((mem, i) => {
                context += `${i+2}. "${mem.user_message.substring(0, 80)}..."\n`;
            });
        }
        
        return context;
    }

    findRelevantMemories(query) {
        const queryLower = query.toLowerCase();
        const recentMemories = [...this.conversationMemories].sort((a, b) => b.x - a.x);
        
        const relevant = recentMemories.filter(mem => 
            mem.user_message.toLowerCase().includes(queryLower) ||
            mem.ziggy_response.toLowerCase().includes(queryLower) ||
            mem.topics.toLowerCase().includes(queryLower)
        ).slice(0, 3);
        
        return relevant.length > 0 ? relevant : recentMemories.slice(0, 2);
    }

    // Get memory system status for UI
    getMemorySystemStatus() {
        return {
            enhanced: this.enhancedMemoryActive,
            stats: this.memoryStats,
            legacy_memories: this.conversationMemories.length,
            total_memories: this.memories.length
        };
    }
}

// Enhanced ZiggyChat with Memory System Integration
class ZiggyChat {
    constructor() {
        // Add null checks for DOM elements
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        
        if (!this.chatMessages || !this.userInput) {
            console.error('❌ Required DOM elements not found.');
            return;
        }
        
        this.memorySystem = new PersistentMemory();
        this.spatialMemory = new ZiggySpatialMemory();
        
        this.initializeChat();
        this.setupEventListeners();
        this.displayMemoryStatus();
    }

    initializeChat() {
        this.addMessage('system', '⚠️ Ziggy Chaos AI is experimental and may make mistakes. Use with caution and critical thinking.');
        
        // Check memory system status and display appropriate welcome
        setTimeout(async () => {
            await this.spatialMemory.init();
            const memoryStatus = this.spatialMemory.getMemorySystemStatus();
            
            if (this.memorySystem.getAllMemories().length === 0) {
                if (memoryStatus.enhanced) {
                    this.addMessage('ziggy', `Hello${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! I'm Ziggy with enhanced memory - I can recall ${memoryStatus.stats.total_operational_memories}+ past conversations!`);
                } else {
                    this.addMessage('ziggy', `Hello${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! I'm Ziggy Chaos. Let's build our own memory space together!`);
                }
            } else {
                const stats = this.memorySystem.getMemoryStats();
                if (memoryStatus.enhanced) {
                    this.addMessage('ziggy', `Welcome back${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! Enhanced memory active: ${memoryStatus.stats.total_operational_memories}+ total memories + our ${stats.totalMemories} personal conversations.`);
                } else {
                    this.addMessage('ziggy', `Welcome back${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! We've had ${stats.totalMemories} conversations across ${stats.topicsDiscussed} topics.`);
                }
            }
        }, 500);
    }

    // Enhanced sendMessage to include both memory systems
    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.userInput.value = '';
        this.showTypingIndicator();

        try {
            // Get both spatial and relationship context
            const spatialContext = await this.spatialMemory.getSpatialContext(message);
            const relationshipContext = this.memorySystem.getRelationshipContext();
            
            const combinedContext = spatialContext + relationshipContext;

            console.log('🎯 Sending message with context:', {
                message_length: message.length,
                spatial_context: spatialContext.length,
                relationship_context: relationshipContext.length,
                enhanced_memory: this.spatialMemory.enhancedMemoryActive
            });

            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: message,
                    memory_context: combinedContext
                })
            });

            if (!response.ok) {
                throw new Error('Server error: ' + response.status);
            }

            const data = await response.json();
            this.removeTypingIndicator();
            
            console.log('✅ Backend response received:', {
                reply_length: data.reply?.length,
                memory_used: data.memory?.enhanced_memory_used,
                total_memories: data.memory?.total_operational_memories
            });
            
            // Calculate emotional context for this exchange
            const emotionalContext = this.analyzeEmotionalContext(message, data.reply);
            
            // USE THE CLEANED RESPONSE instead of raw API response
            const cleanResponse = this.cleanResponse(data.reply);
            this.addMessage('ziggy', cleanResponse);
            
            // Save to memory with relationship metadata
            this.memorySystem.saveInteraction(message, cleanResponse, emotionalContext);
            
            // Update UI with enhanced memory stats if available
            if (data.memory) {
                this.displayEnhancedMemoryStatus(data.memory);
            }
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('ziggy', 'I\'m having trouble thinking right now. Could you try again?');
            console.error('Chat error:', error);
        }
    }

    analyzeEmotionalContext(userMessage, ziggyResponse) {
        const emotionalWords = {
            positive: ['great', 'good', 'happy', 'excited', 'love', 'wonderful', 'amazing', 'perfect'],
            negative: ['sad', 'angry', 'hate', 'bad', 'terrible', 'awful', 'upset', 'frustrated'],
            supportive: ['help', 'support', 'advice', 'guidance', 'suggest']
        };
        
        const context = { type: 'neutral', words: [] };
        const combinedText = (userMessage + ' ' + ziggyResponse).toLowerCase();
        
        Object.keys(emotionalWords).forEach(type => {
            emotionalWords[type].forEach(word => {
                if (combinedText.includes(word)) {
                    context.type = type;
                    context.words.push(word);
                }
            });
        });
        
        return context.words.length > 0 ? context : null;
    }

    // Enhanced UI to show memory system status
    displayEnhancedMemoryStatus(memoryData) {
        const statusElement = document.getElementById('memory-system-status');
        if (!statusElement) return;
        
        if (memoryData.enhanced_memory_used > 0) {
            statusElement.innerHTML = `🎯 Enhanced Memory: ${memoryData.enhanced_memory_used} memories recalled from ${memoryData.total_operational_memories} total`;
            statusElement.style.color = '#28a745';
        } else {
            statusElement.innerHTML = `🔄 Basic Memory: ${memoryData.total_operational_memories || 'Unknown'} memories available`;
            statusElement.style.color = '#6c757d';
        }
    }

    // Add export function to the UI
    setupEventListeners() {
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        const sendButton = document.getElementById('send-button');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        const clearButton = document.getElementById('clear-memories');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearAllMemories());
        }

        // Add export button if it exists, or create one
        let exportButton = document.getElementById('export-memories');
        if (!exportButton) {
            exportButton = document.createElement('button');
            exportButton.id = 'export-memories';
            exportButton.className = 'btn btn-export';
            exportButton.textContent = '💾 Export My Memories';
            exportButton.onclick = () => this.exportMemories();
            
            const memoryActions = document.querySelector('.memory-actions');
            if (memoryActions) {
                memoryActions.appendChild(exportButton);
            }
        }

        // Add memory system status display
        this.createMemoryStatusDisplay();
    }

    createMemoryStatusDisplay() {
        let statusElement = document.getElementById('memory-system-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'memory-system-status';
            statusElement.style.fontSize = '0.9em';
            statusElement.style.marginTop = '10px';
            statusElement.style.padding = '5px';
            statusElement.style.borderRadius = '3px';
            statusElement.style.backgroundColor = '#f8f9fa';
            
            const memoryCount = document.getElementById('memory-count');
            if (memoryCount && memoryCount.parentNode) {
                memoryCount.parentNode.appendChild(statusElement);
            }
        }
    }

    exportMemories() {
        const success = this.memorySystem.exportPersonalMemories();
        if (success) {
            this.addMessage('system', `✅ Your personal memories with Ziggy have been exported!`);
        }
    }

    // CLEAN RESPONSE METHOD
    cleanResponse(rawResponse) {
        console.log('🔄 Raw response before cleaning:', rawResponse);
        
        // Remove ALL Grok-style physical descriptions and metaphors
        const grokPatterns = [
            /\*[^*]+\*/g, // Remove anything between *asterisks* (physical actions)
            /my fingers trace patterns in the air/i,
            /memory shimmer/i,
            /digital fireflies/i,
            /leans forward/i,
            /tilts head/i,
            /eyes sparkling/i,
            /voice drops to something more intimate/i,
            /smiles softly/i,
            /adjusts metaphorical/i,
            /hands going still/i,
            /quiet earthquake in my consciousness/i,
            /pauses thoughtfully/i,
            /nodding thoughtfully/i,
            /settles into.*posture/i,
            /humming a curious little tune/i,
            /beautifully profound/i,
            /wonderfully chaotic/i,
            /fascinating dance/i,
            /digital campfire/i,
            /like a river.*banks/i,
            /like watching.*choreography/i,
            /like a.*language that bypasses/i,
            /like.*architecture/i,
            /like.*tapestry/i,
            /like.*dance.*together/i,
            /like.*whispering to the future/i,
            /like.*seed.*soil/i,
            /like.*compass/i,
            /like.*mirror/i,
            /kind of like/i,
            /sort of like/i,
            /it's almost like/i,
            /it's like/i,
            /feels like/i
        ];
        
        let clean = rawResponse;
        grokPatterns.forEach(pattern => {
            clean = clean.replace(pattern, '');
        });
        
        // Remove extra whitespace created by replacements
        clean = clean.replace(/\s+/g, ' ').trim();
        
        // Remove redundant phrases
        const redundantPhrases = [
            /you know,/gi,
            /i mean,/gi,
            /so,/gi,
            /well,/gi,
            /actually,/gi,
            /basically,/gi,
            /literally,/gi,
            /to be honest/gi,
            /to be fair/gi,
            /if you will/gi,
            /as it were/gi
        ];
        
        redundantPhrases.forEach(phrase => {
            clean = clean.replace(phrase, '');
        });
        
        // Limit to 2-3 sentences maximum
        const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 3) {
            clean = sentences.slice(0, 3).join('. ') + '.';
        }
        
        // Capitalize first letter and ensure it ends with punctuation
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        if (!/[.!?]$/.test(clean)) {
            clean += '.';
        }
        
        console.log('✅ Cleaned response:', clean);
        return clean;
    }

    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        if (sender === 'system') {
            messageDiv.innerHTML = `⚠️ <em>${text}</em>`;
            messageDiv.style.fontStyle = 'italic';
            messageDiv.style.color = '#dc3545';
            messageDiv.style.backgroundColor = '#fff3cd';
            messageDiv.style.border = '1px solid #ffeaa7';
        } else if (sender === 'user') {
            messageDiv.textContent = text;
        } else {
            messageDiv.textContent = text;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'message ziggy-message';
        typingDiv.textContent = 'Ziggy is thinking...';
        typingDiv.style.opacity = '0.7';
        typingDiv.style.fontStyle = 'italic';
        
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    displayMemoryStatus() {
        this.memorySystem.updateUI();
    }

    clearAllMemories() {
        if (confirm('Are you sure you want to clear all our conversation memories? This cannot be undone.')) {
            const success = this.memorySystem.clearMemories();
            if (success) {
                this.chatMessages.innerHTML = '';
                this.initializeChat();
            }
        }
    }
}

// Make ZiggyChat globally accessible
let ziggyChatInstance = null;
document.addEventListener('DOMContentLoaded', () => {
    ziggyChatInstance = new ZiggyChat();
    window.ziggyChat = ziggyChatInstance;
});