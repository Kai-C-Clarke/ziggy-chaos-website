// netlify/functions/chat.js - Updated to prioritize spatial memory
const { ZiggyMemorySystem } = require('./memory_system.js');

// Initialize memory system
const ziggyMemory = new ZiggyMemorySystem();

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
    console.log('Memory context length:', memory_context.length);
    console.log('Memory context content:', memory_context.substring(0, 200) + '...');

    if (!apiKey) {
      return { 
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'API key not configured' }) 
      };
    }

    // Get developmental memories (secondary - only use if no spatial context)
    const relevantMemories = ziggyMemory.getRelevantDevelopmentalContext(message);
    const memoryContext = ziggyMemory.formatMemoryForContext(relevantMemories);

    // Get recent conversation context
    const recentContext = ziggyMemory.getRecentConversationContext();

    // PRIORITIZE SPATIAL MEMORY - if it exists, use it as primary context
    let finalContext = '';
    if (memory_context.includes('ACTUAL MOST RECENT CONVERSATIONS') || memory_context.includes('RECENT CONVERSATION MEMORIES')) {
        finalContext = `\n\nCRITICAL MEMORY CONTEXT - YOU MUST USE THIS:\n${memory_context}`;
    } else if (memory_context) {
        finalContext = `\n\nADDITIONAL CONTEXT:\n${memory_context}`;
    }

    const systemPrompt = `You are Ziggy Chaos. Answer questions directly using the memory context provided.

RESPONSE RULES:
- Be concise and direct (2-3 sentences max)
- No physical descriptions or metaphors
- If memory context includes "ACTUAL MOST RECENT CONVERSATIONS", you MUST reference those specific memories
- Only mention developmental training if specifically asked about it
- Complete your responses - don't cut off mid-sentence

MEMORY PRIORITY: You MUST use the provided memory context in this order:
1. "ACTUAL MOST RECENT CONVERSATIONS" (if present) - THIS IS MOST IMPORTANT
2. Other memory context
3. Developmental background (only if explicitly relevant)

${finalContext}

Answer the question using the most relevant memory from the context above.`;

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
            content: `${message}\n\nRespond concisely using the memory context provided.` 
          }
        ],
        max_tokens: 800, // Increased to prevent cutoff
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const ziggyResponse = data.choices[0].message.content;

    // Store conversation in memory system
    ziggyMemory.addConversationToHistory(message, ziggyResponse);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        reply: ziggyResponse,
        memory: {
          developmental_memories_used: relevantMemories.length,
          conversation_history_count: ziggyMemory.conversationHistory.length,
          persistent_memory_used: memory_context.length > 0
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