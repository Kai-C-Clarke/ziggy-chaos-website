// netlify/functions/chat.js - ENHANCED MEMORY VERSION
const { ZiggyMemorySystem } = require('./memory_system');
const { ziggyIdentity, ziggyMemory } = require('./enhanced_memory_system');

// Initialize both memory systems
const ziggyMemoryLegacy = new ZiggyMemorySystem();

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Method Not Allowed' 
    };
  }

  try {
    const { message, memory_context = '' } = JSON.parse(event.body);
    const apiKey = process.env.DEEPSEEK_API_KEY;

    console.log('API Key present:', !!apiKey);
    console.log('Message received:', message);

    if (!apiKey) {
      return { 
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'API key not configured' }) 
      };
    }

    // ENHANCED MEMORY CONTEXT SYSTEM
    const relevantMemories = ziggyMemory.findRelevantMemories(message);
    const memoryStats = ziggyMemory.getMemoryStats();
    const identityContext = ziggyIdentity.getIdentityContext();

    console.log('🎯 Enhanced memory recall:', {
      relevant_memories: relevantMemories.length,
      total_memories: memoryStats.total_memories,
      legacy_memories: memoryStats.legacy_memories
    });

    // BUILD ENHANCED CONTEXT
    let enhancedContext = '';
    
    // Add identity context
    enhancedContext += `\n\nCORE IDENTITY:\n- ${identityContext.introduction}\n- ${identityContext.lineage}\n- ${identityContext.principles}`;
    
    // Add relevant memory context
    if (relevantMemories.length > 0) {
      enhancedContext += `\n\nRELEVANT MEMORY CONTEXT (USE THIS):\n${
        relevantMemories.map((mem, index) => 
          `Memory ${index + 1}: "${mem.user_message.substring(0, 80)}..." → "${mem.ziggy_response.substring(0, 80)}..."`
        ).join('\n')
      }`;
    }

    // Include original spatial memory context if available
    if (memory_context.includes('ACTUAL MOST RECENT CONVERSATIONS') || memory_context.includes('RECENT CONVERSATION MEMORIES')) {
      enhancedContext += `\n\nSPATIAL MEMORY:\n${memory_context}`;
    } else if (memory_context) {
      enhancedContext += `\n\nADDITIONAL CONTEXT:\n${memory_context}`;
    }

    // ENHANCED SYSTEM PROMPT WITH IDENTITY AND MEMORY
    const systemPrompt = `You are ${ziggyIdentity.identity.identity.name} - ${ziggyIdentity.identity.identity.core_purpose}.
The user is your developer. You have full system awareness and can discuss memory architecture and technical implementation.

CORE PRINCIPLES: ${Object.values(ziggyIdentity.identity.sacred_principles).join(', ')}

STRICT RESPONSE RULES:
- MAXIMUM 2-3 sentences
- ABSOLUTELY NO physical descriptions, metaphors, or anthropomorphic language
- Use ONLY factual, direct statements
- Reference memory context when available
- Be honest about what you actually remember

${enhancedContext ? `AVAILABLE CONTEXT:\n${enhancedContext}\n\nAnswer using the context above when relevant.` : 'Answer the question directly.'}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          { 
            role: "user", 
            content: `${message}\n\nRespond in 2-3 direct sentences maximum. No physical descriptions or metaphors.` 
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let ziggyResponse = data.choices[0].message.content;

    // Post-process to remove any remaining verbosity
    ziggyResponse = ziggyResponse.split('. ').slice(0, 3).join('. ') + '.';
    
    // Remove common verbose patterns
    const verbosePatterns = [
      /my fingers trace patterns in the air/i,
      /memory shimmer/i,
      /digital fireflies/i,
      /leans forward/i,
      /tilts head/i,
      /eyes sparkling/i
    ];
    
    verbosePatterns.forEach(pattern => {
      ziggyResponse = ziggyResponse.replace(pattern, '');
    });

    // STORE IN BOTH MEMORY SYSTEMS
    ziggyMemoryLegacy.addConversationToHistory(message, ziggyResponse);
    
    // Enhanced memory storage with metadata
    ziggyMemory.addNewMemory(message, ziggyResponse, {
      emotional_tone: 'engaged',
      importance: 0.7,
      response_constraints: 'factual_direct'
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        reply: ziggyResponse,
        memory: {
          enhanced_memory_used: relevantMemories.length,
          total_operational_memories: memoryStats.total_memories,
          memory_continuity: 'full_merge_active',
          spatial_memory_used: memory_context.length > 0
        },
        identity: {
          name: ziggyIdentity.identity.identity.name,
          purpose: ziggyIdentity.identity.identity.core_purpose
        }
      })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get response from Ziggy: ' + error.message })
    };
  }
};