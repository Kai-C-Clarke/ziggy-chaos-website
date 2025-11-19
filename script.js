// Ziggy Chaos Chat - FIXED VERSION
console.log('🚀 script.js loading...');

class PersistentMemory {
    constructor() {
        console.log('💾 PersistentMemory constructor called');
        let userId = localStorage.getItem('ziggy_user_id');
        let userName = localStorage.getItem('ziggy_user_name');
        
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ziggy_user_id', userId);
            console.log('🆕 New user ID created:', userId);
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

    getRecentMemories(limit = 5) {
        const memories = this.getAllMemories();
        return memories.slice(-limit);
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
        } else {
            console.log('❌ memory-count element not found');
        }
    }
}

// SIMPLIFIED MEMORY SYSTEM
class ZiggySpatialMemory {
    constructor() {
        console.log('🧠 ZiggySpatialMemory initialized');
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        console.log('🔄 Spatial memory init called');
        this.initialized = true;
    }

    async getSpatialContext(userMessage) {
        console.log('🔍 Getting spatial context for:', userMessage.substring(0, 50));
        return ''; // Simplified for now
    }
}

// FIXED ZiggyChat CLASS
class ZiggyChat {
    constructor() {
        console.log('🤖 ZiggyChat constructor called');
        
        // Initialize immediately
        this.initializeChatSystem();
    }

    initializeChatSystem() {
        console.log('🔄 Initializing chat system...');
        
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
        this.displayWelcomeMessage();
        console.log('✅ ZiggyChat initialized successfully');
    }

    displayWelcomeMessage() {
        console.log('👋 Displaying welcome message');
        this.addMessage('system', '⚠️ Ziggy Chaos AI is experimental and may make mistakes. Use with caution and critical thinking.');
        
        setTimeout(() => {
            const stats = this.memorySystem.getMemoryStats();
            if (stats.totalMemories === 0) {
                this.addMessage('ziggy', `Hello${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! I\'m Ziggy Chaos. Let\'s chat!`);
            } else {
                this.addMessage('ziggy', `Welcome back${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! We\'ve had ${stats.totalMemories} conversations.`);
            }
        }, 500);
    }

    setupEventListeners() {
        console.log('🎯 Setting up event listeners');
        
        // Enter key listener
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('↵ Enter key pressed');
                this.sendMessage();
            }
        });

        // Send button listener
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                console.log('📤 Send button clicked');
                this.sendMessage();
            });
        } else {
            console.log('❌ Send button not found');
        }

        console.log('✅ Event listeners setup complete');
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        console.log('📤 Sending message:', message);
        
        if (!message) {
            console.log('❌ Empty message, ignoring');
            return;
        }

        this.addMessage('user', message);
        this.userInput.value = '';
        this.showTypingIndicator();

        try {
            console.log('🔄 Calling chat function...');
            
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: message,
                    memory_context: 'basic_context'
                })
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Response data received:', data);
            
            this.removeTypingIndicator();
            
            const cleanResponse = this.cleanResponse(data.reply);
            this.addMessage('ziggy', cleanResponse);
            
            this.memorySystem.saveInteraction(message, cleanResponse);
            
        } catch (error) {
            console.error('❌ Chat error:', error);
            this.removeTypingIndicator();
            this.addMessage('ziggy', 'I\'m having trouble connecting right now. Please try again.');
        }
    }

    cleanResponse(rawResponse) {
        console.log('🔄 Cleaning response:', rawResponse);
        
        if (!rawResponse) {
            return "I didn't get a response. Please try again.";
        }
        
        // Simple cleaning
        const patterns = [
            /\*[^*]+\*/g,
            /leans forward/i,
            /tilts head/i,
            /smiles softly/i,
            /eyes sparkling/i
        ];
        
        let clean = rawResponse;
        patterns.forEach(pattern => {
            clean = clean.replace(pattern, '');
        });
        
        clean = clean.replace(/\s+/g, ' ').trim();
        
        // Limit to 2-3 sentences
        const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 3) {
            clean = sentences.slice(0, 3).join('. ') + '.';
        }
        
        // Ensure proper punctuation
        if (!/[.!?]$/.test(clean)) {
            clean += '.';
        }
        
        console.log('✅ Cleaned response:', clean);
        return clean;
    }

    addMessage(sender, text) {
        console.log(`💬 Adding ${sender} message:`, text.substring(0, 50));
        
        if (!this.chatMessages) {
            console.error('❌ chatMessages element not available');
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        console.log('✅ Message added to DOM');
    }

    showTypingIndicator() {
        console.log('⌨️ Showing typing indicator');
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
        console.log('❌ Removing typing indicator');
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showError(message) {
        console.error('🚨 Displaying error:', message);
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
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// GLOBAL INITIALIZATION
console.log('🌐 Starting ZiggyChat initialization...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM fully loaded and parsed');
    
    try {
        window.ziggyChatInstance = new ZiggyChat();
        window.ziggyChat = window.ziggyChatInstance;
        console.log('🎉 ZiggyChat successfully initialized!');
    } catch (error) {
        console.error('💥 CRITICAL ERROR initializing ZiggyChat:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #dc3545;
            color: white;
            padding: 20px;
            margin: 10px;
            border-radius: 5px;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>🚨 Ziggy Chat Failed to Load</h3>
            <p>Please refresh the page. If the problem continues, check the console for errors.</p>
            <small>Error: ${error.message}</small>
        `;
        
        document.body.appendChild(errorDiv);
    }
});

// Fallback initialization
if (document.readyState === 'loading') {
    console.log('📝 Document still loading, waiting for DOMContentLoaded');
} else {
    console.log('⚡ Document already ready, checking initialization');
    setTimeout(() => {
        if (!window.ziggyChatInstance) {
            console.log('🔄 Late initialization...');
            window.ziggyChatInstance = new ZiggyChat();
            window.ziggyChat = window.ziggyChatInstance;
        }
    }, 100);
}

console.log('🎯 script.js loaded successfully');