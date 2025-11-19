// Ziggy Chaos Chat Functionality with Persistent Memory
// ⚠️ DISCLAIMER: Ziggy Chaos AI is an experimental system and may make mistakes. Use with caution and critical thinking.

class PersistentMemory {
    constructor() {
        this.maxMemories = 100;
        this.memoryKey = 'ziggy_conversation_memory';
    }

    saveInteraction(userMessage, ziggyResponse) {
        const memory = {
            timestamp: new Date().toISOString(),
            user: userMessage,
            ziggy: ziggyResponse
        };

        const allMemories = this.getAllMemories();
        allMemories.push(memory);
        
        if (allMemories.length > this.maxMemories) {
            allMemories.shift();
        }

        localStorage.setItem(this.memoryKey, JSON.stringify(allMemories));
        console.log('💾 Conversation saved to memory. Total memories:', allMemories.length);
        this.updateUI();
        return allMemories.length;
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
        return {
            totalMemories: memories.length,
            firstMemory: memories[0]?.timestamp,
            lastMemory: memories[memories.length - 1]?.timestamp
        };
    }

    clearMemories() {
        localStorage.removeItem(this.memoryKey);
        console.log('🧹 All memories cleared');
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

class ZiggySpatialMemory {
    constructor() {
        this.memories = [];
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            const response = await fetch('/data/ziggy_memories.json');
            this.memories = await response.json();
            // Sort by timestamp - most recent first (x coordinate represents time)
            this.memories.sort((a, b) => b.x - a.x);
            this.initialized = true;
            console.log(`✅ Loaded ${this.memories.length} spatial memories`);
        } catch (error) {
            console.error('Failed to load spatial memories:', error);
            this.initialized = true;
        }
    }

    async getSpatialContext(userMessage) {
        await this.init();
        if (this.memories.length === 0) return '';

        const relevant = this.findRelevantMemories(userMessage);
        if (relevant.length === 0) return '';

        return `\n\nRECENT MEMORY CONTEXT (most recent first):
${relevant.map((mem, i) => 
    `${i+1}. [${mem.x.toFixed(1)}h ago] "${mem.user_message.substring(0, 80)}..."`
).join('\n')}`;
    }

    findRelevantMemories(query) {
        const queryLower = query.toLowerCase();
        
        // Start with most recent memories first
        const recentMemories = [...this.memories].sort((a, b) => b.x - a.x);
        
        // Find relevant memories, prioritizing recent ones
        const relevant = recentMemories.filter(mem => 
            mem.user_message.toLowerCase().includes(queryLower) ||
            mem.ziggy_response.toLowerCase().includes(queryLower) ||
            mem.topics.toLowerCase().includes(queryLower)
        ).slice(0, 3);

        return relevant.length > 0 ? relevant : recentMemories.slice(0, 2);
    }
}

class ZiggyChat {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.memorySystem = new PersistentMemory();
        this.spatialMemory = new ZiggySpatialMemory();
        
        // Expose to global scope for HTML buttons
        window.ziggyChat = this;
        
        this.setupEventListeners();
        this.initializeChat();
        this.displayMemoryStatus();
    }

    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    initializeChat() {
        // Add disclaimer message first
        this.addMessage('system', '⚠️ Ziggy Chaos AI is experimental and may make mistakes. Use with caution and critical thinking.');
        
        this.addMessage('ziggy', 'Hello! I\'m Ziggy Chaos. I can now remember our past conversations and access my spatial memory. What would you like to talk about?');
        
        const stats = this.memorySystem.getMemoryStats();
        if (stats.totalMemories > 0) {
            this.addMessage('system', `💭 I remember our ${stats.totalMemories} previous conversations!`);
        }
        
        // Update UI immediately
        this.memorySystem.updateUI();
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.userInput.value = '';
        this.showTypingIndicator();

        try {
            const relevantMemories = this.memorySystem.getContextualMemories(message, 2);
            const spatialContext = await this.spatialMemory.getSpatialContext(message);

            let memoryContext = '';
            
            if (relevantMemories.length > 0) {
                memoryContext = 'RECENT CONVERSATIONS:\n' + 
                    relevantMemories.map(mem => 
                        `You: "${mem.user}" -> Me: "${mem.ziggy.substring(0, 100)}..."`
                    ).join('\n');
            }

            if (spatialContext) {
                memoryContext += spatialContext;
            }

            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: message,
                    memory_context: memoryContext
                })
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const data = await response.json();
            this.removeTypingIndicator();
            this.addMessage('ziggy', data.reply);
            
            // Save to memory and update UI
            this.memorySystem.saveInteraction(message, data.reply);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('ziggy', 'I\'m having trouble thinking right now. Could you try again?');
            console.error('Chat error:', error);
        }
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

    // Public method for HTML buttons to call
    clearAllMemories() {
        if (confirm('Are you sure you want to clear all conversation memories? This cannot be undone.')) {
            const success = this.memorySystem.clearMemories();
            if (success) {
                this.chatMessages.innerHTML = '';
                this.initializeChat(); // Restart with disclaimer
            }
        }
    }
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ZiggyChat();
});