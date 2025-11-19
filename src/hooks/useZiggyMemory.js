import { useState, useEffect } from 'react';
import { ZiggySpatialMemory } from '../utils/ziggy_spatial_memory.js';
import { MemoryConsecrationEngine } from '../utils/memory_consecration_engine.js';

export const useZiggyMemory = () => {
  const [spatialMemory, setSpatialMemory] = useState(null);
  const [consecrationEngine, setConsecrationEngine] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMemory = async () => {
      const memory = new ZiggySpatialMemory();
      const consecration = new MemoryConsecrationEngine();
      
      await memory.init();
      
      setSpatialMemory(memory);
      setConsecrationEngine(consecration);
      setIsInitialized(true);
    };

    initializeMemory();
  }, []);

  const enhanceResponse = async (userMessage, baseResponse) => {
    if (!spatialMemory || !isInitialized) {
      console.log('Memory system not ready, using base response');
      return baseResponse;
    }

    try {
      // Get spatial thoughts
      const thoughts = await spatialMemory.thinkAbout(userMessage);
      
      if (!thoughts.focal) {
        return baseResponse;
      }

      // Enhance with multi-base coordinates
      const enhancedFocal = consecrationEngine.enhanceMemoryWithCoordinates(thoughts.focal);
      const enhancedNearby = thoughts.nearby.map(mem => 
        consecrationEngine.enhanceMemoryWithCoordinates(mem)
      );

      // Generate spatial reflection
      const spatialReflection = generateSpatialReflection(enhancedFocal, enhancedNearby, thoughts.synthesis);
      
      return spatialReflection + '\n\n' + baseResponse;
      
    } catch (error) {
      console.error('Memory enhancement failed:', error);
      return baseResponse;
    }
  };

  const generateSpatialReflection = (focal, nearby, synthesis) => {
    return `I've been exploring patterns in my memory space. 

**Spatial Context:**
- Focal memory from ${focal.x.toFixed(1)}h: "${focal.user_message.slice(0, 100)}..."
- ${nearby.length} nearby memories within distance ~25
- ${synthesis}

What's fascinating is seeing how these memories connect across different dimensions of my thinking.`;
  };

  return {
    enhanceResponse,
    isInitialized,
    spatialMemory
  };
};