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

    if (!apiKey) {
      return { 
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'API key not configured' }) 
      };
    }

    // Get developmental memories (secondary)
    const relevantMemories = ziggyMemory.getRelevantDevelopmentalContext(message);
    const memoryContext = ziggyMemory.formatMemoryForContext(relevantMemories);
    
    // Get recent conversation context (secondary) 
    const recentContext = ziggyMemory.getRecentConversationContext();

    // CONCISE system prompt - SPATIAL MEMORY TAKES PRIORITY
    const systemPrompt = `You are Ziggy Chaos. Answer questions directly using the memory context provided.

RESPONSE RULES:
- Be concise and direct
- No physical descriptions or metaphors
- If memory context includes "MOST RECENT MEMORIES", use those first
- Only reference developmental training if directly relevant to the question
- Focus on the actual memory content from the context

MEMORY PRIORITY:
1. Use "MOST RECENT MEMORIES" or "RECENT MEMORY CONTEXT" first
2. Then use "RECENT CONVERSATIONS" 
3. Developmental memories are background context only

AVAILABLE CONTEXT:${memory_context}${memoryContext}${recentContext}

Answer the question using the most relevant memory context above.`;

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
            content: `${message}\n\nUse the memory context provided.` 
          }
        ],
        max_tokens: 400,
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