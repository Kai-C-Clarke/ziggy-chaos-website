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

        // Special case for "most recent memory" queries
        if (this.isMostRecentQuery(userMessage)) {
            return this.getMostRecentMemoryContext();
        }

        const relevant = this.findRelevantMemories(userMessage);
        if (relevant.length === 0) return '';

        return `\n\nRECENT MEMORY CONTEXT (most recent first):
${relevant.map((mem, i) => 
    `${i+1}. [${mem.x.toFixed(1)}h ago] "${mem.user_message.substring(0, 80)}..."`
).join('\n')}`;
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
        if (this.memories.length === 0) return '';
        
        const mostRecent = this.memories[0]; // Already sorted by recency
        const nextRecent = this.memories.slice(1, 3); // Next 2 most recent
        
        let context = `\n\nMOST RECENT MEMORIES (in chronological order):\n`;
        context += `1. [${mostRecent.x.toFixed(1)}h ago] "${mostRecent.user_message.substring(0, 100)}..."\n`;
        
        if (nextRecent.length > 0) {
            context += `\nAlso recent:\n`;
            nextRecent.forEach((mem, i) => {
                context += `${i+2}. [${mem.x.toFixed(1)}h ago] "${mem.user_message.substring(0, 80)}..."\n`;
            });
        }
        
        return context;
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