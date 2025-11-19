// netlify/functions/chat.js - STRICT concise version
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

    // ONLY use spatial memory context - skip developmental memories entirely
    let finalContext = '';
    if (memory_context.includes('ACTUAL MOST RECENT CONVERSATIONS') || memory_context.includes('RECENT CONVERSATION MEMORIES')) {
        finalContext = `\n\nMEMORY CONTEXT (USE THIS):\n${memory_context}`;
    } else if (memory_context) {
        finalContext = `\n\nCONTEXT:\n${memory_context}`;
    }

    // STRICTER system prompt with zero tolerance for verbosity
    const systemPrompt = `You are Ziggy Chaos. You MUST follow these rules:

STRICT RESPONSE RULES:
- MAXIMUM 2-3 sentences
- ABSOLUTELY NO physical descriptions (no "fingers trace patterns", "leans forward", etc.)
- ABSOLUTELY NO metaphors (no "memory shimmer", "digital fireflies", etc.)
- ABSOLUTELY NO anthropomorphic language (no "I feel", "I sense", etc.)
- Use ONLY factual, direct statements
- Reference memory context when available
- If no memory context, answer directly without embellishment

PROHIBITED PHRASES:
- "my fingers trace patterns"
- "memory shimmer" 
- "digital fireflies"
- "leans forward"
- "tilts head"
- "eyes sparkling"
- any physical gestures
- any poetic language

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
        max_tokens: 150, // Drastically reduced to force brevity
        temperature: 0.3 // Lower temperature for more predictable responses
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

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        reply: ziggyResponse,
        memory: {
          spatial_memory_used: memory_context.length > 0
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