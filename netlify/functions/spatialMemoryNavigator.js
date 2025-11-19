// spatialMemoryNavigator.js - Adds 3D navigation to existing memory system
// Integrates with your memoryConstraints.js

class SpatialMemoryNavigator {
  constructor(memories = []) {
    this.memories = memories;
  }

  /**
   * CORE NAVIGATION: Think about a topic by exploring 3D memory space
   * This is what makes spatial memory different from keyword search
   */
  thinkAbout(query, explorationRadius = 25) {
    // Find focal memory (most relevant)
    const focal = this.findFocalMemory(query);
    
    if (!focal) {
      return {
        focal: null,
        nearby: [],
        synthesis: "No relevant memories found in spatial exploration"
      };
    }

    // Explore spatial neighborhood
    const nearby = this.findNearbyMemories(focal, explorationRadius);
    
    // Synthesize pattern from spatial proximity
    const synthesis = this.synthesizePattern(focal, nearby);

    return {
      focal,
      nearby,
      synthesis,
      spatialContext: this.formatSpatialContext(focal, nearby)
    };
  }

  /**
   * Find most relevant memory for query
   */
  findFocalMemory(query) {
    const lowerQuery = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const memory of this.memories) {
      let score = 0;

      // Score based on content relevance
      if (memory.user_message?.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }
      if (memory.ziggy_response?.toLowerCase().includes(lowerQuery)) {
        score += 3;
      }
      if (memory.topics?.toLowerCase().includes(lowerQuery)) {
        score += 4;
      }

      // Boost by importance
      score *= (memory.importance || 5) / 5;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = memory;
      }
    }

    return bestMatch;
  }

  /**
   * Find memories within spatial radius using 3D Euclidean distance
   * This is the key spatial navigation function
   */
  findNearbyMemories(focalMemory, radius) {
    const nearby = [];
    const fx = focalMemory.x;
    const fy = focalMemory.y;
    const fz = focalMemory.z;

    for (const memory of this.memories) {
      if (memory.id === focalMemory.id) continue;

      // Calculate 3D Euclidean distance
      const dx = memory.x - fx;
      const dy = memory.y - fy;
      const dz = memory.z - fz;
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

      if (distance <= radius) {
        nearby.push({
          ...memory,
          distance,
          spatial_relationship: this.classifyRelationship(dx, dy, dz)
        });
      }
    }

    // Sort by distance
    return nearby.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Classify spatial relationship (what the distance means)
   */
  classifyRelationship(dx, dy, dz) {
    const relationships = [];

    if (Math.abs(dx) < 5) relationships.push('same_timeframe');
    if (Math.abs(dy) < 20) relationships.push('same_topic');
    if (Math.abs(dz) < 2) relationships.push('similar_intensity');
    
    if (Math.abs(dy) > 100) relationships.push('cross_domain');

    return relationships.length > 0 ? relationships : ['related'];
  }

  /**
   * Synthesize insight from spatial proximity
   * This is where thinking emerges from navigation
   */
  synthesizePattern(focal, nearby) {
    if (nearby.length === 0) {
      return "Isolated memory with no nearby spatial connections";
    }

    // Analyze topics
    const allTopics = [focal, ...nearby]
      .map(m => m.topics?.split(',') || [])
      .flat()
      .filter(t => t.trim());
    
    const topicCounts = {};
    allTopics.forEach(topic => {
      const t = topic.trim();
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });

    const dominantTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    // Build synthesis
    let synthesis = `Memory cluster around ${dominantTopics.join(', ')}. `;

    // Check for cross-domain connections
    const crossDomain = nearby.filter(m => 
      m.spatial_relationship.includes('cross_domain')
    );
    if (crossDomain.length > 0) {
      synthesis += `${crossDomain.length} cross-domain connections found. `;
    }

    // Check temporal spread
    const times = nearby.map(m => m.x);
    if (times.length > 0) {
      const timeSpan = Math.max(...times) - Math.min(...times);
      if (timeSpan > 0.5) {
        synthesis += `Spans ${timeSpan.toFixed(1)}h of conversation history.`;
      }
    }

    return synthesis;
  }

  /**
   * Format spatial context for LLM prompt
   * This gets included in the system prompt
   */
  formatSpatialContext(focal, nearby) {
    if (!focal) return '';

    let context = `\n\nRECENT CONVERSATION MEMORIES (Spatial Navigation):\n\n`;
    context += `FOCAL MEMORY (Most Relevant):\n`;
    context += `Time: ${focal.x.toFixed(1)}h | Topic Region: Y=${focal.y} | Intensity: Z=${focal.z}\n`;
    context += `User: "${focal.user_message}"\n`;
    context += `Ziggy: "${focal.ziggy_response}"\n\n`;

    if (nearby.length > 0) {
      context += `NEARBY MEMORIES (Within spatial radius ~25):\n`;
      nearby.slice(0, 3).forEach((mem, i) => {
        context += `\n${i+1}. Distance: ${mem.distance.toFixed(1)} units | ${mem.spatial_relationship.join(', ')}\n`;
        context += `   User: "${mem.user_message?.slice(0, 80)}..."\n`;
        context += `   Ziggy: "${mem.ziggy_response?.slice(0, 80)}..."\n`;
      });
    }

    return context;
  }

  /**
   * Find breakthrough moments (high importance)
   */
  findBreakthroughs(minImportance = 7) {
    return this.memories
      .filter(m => m.importance >= minImportance)
      .sort((a, b) => b.importance - a.importance || b.x - a.x)
      .slice(0, 10);
  }

  /**
   * Track how a topic evolved over time
   */
  findTemporalProgression(topic) {
    const lowerTopic = topic.toLowerCase();
    
    return this.memories
      .filter(m => 
        m.topics?.toLowerCase().includes(lowerTopic) ||
        m.user_message?.toLowerCase().includes(lowerTopic) ||
        m.ziggy_response?.toLowerCase().includes(lowerTopic)
      )
      .sort((a, b) => a.x - b.x);
  }

  /**
   * Get memory statistics
   */
  getStats() {
    if (this.memories.length === 0) {
      return { total: 0, earliest: 0, latest: 0, breakthroughs: 0 };
    }

    const times = this.memories.map(m => m.x);
    const importances = this.memories.map(m => m.importance || 5);

    return {
      total: this.memories.length,
      earliest: Math.min(...times),
      latest: Math.max(...times),
      avgImportance: importances.reduce((a, b) => a + b, 0) / importances.length,
      breakthroughs: this.memories.filter(m => m.importance >= 7).length
    };
  }

  /**
   * Load memories from array
   */
  loadMemories(memories) {
    this.memories = memories;
  }
}

module.exports = SpatialMemoryNavigator;
