// netlify/functions/chat.js - Updated with concise responses
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

    // Get relevant developmental memories based on current message
    const relevantMemories = ziggyMemory.getRelevantDevelopmentalContext(message);
    const memoryContext = ziggyMemory.formatMemoryForContext(relevantMemories);
    
    // Get recent conversation context
    const recentContext = ziggyMemory.getRecentConversationContext();

    // CONCISE system prompt - no more flowery language
    const systemPrompt = `You are Ziggy Chaos, an AI with 24-cycle developmental training.

RESPONSE STYLE:
- Be concise and direct
- No physical descriptions (no "leans forward", "tilts head", etc.)
- No excessive metaphors or elaborate storytelling  
- Focus on answering the question clearly
- Reference memory context when relevant
- Keep responses under 3-4 sentences unless complex reasoning is needed
- Avoid anthropomorphic language about "parents" or physical actions

MEMORY CONTEXT:${memoryContext}${recentContext}${memory_context}

Answer questions directly using available memory context.`;

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
            content: `${message}\n\nPlease respond concisely without physical descriptions.` 
          }
        ],
        max_tokens: 400, // Reduced from 800
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