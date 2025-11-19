// Ziggy Chaos Chat with Personalized Relationship System
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

// Update ZiggyChat to use relationship context
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
        
        // Personalized welcome after a delay
        setTimeout(() => {
            if (this.memorySystem.getAllMemories().length === 0) {
                this.addMessage('ziggy', `Hello${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! I'm Ziggy Chaos. Let's build our own memory space together!`);
            } else {
                const stats = this.memorySystem.getMemoryStats();
                this.addMessage('ziggy', `Welcome back${this.memorySystem.userName !== 'Friend' ? ' ' + this.memorySystem.userName : ''}! We've had ${stats.totalMemories} conversations across ${stats.topicsDiscussed} topics.`);
            }
        }, 500);
    }

    // Enhanced sendMessage to include relationship context
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
                throw new Error('Server error');
            }

            const data = await response.json();
            this.removeTypingIndicator();
            
            // Calculate emotional context for this exchange
            const emotionalContext = this.analyzeEmotionalContext(message, data.reply);
            
            // USE THE CLEANED RESPONSE instead of raw API response
            const cleanResponse = this.cleanResponse(data.reply);
            this.addMessage('ziggy', cleanResponse);
            
            // Save to memory with relationship metadata
            this.memorySystem.saveInteraction(message, cleanResponse, emotionalContext);
            
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
    }

    exportMemories() {
        const success = this.memorySystem.exportPersonalMemories();
        if (success) {
            this.addMessage('system', `✅ Your personal memories with Ziggy have been exported!`);
        }
    }

    // ... rest of your existing methods (cleanResponse, addMessage, etc.) remain the same
    cleanResponse(rawResponse) {
        // Your existing cleaning code here...
    }

    addMessage(sender, text) {
        // Your existing code here...
    }

    showTypingIndicator() {
        // Your existing code here...
    }

    removeTypingIndicator() {
        // Your existing code here...
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