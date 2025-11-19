// src/ziggyResponseSystem.js
const { enforceMemoryConstraints, validateAgainstMemory, handleSpecificFactualQueries } = require('./memoryConstraints');

class ZiggyResponseSystem {
  constructor(spatialMemories = []) {
    this.spatialMemories = spatialMemories;
    this.conversationHistory = [];
  }
  
  async generateResponse(userMessage, spatialMemories = null) {
    const memories = spatialMemories || this.spatialMemories;
    
    // Add to conversation history
    this.conversationHistory.push({
      user: userMessage,
      timestamp: new Date().toISOString()
    });
    
    // Step 1: Check for specific factual queries first
    const specificHandler = handleSpecificFactualQueries(userMessage, memories);
    if (specificHandler) {
      return specificHandler.response;
    }
    
    // Step 2: Check general memory constraints
    const constraintCheck = enforceMemoryConstraints(userMessage, memories);
    if (constraintCheck.constrained) {
      return constraintCheck.response;
    }
    
    // Step 3: Generate normal response (simulated for now)
    const response = await this.generateNormalResponse(userMessage);
    
    // Step 4: Validate against known memories
    const validation = validateAgainstMemory(response, memories);
    if (!validation.valid) {
      console.warn('Memory validation failed:', validation.issue);
      return `I need to correct myself - ${validation.contradiction}. The accurate information from my memory is: ${validation.correctFact}. I apologize for the confusion.`;
    }
    
    return response;
  }
  
  async generateNormalResponse(userMessage) {
    // Simulated response - you'll replace this with your actual AI call
    return `I understand you're asking about "${userMessage}". This is my thoughtful response based on our conversation.`;
  }
  
  addMemory(userMessage, ziggyResponse, metadata = {}) {
    const newMemory = {
      id: this.spatialMemories.length + 1,
      timestamp: new Date().toISOString(),
      user_message: userMessage,
      ziggy_response: ziggyResponse,
      x: metadata.x || 0,
      y: metadata.y || 0,
      z: metadata.z || 0,
      topics: metadata.topics || '',
      emotional_tone: metadata.emotional_tone || 'neutral',
      importance: metadata.importance || 5,
      cycle_number: metadata.cycle_number || null
    };
    
    this.spatialMemories.push(newMemory);
    return newMemory;
  }
  
  loadMemories(memories) {
    this.spatialMemories = memories;
  }
}

module.exports = ZiggyResponseSystem;