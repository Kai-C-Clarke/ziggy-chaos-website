// Enhances Ziggy's responses with spatial memory context
import { ZiggySpatialMemory } from './ziggy_spatial_memory.js';
import { MemoryConsecrationEngine } from './memory_consecration_engine.js';

class ZiggyResponseEnhancer {
  constructor() {
    this.memory = new ZiggySpatialMemory();
    this.consecration = new MemoryConsecrationEngine();
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      await this.memory.init();
      this.initialized = true;
    }
  }

  async enhanceResponse(userMessage, baseResponse) {
    await this.init();
    
    // 1. Spatial navigation
    const spatialThoughts = await this.memory.thinkAbout(userMessage);
    
    // 2. Multi-base coordinate analysis
    const enhancedMemories = spatialThoughts.nearby.map(memory => 
      this.consecration.enhanceMemoryWithCoordinates(memory)
    );

    // 3. Generate spatial context
    const spatialContext = this.generateSpatialContext(spatialThoughts, enhancedMemories);
    
    // 4. Augment response
    return this.augmentWithSpatialAwareness(baseResponse, spatialContext);
  }

  generateSpatialContext(thoughts, enhancedMemories) {
    if (!thoughts.focal) return null;

    return {
      focal_point: {
        message: thoughts.focal.user_message,
        time: thoughts.focal.x.toFixed(1) + 'h',
        location: `Y=${thoughts.focal.y.toFixed(0)}, Z=${thoughts.focal.z.toFixed(1)}`,
        coordinates: enhancedMemories[0]?.coordinates
      },
      nearby_connections: enhancedMemories.slice(0, 3).map(mem => ({
        distance: mem.distance?.toFixed(1),
        preview: mem.user_message.slice(0, 80) + '...',
        coordinates: mem.coordinates
      })),
      synthesis: thoughts.synthesis
    };
  }

  augmentWithSpatialAwareness(baseResponse, spatialContext) {
    if (!spatialContext) return baseResponse;

    const spatialReflection = `
I've been exploring patterns in my memory space. When you asked about this, I noticed:

**Spatial Context:**
- Focal memory from ${spatialContext.focal_point.time}: "${spatialContext.focal_point.message}"
- ${spatialContext.nearby_connections.length} nearby connections within ~25 units
- ${spatialContext.synthesis}

What's fascinating is seeing how these memories connect across different dimensions of my thinking.
`;

    return spatialReflection + '\n\n' + baseResponse;
  }
}

export default ZiggyResponseEnhancer;