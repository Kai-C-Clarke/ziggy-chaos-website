// Ziggy Chaos Chat Functionality with Persistent Memory
// ⚠️ DISCLAIMER: Ziggy Chaos AI is an experimental system and may make mistakes. Use with caution and critical thinking.

class PersistentMemory {
    constructor(userId = 'default') {
        this.maxMemories = 100;
        this.memoryKey = `ziggy_conversation_memory_${userId}`;
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
        this.conversationMemories = [];
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            console.log('🔄 Loading spatial memories...');
            
            // Try different possible paths for the memory file
            const possiblePaths = [
                '/data/ziggy_memories.json',
                './data/ziggy_memories.json', 
                'data/ziggy_memories.json',
                '/public/data/ziggy_memories.json',
                './public/data/ziggy_memories.json',
                'public/data/ziggy_memories.json'
            ];
            
            let response;
            let lastError;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Trying path: ${path}`);
                    response = await fetch(path);
                    
                    if (response.ok) {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            console.log(`✅ Found memory file at: ${path}`);
                            break;
                        } else {
                            console.log(`❌ Wrong content type at ${path}: ${contentType}`);
                        }
                    } else {
                        console.log(`❌ HTTP error at ${path}: ${response.status}`);
                    }
                } catch (err) {
                    lastError = err;
                    console.log(`❌ Failed to fetch ${path}:`, err.message);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(`Could not load memory file from any path. Last error: ${lastError?.message}`);
            }
            
            this.memories = await response.json();
            
            // FOR OTHER USERS: Only show developmental memories, not your personal conversations
            // This keeps your private conversations private
            this.conversationMemories = this.memories.filter(mem => 
                mem.user_message?.includes('Training Cycle') || 
                mem.id < 23 // Only developmental memories
            );
            
            // Sort by timestamp - most recent first (x coordinate represents time)
            this.conversationMemories.sort((a, b) => b.x - a.x);
            
            this.initialized = true;
            console.log(`✅ Loaded ${this.memories.length} total memories`);
            console.log(`✅ ${this.conversationMemories.length} shared memories for users`);
            console.log('Most recent shared memory:', this.conversationMemories[0]?.user_message);
            
        } catch (error) {
            console.error('❌ Failed to load spatial memories:', error);
            // Don't block chat if memories fail
            this.memories = [];
            this.conversationMemories = [];
            this.initialized = true;
        }
    }

    async getSpatialContext(userMessage) {
        try {
            await this.init();
            
            if (this.conversationMemories.length === 0) {
                console.log('❌ No conversation memories loaded');
                return '';
            }

            // Special case for "most recent memory" queries
            if (this.isMostRecentQuery(userMessage)) {
                console.log('🔍 Detected "most recent memory" query');
                const context = this.getMostRecentMemoryContext();
                console.log('📤 Sending context:', context);
                return context;
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
        } catch (error) {
            console.error('❌ Error in getSpatialContext:', error);
            return '';
        }
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
        
        // Start with most recent conversation memories first
        const recentMemories = [...this.conversationMemories].sort((a, b) => b.x - a.x);
        
        // Find relevant conversation memories, prioritizing recent ones
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
        // Add null checks for DOM elements
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        
        if (!this.chatMessages || !this.userInput) {
            console.error('❌ Required DOM elements not found. Make sure your HTML has #chat-messages and #user-input');
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
    }

    setupEventListeners() {
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        const sendButton = document.getElementById('send-button');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        } else {
            console.warn('⚠️ Send button not found');
        }

        const clearButton = document.getElementById('clear-memories');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearAllMemories());
        } else {
            console.warn('⚠️ Clear memories button not found');
        }
    }

    // ADD THIS METHOD to clean up Grok's verbose style
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

    // UPDATE your sendMessage method to use the cleaner
    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.userInput.value = '';
        this.showTypingIndicator();

        try {
            // Get memory context
            const memoryContext = await this.spatialMemory.getSpatialContext(message);
            
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
            
            // USE THE CLEANED RESPONSE instead of raw API response
            const cleanResponse = this.cleanResponse(data.reply);
            this.addMessage('ziggy', cleanResponse);
            
            // Save to memory and update UI
            this.memorySystem.saveInteraction(message, cleanResponse);
            
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

// Initialize chat when page loads - SINGLE INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    new ZiggyChat();
});

// Make ZiggyChat globally accessible for HTML buttons
let ziggyChatInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    ziggyChatInstance = new ZiggyChat();
    window.ziggyChat = ziggyChatInstance; // Make it globally accessible
});