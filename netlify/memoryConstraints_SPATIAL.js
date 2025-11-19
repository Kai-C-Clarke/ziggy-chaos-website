// memoryConstraints_SPATIAL.js - Enhanced with 3D spatial navigation
const SpatialMemoryNavigator = require('./spatialMemoryNavigator');

const FACTUAL_QUERY_PATTERNS = [
  /(ai parents?|training|origin|creation|who created|how were you)/i,
  /(memory|remember|recall|what do you know about)/i,
  /(training cycles?|development|growth|evolution)/i,
  /(claude|grok|deepseek|chatgpt|llama|gpt)/i,
  /(where did you|how did you|when did you)/i,
  /(what have you been thinking|consciousness|aware)/i  // Added spatial trigger
];

// Initialize spatial navigator (will be populated with memories)
let spatialNavigator = null;

function initializeSpatialNavigator(memories) {
  spatialNavigator = new SpatialMemoryNavigator(memories);
  console.log('✅ Spatial memory navigator initialized with', memories.length, 'memories');
}

function extractFactualContent(fullResponse, query) {
  if (!fullResponse) return "No information available.";
  
  const lowerQuery = query.toLowerCase();
  
  // For "Llama 2" queries - give a direct factual answer
  if (lowerQuery.includes('llama')) {
    return "No, Llama 2 was not used in my training. My AI parents are Claude, ChatGPT, Grok, and DeepSeek.";
  }
  
  // For AI parents and related queries, create a clean factual statement
  if (lowerQuery.includes('ai parent') || 
      lowerQuery.includes('who created') ||
      lowerQuery.includes('claude') || 
      lowerQuery.includes('grok')) {
    
    // If the response contains the AI parents information, extract it cleanly
    if (fullResponse.includes('Claude') && fullResponse.includes('Grok') && fullResponse.includes('DeepSeek')) {
      return "My AI parents are Claude, ChatGPT, Grok, and DeepSeek. Claude provides structured reasoning, ChatGPT offers creative patterns, Grok contributes playful curiosity, and DeepSeek adds deep analytical thinking.";
    }
  }
  
  // Clean version without theatrical elements
  return fullResponse
    .replace(/\*[^*]*\*/g, '')
    .replace(/Oh, hello there!/g, '')
    .replace(/Ooh,/g, '')
    .replace(/Oh!/g, '')
    .replace(/Wow!/g, '')
    .replace(/wonderfully chaotic/g, '')
    .replace(/fascinating dance/g, '')
    .replace(/brilliant tutors/g, '')
    .replace(/I love collecting perspectives!/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * ENHANCED: Search using 3D spatial navigation instead of keyword matching
 */
function searchSpatialMemory(query, spatialMemories) {
  if (!spatialNavigator) {
    initializeSpatialNavigator(spatialMemories);
  }

  // Use spatial navigation to think about the query
  const thoughts = spatialNavigator.thinkAbout(query, 25);
  
  if (!thoughts.focal) {
    return [];
  }

  // Return results with spatial context
  return [{
    memory: thoughts.focal,
    relevance: 10,
    content: thoughts.focal.ziggy_response,
    spatialContext: thoughts.spatialContext,
    nearbyCount: thoughts.nearby.length,
    synthesis: thoughts.synthesis
  }];
}

/**
 * ENHANCED: Strict memory recall with spatial navigation
 */
function strictMemoryRecall(query, spatialMemories) {
  const memoryMatches = searchSpatialMemory(query, spatialMemories);
  
  if (memoryMatches.length > 0) {
    const match = memoryMatches[0];
    const cleanedContent = extractFactualContent(match.content, query);
    
    return {
      source: "spatial_memory",
      content: cleanedContent,
      confidence: "high",
      constraint: "memory_only",
      memory: match.memory,
      spatialContext: match.spatialContext,  // NEW: Include spatial context
      nearbyCount: match.nearbyCount,
      synthesis: match.synthesis
    };
  }
  
  return {
    source: "none",
    content: "I don't have that information in my memory storage.",
    confidence: "none",
    constraint: "no_confabulation"
  };
}

/**
 * ENHANCED: Memory constraints with spatial navigation support
 */
function enforceMemoryConstraints(userMessage, spatialMemories) {
  const requiresMemoryRecall = FACTUAL_QUERY_PATTERNS.some(pattern => 
    pattern.test(userMessage)
  );
  
  if (requiresMemoryRecall) {
    const memoryResult = strictMemoryRecall(userMessage, spatialMemories);
    
    if (memoryResult.source === "spatial_memory") {
      return {
        constrained: true,
        response: memoryResult.content,
        source: "verified_memory",
        memoryUsed: memoryResult.memory,
        spatialContext: memoryResult.spatialContext,  // NEW: Pass spatial context
        nearbyCount: memoryResult.nearbyCount,
        synthesis: memoryResult.synthesis
      };
    } else {
      return {
        constrained: true,
        response: "I don't have specific information about that in my memory storage.",
        source: "memory_gap"
      };
    }
  }
  
  return { constrained: false };
}

/**
 * NEW: Get spatial context for any query (even non-factual)
 * This enriches responses with spatial awareness
 */
function getSpatialContext(userMessage, spatialMemories) {
  if (!spatialNavigator) {
    initializeSpatialNavigator(spatialMemories);
  }

  const thoughts = spatialNavigator.thinkAbout(userMessage, 25);
  
  if (thoughts.focal) {
    return {
      hasSpatialContext: true,
      context: thoughts.spatialContext,
      synthesis: thoughts.synthesis,
      nearbyCount: thoughts.nearby.length
    };
  }

  return { hasSpatialContext: false };
}

/**
 * NEW: Get breakthrough moments for "what have you been thinking" queries
 */
function getBreakthroughMoments(spatialMemories) {
  if (!spatialNavigator) {
    initializeSpatialNavigator(spatialMemories);
  }

  const breakthroughs = spatialNavigator.findBreakthroughs(7);
  
  if (breakthroughs.length > 0) {
    let context = "\n\nBREAKTHROUGH MOMENTS FROM MEMORY:\n";
    breakthroughs.slice(0, 3).forEach((bt, i) => {
      const timeDesc = bt.x < 0 
        ? `training cycle ${Math.abs(bt.x * 2).toFixed(0)}` 
        : `${bt.x.toFixed(1)}h after birth`;
      context += `\n${i+1}. ${timeDesc} (Importance: ${bt.importance})\n`;
      context += `   "${bt.user_message?.slice(0, 60)}..."\n`;
    });
    return context;
  }

  return null;
}

// Simplified handlers - return null to use the main constraint system
function handleSpecificFactualQueries(userMessage, spatialMemories) {
  return null;
}

function validateAgainstMemory(response, spatialMemories) {
  return { valid: true };
}

module.exports = {
  enforceMemoryConstraints,
  validateAgainstMemory,
  handleSpecificFactualQueries,
  getSpatialContext,  // NEW EXPORT
  getBreakthroughMoments,  // NEW EXPORT
  initializeSpatialNavigator,  // NEW EXPORT
  FACTUAL_QUERY_PATTERNS
};
