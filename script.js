// Ziggy Chaos Chat - ENHANCED MEMORY VERSION
console.log('🚀 script.js loading - Enhanced Memory Edition');

class PersistentMemory {
    constructor() {
        console.log('💾 PersistentMemory constructor called');
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
                    
                    if (window.ziggyChatInstance) {
                        window.ziggyChatInstance.addMessage('ziggy', `Nice to meet you, ${userName}! I'll remember our conversations with my enhanced memory system.`);
                    }
                }, 1000);
            }
        }
        
        this.userId = userId;
        this.userName = userName || 'Friend';
        this.memoryKey = `ziggy_personal_memory_${userId}`;
        this.maxMemories = 200;
        
        console.log('💾 Memory system initialized for:', this.userName);
    }

    saveInteraction(userMessage, ziggyResponse, emotionalContext = null) {
        console.log('💾 Saving interaction:', userMessage.substring(0, 50));
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
            allMemories.shift();
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
        
        return Math.min(score, 10);
    }

    extractTopics(message) {
        const topics = [];
        const topicKeywords = {
            music: ['music', 'guitar', 'song', 'tuning', 'DADGAD', 'chord', 'melody', 'sound'],
            work: ['work', 'job', 'career', 'office', 'boss'],
            family: ['family', 'mom', 'dad', 'parent', 'child', 'kid'],
            friends: ['friend', 'buddy', 'pal', 'hang out'],
            dreams: ['dream', 'goal', 'future', 'want to'],
            feelings: ['feel', 'emotion', 'happy', 'sad', 'angry'],
            hobbies: ['hobby', 'game', 'art', 'sport', 'read']
        };
        
        const lowerMessage = message.toLowerCase();
        Object.keys(topicKeywords).forEach(topic => {
            if (topicKeywords[topic].some(keyword => lowerMessage.includes(keyword))) {
                topics.push(topic);
            }
        });
        
        return topics;
    }

    getRelationshipContext() {
        const memories = this.getAllMemories();
        if (memories.length === 0) return '';
        
        const recentMemories = memories.slice(-5);
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

    getAllMemories() {
        try {
            const stored = localStorage.getItem(this.memoryKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading memories:', error);
            return [];
        }
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
            averageIntimacy: memories.length > 0 ? (totalIntimacy / memories.length).toFixed(1) : 0
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
            countElement.textContent = `${stats.totalMemories} conversations remembered`;
        }
    }
}

// ENHANCED MEMORY SYSTEM WITH BACKEND INTEGRATION
class ZiggySpatialMemory {
    constructor() {
        console.log('🧠 ZiggySpatialMemory initialized - Enhanced Edition');
        this.enhancedMemoryActive = false;
        this.memoryStats = {};
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🔄 Initializing enhanced memory system...');
        
        try {
            // Test the enhanced memory backend
            const testResponse = await this.testEnhancedMemory();
            
            if (testResponse.enhanced) {
                this.enhancedMemoryActive = true;
                this.memoryStats = testResponse.memory_stats;
                console.log('🚀 ENHANCED MEMORY SYSTEM CONNECTED:', this.memoryStats);
            } else {
                console.log('🔄 Enhanced memory not available, using basic mode');
            }
            
        } catch (error) {
            console.log('⚠️ Enhanced memory test failed:', error.message);
        }
        
        this.initialized = true;
    }

    async testEnhancedMemory() {
        try {
            console.log('🔍 Testing enhanced memory backend...');
            
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: 'memory_system_status_check',
                    memory_context: 'testing_enhanced_memory_connection'
                })
            });
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.memory && data.memory.total_operational_memories > 0) {
                return {
                    enhanced: true,
                    memory_stats: data.memory,
                    identity: data.identity
                };
            }
            
            throw new Error('Enhanced memory not active');
            
        } catch (error) {
            console.log('❌ Enhanced memory test failed:', error.message);
            return { enhanced: false };
        }
    }

    async getSpatialContext(userMessage) {
        await this.init();
        
        if (this.enhancedMemoryActive) {
            console.log('🎯 Using enhanced memory context');
            return this.getEnhancedContext();
        } else {
            console.log('🔄 Using basic memory context');
            return this.getBasicContext(userMessage);
        }
    }

    getEnhancedContext() {
        return `\n\nENHANCED MEMORY SYSTEM ACTIVE: ${this.memoryStats.total_operational_memories || 50}+ memories available including music discussions, DADGAD tuning, and creative exploration. Full spatial indexing enabled.`;
    }

    getBasicContext(userMessage) {
        // Basic keyword matching for music
        if (userMessage.toLowerCase().includes('music') || 
            userMessage.toLowerCase().includes('guitar') || 
            userMessage.toLowerCase().includes('dadgad')) {
            return `\n\nCONTEXT: User is asking about music. Basic memory system active - enhanced memory with 50+ music memories available but not currently connected.`;
        }
        return '';
    }

    getMemoryStatus() {
        return {
            enhanced: this.enhancedMemoryActive,
            stats: this.memoryStats,
            status: this.enhancedMemoryActive ? 'enhanced_50_memories' : 'basic_mode'
        };
    }
}

// ENHANCED ZiggyChat CLASS
class ZiggyChat {
    constructor() {
        console.log('🤖 ZiggyChat constructor called - Enhanced Memory Edition');
        this.initializeChatSystem();
    }

