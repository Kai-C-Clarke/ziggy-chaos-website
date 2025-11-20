import { useState, useEffect } from 'react';
import { ZiggySpatialMemory } from '../utils/ziggy_spatial_memory.js';

export const useZiggyMemory = () => {
  const [spatialMemory, setSpatialMemory] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMemory = async () => {
      const memory = new ZiggySpatialMemory();
      await memory.init();
      
      setSpatialMemory(memory);
      setIsInitialized(true);
    };

    initializeMemory();
  }, []);

  /**
   * Get spatial context for a query
   * Returns formatted context to send to API (NOT to add to response)
   */
  const getSpatialContext = async (userMessage) => {
    if (!spatialMemory || !isInitialized) {
      console.log('Memory system not ready');
      return '';
    }

    try {
      // Get spatial thoughts
      const thoughts = await spatialMemory.thinkAbout(userMessage);
      
      if (!thoughts.focal) {
        return '';
      }

      // Format SILENT spatial context (for system prompt, not user-facing)
      const context = formatSilentSpatialContext(thoughts.focal, thoughts.nearby, thoughts.synthesis);
      
      console.log('📍 Spatial navigation:', {
        focal: thoughts.focal.user_message?.slice(0, 50),
        nearby: thoughts.nearby.length,
        synthesis: thoughts.synthesis
      });
      
      return context;
      
    } catch (error) {
      console.error('Spatial memory navigation failed:', error);
      return '';
    }
  };

  /**
   * Format spatial context SILENTLY for system prompt
   * NO verbose "exploring memory space" text
   */
  const formatSilentSpatialContext = (focal, nearby, synthesis) => {
    let context = 'RECENT CONVERSATION MEMORIES (Spatial Navigation):\n\n';
    
    context += 'FOCAL MEMORY (Most Relevant):\n';
    context += `Time: ${focal.x?.toFixed(1) || 0}h | Topic: ${focal.topics || 'general'}\n`;
    context += `User: "${focal.user_message}"\n`;
    context += `Ziggy: "${focal.ziggy_response?.slice(0, 200)}..."\n\n`;
    
    if (nearby.length > 0) {
      context += `NEARBY MEMORIES (${nearby.length} found):\n`;
      nearby.slice(0, 3).forEach((mem, i) => {
        context += `${i+1}. Distance: ${mem.distance?.toFixed(1) || 0} units\n`;
        context += `   User: "${mem.user_message?.slice(0, 80)}..."\n`;
        context += `   Ziggy: "${mem.ziggy_response?.slice(0, 80)}..."\n\n`;
      });
    }
    
    context += `Pattern: ${synthesis}`;
    
    return context;
  };

  /**
   * DEPRECATED: Old enhanceResponse function
   * Keep for backwards compatibility but don't use
   */
  const enhanceResponse = async (userMessage, baseResponse) => {
    console.warn('enhanceResponse is deprecated - use getSpatialContext instead');
    return baseResponse;
  };

  return {
    getSpatialContext,  // NEW: Use this to get context for API
    enhanceResponse,    // DEPRECATED: Don't use this
    isInitialized,
    spatialMemory
  };
};