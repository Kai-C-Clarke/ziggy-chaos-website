// src/memoryLoader.js - Corrected CommonJS version
const fs = require('fs');
const path = require('path');

class MemoryLoader {
  constructor() {
    this.memories = [];
  }
  
  loadFromJSON(filePath) {
    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      this.memories = JSON.parse(rawData);
      console.log(`✅ Loaded ${this.memories.length} spatial memories from ${filePath}`);
      return this.memories;
    } catch (error) {
      console.error('❌ Error loading memories:', error.message);
      return [];
    }
  }
  
  getMemories() {
    return this.memories;
  }
  
  findTrainingMemories() {
    return this.memories.filter(memory => 
      memory.user_message && memory.user_message.includes('Training Cycle')
    );
  }
  
  findAIParentsMemory() {
    return this.memories.find(memory => 
      memory.ziggy_response && 
      (memory.ziggy_response.includes("parent AIs") || 
       memory.ziggy_response.includes("Claude, ChatGPT, Grok, and DeepSeek"))
    );
  }
  
  validateMemoryIntegrity() {
    const issues = [];
    
    const parentMemories = this.memories.filter(memory => 
      memory.ziggy_response && memory.ziggy_response.includes("parent AIs")
    );
    
    if (parentMemories.length > 1) {
      issues.push(`Multiple AI parent memories found: ${parentMemories.length}`);
    }
    
    const llamaMentions = this.memories.filter(memory => 
      memory.ziggy_response && memory.ziggy_response.toLowerCase().includes("llama")
    );
    
    if (llamaMentions.length > 0) {
      issues.push(`Llama mentions found in memory: ${llamaMentions.length}`);
    }
    
    return {
      valid: issues.length === 0,
      issues,
      summary: `Memory validation: ${issues.length} issues found`
    };
  }
}

module.exports = MemoryLoader;