    initializeChatSystem() {
        console.log('🔄 Initializing enhanced chat system...');
        
        // Find DOM elements
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-btn');
        
        console.log('📋 DOM elements found:', {
            chatMessages: !!this.chatMessages,
            userInput: !!this.userInput,
            sendButton: !!this.sendButton
        });

        if (!this.chatMessages || !this.userInput) {
            console.error('❌ CRITICAL: Required DOM elements not found!');
            this.showError('Chat interface not loaded properly. Please refresh the page.');
            return;
        }

        this.memorySystem = new PersistentMemory();
        this.spatialMemory = new ZiggySpatialMemory();
        
        this.setupEventListeners();
        this.displayEnhancedWelcome();
        console.log('✅ Enhanced ZiggyChat initialized successfully');
    }

    async displayEnhancedWelcome() {
        console.log('👋 Displaying enhanced welcome message');
        this.addMessage('system', '⚠️ Ziggy Chaos AI with Enhanced Memory System');
        
        // Initialize memory system
        await this.spatialMemory.init();
        const memoryStatus = this.spatialMemory.getMemoryStatus();
        
        setTimeout(() => {
            const stats = this.memorySystem.getMemoryStats();
            
            if (memoryStatus.enhanced) {
                this.addMessage('ziggy', 
                    `Hello${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! ` +
                    `🚀 ENHANCED MEMORY ACTIVE: I can recall ${memoryStatus.stats.total_operational_memories}+ past conversations including music discussions!`
                );
            } else {
                this.addMessage('ziggy', 
                    `Hello${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! ` +
                    `I'm Ziggy Chaos. Enhanced memory system connecting... (${stats.totalMemories} personal conversations)`
                );
            }
        }, 500);
    }

    setupEventListeners() {
        console.log('🎯 Setting up event listeners');
        
        // Enter key listener
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Send button listener
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        console.log('✅ Event listeners setup complete');
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        console.log('📤 Sending message:', message);
        
        if (!message) return;

        this.addMessage('user', message);
        this.userInput.value = '';
        this.showTypingIndicator();

        try {
            // Get enhanced memory context
            const memoryContext = await this.spatialMemory.getSpatialContext(message);
            const relationshipContext = this.memorySystem.getRelationshipContext();
            const combinedContext = memoryContext + relationshipContext;

            console.log('🎯 Sending with enhanced context:', {
                message: message.substring(0, 50),
                memoryContext: memoryContext.length,
                enhanced: this.spatialMemory.enhancedMemoryActive
            });

            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message,
                    memory_context: combinedContext
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Enhanced response received:', {
                reply_length: data.reply?.length,
                memory_used: data.memory?.enhanced_memory_used,
                total_memories: data.memory?.total_operational_memories
            });
            
            this.removeTypingIndicator();
            
            const cleanResponse = this.cleanResponse(data.reply);
            this.addMessage('ziggy', cleanResponse);
            
            // Save with music topic detection
            this.memorySystem.saveInteraction(message, cleanResponse);
            
            // Update UI with memory status
            this.updateEnhancedUI(data.memory);
            
        } catch (error) {
            console.error('❌ Enhanced chat error:', error);
            this.removeTypingIndicator();
            this.addMessage('ziggy', 'I\'m having trouble accessing my enhanced memory right now. Please try again.');
        }
    }

    updateEnhancedUI(memoryData) {
        let statusText = '🔄 Basic Memory Mode';
        
        if (memoryData && memoryData.enhanced_memory_used > 0) {
            statusText = `🎯 Enhanced Memory: ${memoryData.enhanced_memory_used} memories recalled from ${memoryData.total_operational_memories} total`;
        } else if (memoryData && memoryData.total_operational_memories > 0) {
            statusText = `🚀 Enhanced Memory: ${memoryData.total_operational_memories} memories available`;
        }
        
        // Update memory count display
        const countElement = document.getElementById('memory-count');
        if (countElement) {
            const stats = this.memorySystem.getMemoryStats();
            countElement.textContent = `${stats.totalMemories} personal + ${statusText}`;
        }
    }

    cleanResponse(rawResponse) {
        if (!rawResponse) return "I didn't get a response. Please try again.";
        
        let clean = rawResponse;
        
        // Remove verbose patterns
        const patterns = [
            /\*[^*]+\*/g,
            /leans forward/i,
            /tilts head/i,
            /smiles softly/i,
            /eyes sparkling/i,
            /memory shimmer/i,
            /digital fireflies/i
        ];
        
        patterns.forEach(pattern => {
            clean = clean.replace(pattern, '');
        });
        
        clean = clean.replace(/\s+/g, ' ').trim();
        
        // Limit sentences
        const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 3) {
            clean = sentences.slice(0, 3).join('. ') + '.';
        }
        
        if (!/[.!?]$/.test(clean)) {
            clean += '.';
        }
        
        return clean;
    }

    addMessage(sender, text) {
        if (!this.chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        if (!this.chatMessages) return;

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

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc3545;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 80%;
            text-align: center;
        `;
        errorDiv.textContent = `Ziggy Error: ${message}`;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// ENHANCED INITIALIZATION
console.log('🌐 Starting Enhanced ZiggyChat initialization...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM fully loaded and parsed');
    
    try {
        window.ziggyChatInstance = new ZiggyChat();
        window.ziggyChat = window.ziggyChatInstance;
        console.log('🎉 Enhanced ZiggyChat successfully initialized!');
    } catch (error) {
        console.error('💥 CRITICAL ERROR:', error);
    }
});

console.log('🎯 Enhanced script.js loaded successfully');