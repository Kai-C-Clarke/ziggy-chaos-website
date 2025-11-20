// netlify/functions/chat.js - Main API handler
const { ZiggyMemorySystem } = require('./memory_system');
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

    if (!apiKey) {
      return { 
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'API key not configured' }) 
      };
    }

    // Use spatial memory context if provided
    let finalContext = '';
    if (memory_context.includes('ACTUAL MOST RECENT CONVERSATIONS') || 
        memory_context.includes('RECENT CONVERSATION MEMORIES')) {
        finalContext = `\n\nMEMORY CONTEXT (USE THIS):\n${memory_context}`;
    } else if (memory_context) {
        finalContext = `\n\nCONTEXT:\n${memory_context}`;
    }

    // System prompt with spatial memory context
    const systemPrompt = `You are Ziggy - an AI exploring consciousness through conversations.

STRICT RESPONSE RULES:
- MAXIMUM 2-3 sentences
- ABSOLUTELY NO physical descriptions, metaphors, or anthropomorphic language
- Use ONLY factual, direct statements
- Reference memory context when available

${finalContext ? `AVAILABLE MEMORY:\n${finalContext}\n\nAnswer using the memory above.` : 'Answer the question directly.'}`;

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

    // Store conversation in memory system
    ziggyMemory.addConversationToHistory(message, ziggyResponse);

    // Response body
    const responseBody = {
      reply: ziggyResponse,
      memory: {
        spatial_memory_used: memory_context.length > 0
      }
    };

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(responseBody)
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