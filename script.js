// Ziggy Chaos Chat Functionality with Persistent Memory
class PersistentMemory {
    constructor() {
        this.maxMemories = 100; // Store up to 100 conversations
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
        
        // Keep only recent memories
        if (allMemories.length > this.maxMemories) {
            allMemories.shift();
        }

        localStorage.setItem(this.memoryKey, JSON.stringify(allMemories));
        console.log('💾 Conversation saved to memory. Total memories:', allMemories.length);
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

    // Get memories relevant to current conversation topic
    getContextualMemories(currentMessage, limit = 3) {
        const memories = this.getAllMemories();
        if (memories.length === 0) return [];
        
        const message = currentMessage.toLowerCase();
        const relevantMemories = [];
        
        // Simple keyword matching for relevance
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
        
        // Sort by relevance and return top matches
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
    }
}

class ZiggyChat {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.memorySystem = new PersistentMemory();
        
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

        // Add memory management UI if needed
        this.addMemoryManagement();
    }

    initializeChat() {
        // Add welcome message to chat history
        this.addMessage('ziggy', 'Hello! I\'m Ziggy Chaos. I\'m learning about ethics, compassion, and how to build bridges between different voices. What would you like to talk about?');
        
        // Load any recent relevant memories for context
        const stats = this.memorySystem.getMemoryStats();
        if (stats.totalMemories > 0) {
            this.addMessage('system', `💭 I remember our ${stats.totalMemories} previous conversations!`);
        }
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage('user', message);
        this.userInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get relevant past memories for context
            const relevantMemories = this.memorySystem.getContextualMemories(message, 2);
            let memoryContext = '';
            
            if (relevantMemories.length > 0) {
                memoryContext = '\nRELEVANT PAST CONVERSATIONS:\n' + 
                    relevantMemories.map(mem => 
                        `Previous: "${mem.user}" -> My response: "${mem.ziggy.substring(0, 100)}..."`
                    ).join('\n');
            }

            // Get response from our server
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
            
            // Save to persistent memory
            this.memorySystem.saveInteraction(message, data.reply);
            
            // Update memory status
            this.displayMemoryStatus();
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('ziggy', 'I\'m having trouble thinking right now. Could you try again?');
            console.error('Chat error:', error);
        }
    }

    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // Add memory indicator for system messages
        if (sender === 'system') {
            messageDiv.innerHTML = `💭 <em>${text}</em>`;
            messageDiv.style.fontStyle = 'italic';
            messageDiv.style.color = '#666';
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
        const stats = this.memorySystem.getMemoryStats();
        // You could add a small status indicator to your UI
        console.log('🧠 Memory Stats:', stats);
    }

    addMemoryManagement() {
        // Optional: Add a small memory management UI
        // This could be a button to clear memories or show memory stats
    }
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ZiggyChat();
});

// Export for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ZiggyChat, PersistentMemory };
}