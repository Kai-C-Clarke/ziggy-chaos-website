// Client-side spatial memory system (No SQLite dependency)
class ZiggySpatialMemory {
  constructor() {
    this.memories = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Load memories from static JSON file
      const response = await fetch('/data/ziggy_memories.json');
      this.memories = await response.json();
      this.initialized = true;
      console.log(`✅ Loaded ${this.memories.length} Ziggy memories`);
    } catch (error) {
      console.error('Failed to load Ziggy memories:', error);
      this.memories = this.getFallbackMemories();
      this.initialized = true;
    }
  }

  async thinkAbout(query, radius = 2.0) {
    await this.init();
    
    // Find focal memory based on query
    const focalMemory = this.findFocalMemory(query);
    if (!focalMemory) {
      return { synthesis: "No relevant memories found for this query." };
    }

    // Find nearby memories using 3D distance
    const nearbyMemories = this.findNearbyMemories(focalMemory, radius);
    
    // Generate synthesis
    const synthesis = this.generateSynthesis(focalMemory, nearbyMemories);
    
    return {
      focal: focalMemory,
      nearby: nearbyMemories,
      synthesis
    };
  }

  findFocalMemory(query) {
    const queryLower = query.toLowerCase();
    
    // Simple keyword matching - you can enhance this
    return this.memories.find(memory => 
      memory.user_message.toLowerCase().includes(queryLower) ||
      memory.ziggy_response.toLowerCase().includes(queryLower) ||
      memory.topics.toLowerCase().includes(queryLower)
    ) || this.memories[0]; // Fallback to first memory
  }

  findNearbyMemories(focalMemory, radius) {
    return this.memories
      .map(memory => {
        const distance = this.calculateDistance(focalMemory, memory);
        return { ...memory, distance };
      })
      .filter(memory => memory.distance <= radius && memory.id !== focalMemory.id)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8); // Limit to 8 nearby memories
  }

  calculateDistance(memory1, memory2) {
    // Simple 3D Euclidean distance
    const dx = memory1.x - memory2.x;
    const dy = memory1.y - memory2.y;
    const dz = memory1.z - memory2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  generateSynthesis(focal, nearby) {
    if (nearby.length === 0) {
      return `Memory cluster around ${focal.topics}. No nearby connections found.`;
    }

    const topics = new Set();
    nearby.forEach(mem => {
      mem.topics.split(',').forEach(topic => topics.add(topic.trim()));
    });

    const topicList = Array.from(topics).slice(0, 4).join(', ');
    const emotionalMoments = nearby.filter(m => m.z > 7).length;

    return `Memory cluster around ${focal.topics}. ${nearby.length} nearby memories show connections between: ${topicList}. ${emotionalMoments > 0 ? `${emotionalMoments} emotionally intense moments in this region.` : ''}`;
  }

  async findBreakthroughs(minImportance = 7.0) {
    await this.init();
    return this.memories
      .filter(memory => memory.importance >= minImportance)
      .sort((a, b) => b.importance - a.importance);
  }

  async findTemporalProgression(topic) {
    await this.init();
    const topicLower = topic.toLowerCase();
    
    return this.memories
      .filter(memory => 
        memory.topics.toLowerCase().includes(topicLower) ||
        memory.user_message.toLowerCase().includes(topicLower) ||
        memory.ziggy_response.toLowerCase().includes(topicLower)
      )
      .sort((a, b) => a.x - b.x);
  }

  getFallbackMemories() {
    // Fallback data if JSON loading fails
    return [
      {
        id: 1,
        user_message: "Hello Ziggy, how is your education progressing?",
        ziggy_response: "Oh, hello there! My education is wonderfully chaotic...",
        x: 0.0, y: 166, z: 8.0,
        topics: "ethics,creativity,learning",
        importance: 9.0
      }
    ];
  }
}

export { ZiggySpatialMemory };