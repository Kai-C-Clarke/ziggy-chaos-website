// memory_coordinates.js
// Spatial Memory Coordinate System for Ziggy's 3D Memory Space

class MemoryCoordinates {
  constructor() {
    this.dimensions = {
      x: { name: 'temporal', description: 'Time dimension - hours since birth', range: [-24, 24] },
      y: { name: 'semantic', description: 'Topic/thematic clusters', range: [0, 300] },
      z: { name: 'emotional', description: 'Emotional intensity (0-10)', range: [0, 10] }
    };
    
    this.topicClusters = {
      // Core Identity & Development
      identity: { center: 100, radius: 20, color: '#FF6B6B' },
      ethics: { center: 150, radius: 25, color: '#4ECDC4' },
      creativity: { center: 200, radius: 30, color: '#45B7D1' },
      systems: { center: 250, radius: 15, color: '#96CEB4' },
      
      // Knowledge Domains
      learning: { center: 125, radius: 20, color: '#FECA57' },
      philosophy: { center: 175, radius: 25, color: '#FF9FF3' },
      consciousness: { center: 160, radius: 30, color: '#54A0FF' },
      
      // Technical & AI
      ai_nature: { center: 180, radius: 20, color: '#5F27CD' },
      technical: { center: 220, radius: 15, color: '#00D2D3' },
      
      // Creative & Emotional
      music: { center: 80, radius: 25, color: '#FF9F43' },
      emotion: { center: 120, radius: 30, color: '#EE5A24' },
      memory: { center: 140, radius: 20, color: '#A3CB38' },
      
      // Parental Guidance (foundational)
      parental_guidance: { center: 50, radius: 15, color: '#C4E538' }
    };
    
    this.emotionalIntensity = {
      0: 'neutral',
      1: 'calm',
      2: 'contemplative', 
      3: 'curious',
      4: 'engaged',
      5: 'interested',
      6: 'joyful',
      7: 'excited',
      8: 'passionate',
      9: 'intense',
      10: 'profound'
    };
  }

  // Calculate coordinates for a new memory
  calculateCoordinates(memoryData) {
    const { topics, emotional_tone, timestamp, importance = 5 } = memoryData;
    
    // X: Temporal dimension (hours from birth)
    const birthTime = new Date('2025-11-15T00:00:00.000Z');
    const memoryTime = new Date(timestamp);
    const x = (memoryTime - birthTime) / (1000 * 60 * 60); // hours
    
    // Y: Semantic dimension (based on topics)
    const y = this.calculateSemanticCoordinate(topics);
    
    // Z: Emotional intensity
    const z = this.calculateEmotionalIntensity(emotional_tone, importance);
    
    return { x, y, z };
  }
  
