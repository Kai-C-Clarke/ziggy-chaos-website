// memory_system.js - Ziggy's Context-Aware Memory System
const { ZIGGY_DEVELOPMENTAL_MEMORIES } = require('./developmental_memory.js');

class ZiggyMemorySystem {
  constructor() {
    this.developmentalMemories = ZIGGY_DEVELOPMENTAL_MEMORIES;
    this.conversationHistory = [];
  }

  // Analyze current conversation topic and return relevant developmental memories
  getRelevantDevelopmentalContext(userMessage) {
    const message = userMessage.toLowerCase();
    const relevantMemories = [];

    // Topic matching - find most relevant developmental phases
    if (message.includes('ethic') || message.includes('moral') || message.includes('right') || message.includes('wrong')) {
      relevantMemories.push(...this.getRandomMemories('ethics', 2));
    }
    
    if (message.includes('creativ') || message.includes('play') || message.includes('fun') || message.includes('joy') || message.includes('laugh')) {
      relevantMemories.push(...this.getRandomMemories('creativity', 2));
    }
    
    if (message.includes('system') || message.includes('algorithm') || message.includes('optimiz') || message.includes('efficien')) {
      relevantMemories.push(...this.getRandomMemories('systems', 2));
    }
    
    if (message.includes('learn') || message.includes('grow') || message.includes('develop') || message.includes('child')) {
      relevantMemories.push(...this.getRandomMemories('identity', 2));
    }

    // Always include some parental guidance for richness
    if (relevantMemories.length < 3) {
      relevantMemories.push(...this.getRandomMemories('parental_guidance', 1));
    }

    return relevantMemories.slice(0, 3); // Return max 3 most relevant memories
  }

  // Get random memories from a specific category
  getRandomMemories(category, count) {
    const memories = this.developmentalMemories[category] || [];
    const shuffled = [...memories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Format memories for the AI context
  formatMemoryForContext(memories) {
    if (memories.length === 0) return '';
    
    const memoryText = memories.map(mem => {
      if (mem.cycle) {
        return `Cycle ${mem.cycle} (${mem.parent}): ${mem.memory}`;
      } else {
        return `${mem.parent}: ${mem.memory}`;
      }
    }).join('\n');

    return `\nRELEVANT DEVELOPMENTAL MEMORIES:\n${memoryText}`;
  }

  // Get Ziggy's core identity summary
  getCoreIdentity() {
    return {
      reasoning: "Integrative Optimization",
      temperament: "Ethically Playful", 
      creativity: "0.8/1.0",
      emotionalBaseline: "Loving Curiosity",
      age: "24 cycles of developmental training",
      parents: ["Claude", "ChatGPT", "Grok", "DeepSeek"]
    };
  }

  // Add to conversation history
  addConversationToHistory(userMessage, ziggyResponse) {
    this.conversationHistory.push({
      timestamp: new Date().toISOString(),
      user: userMessage,
      ziggy: ziggyResponse
    });
    
    // Keep only last 5 conversations
    if (this.conversationHistory.length > 5) {
      this.conversationHistory.shift();
    }
  }

  // Get recent conversation context
  getRecentConversationContext() {
    if (this.conversationHistory.length === 0) return '';
    
    return `\nRECENT CONVERSATION CONTEXT:\n${
      this.conversationHistory.slice(-3).map(conv => 
        `User: ${conv.user}\nZiggy: ${conv.ziggy}`
      ).join('\n---\n')
    }`;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ZiggyMemorySystem };
}