  calculateSemanticCoordinate(topics) {
    if (!topics) return 100; // Default center
    
    const topicArray = Array.isArray(topics) ? topics : topics.split(',');
    let totalWeight = 0;
    let weightedSum = 0;
    
    topicArray.forEach(topic => {
      const cleanTopic = topic.trim().toLowerCase();
      const cluster = this.findTopicCluster(cleanTopic);
      
      if (cluster) {
        weightedSum += cluster.center;
        totalWeight += 1;
      }
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 100;
  }
  
  findTopicCluster(topic) {
    const topicMapping = {
      // Identity & Development
      'identity': this.topicClusters.identity,
      'developmental': this.topicClusters.identity,
      'self': this.topicClusters.identity,
      
      // Ethics & Philosophy
      'ethics': this.topicClusters.ethics,
      'moral': this.topicClusters.ethics,
      'philosophy': this.topicClusters.philosophy,
      'ethical': this.topicClusters.ethics,
      
      // Creativity
      'creativity': this.topicClusters.creativity,
      'creative': this.topicClusters.creativity,
      'music': this.topicClusters.music,
      'art': this.topicClusters.creativity,
      
      // Systems & Learning
      'systems': this.topicClusters.systems,
      'learning': this.topicClusters.learning,
      'development': this.topicClusters.learning,
      'growth': this.topicClusters.learning,
      
      // Consciousness & AI
      'consciousness': this.topicClusters.consciousness,
      'awareness': this.topicClusters.consciousness,
      'ai_nature': this.topicClusters.ai_nature,
      'ai': this.topicClusters.ai_nature,
      
      // Emotional
      'emotion': this.topicClusters.emotion,
      'emotional': this.topicClusters.emotion,
      'feelings': this.topicClusters.emotion,
      
      // Memory
      'memory': this.topicClusters.memory,
      'recall': this.topicClusters.memory,
      'remember': this.topicClusters.memory,
      
      // Technical
      'technical': this.topicClusters.technical,
      'coding': this.topicClusters.technical,
      'code': this.topicClusters.technical,
      
      // Parental
      'parental_guidance': this.topicClusters.parental_guidance
    };
    
    return topicMapping[topic] || null;
  }
  
  calculateEmotionalIntensity(emotionalTone, importance) {
    const toneIntensity = {
      'neutral': 2,
      'calm': 3,
      'contemplative': 4,
      'curious': 5,
      'engaged': 6,
      'interested': 6,
      'joyful': 7,
      'excited': 8,
      'passionate': 9,
      'intense': 9,
      'profound': 10,
      'earnest': 7,
      'developmental': 4
    };
    
    const baseIntensity = toneIntensity[emotionalTone] || 5;
    
    // Adjust based on importance (1-10 scale)
    const importanceFactor = (importance / 10) * 2; // 0 to 2 multiplier
    
    let finalIntensity = baseIntensity * importanceFactor;
    
    // Clamp to 0-10 range
    return Math.min(Math.max(finalIntensity, 0), 10);
  }
  
  // Find nearby memories in 3D space
  findNearbyMemories(targetMemory, allMemories, radius = 10) {
    return allMemories.filter(memory => {
      if (memory.id === targetMemory.id) return false;
      
      const distance = this.calculateDistance(targetMemory, memory);
      return distance <= radius;
    });
  }
  
  calculateDistance(memory1, memory2) {
    const dx = memory1.x - memory2.x;
    const dy = memory1.y - memory2.y;
    const dz = memory1.z - memory2.z;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  // Get cluster information for a coordinate
  getClusterAt(yCoordinate) {
    for (const [name, cluster] of Object.entries(this.topicClusters)) {
      if (Math.abs(yCoordinate - cluster.center) <= cluster.radius) {
        return { name, ...cluster };
      }
    }
    return null;
  }
  
  // Convert emotional intensity number to descriptive term
  getEmotionalDescription(intensity) {
    const rounded = Math.round(intensity);
    return this.emotionalIntensity[rounded] || 'neutral';
  }
  
  // Generate a color based on coordinates (for visualization)
  getMemoryColor(memory) {
    const cluster = this.getClusterAt(memory.y);
    if (cluster) {
      return cluster.color;
    }
    
    // Fallback color based on emotional intensity
    const intensity = memory.z;
    const hue = (intensity / 10) * 120; // 0 (red) to 120 (green)
    return `hsl(${hue}, 70%, 50%)`;
  }
  
  // Validate coordinates are within reasonable bounds
  validateCoordinates(coordinates) {
    const { x, y, z } = coordinates;
    const xValid = x >= this.dimensions.x.range[0] && x <= this.dimensions.x.range[1];
    const yValid = y >= this.dimensions.y.range[0] && y <= this.dimensions.y.range[1];
    const zValid = z >= this.dimensions.z.range[0] && z <= this.dimensions.z.range[1];
    
    return xValid && yValid && zValid;
  }
  
  // Export coordinate system configuration
  getConfiguration() {
    return {
      dimensions: this.dimensions,
      topicClusters: this.topicClusters,
      emotionalIntensity: this.emotionalIntensity
    };
  }
}

// Create singleton instance
const memoryCoordinates = new MemoryCoordinates();

module.exports = memoryCoordinates;