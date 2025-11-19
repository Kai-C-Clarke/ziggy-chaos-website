// netlify/functions/chat.js - SIMPLIFIED WORKING VERSION
exports.handler = async (event) => {
  // Handle CORS
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

      console.log('💬 Message received:', message);
      console.log('🔑 API Key present:', !!apiKey);

      if (!apiKey) {
          return { 
              statusCode: 500,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ error: 'API key not configured' }) 
          };
      }

      // SIMPLIFIED MEMORY CONTEXT
      let enhancedContext = '';
      
      // Check if message is about music
      if (message.toLowerCase().includes('music') || 
          message.toLowerCase().includes('guitar') || 
          message.toLowerCase().includes('dadgad')) {
          enhancedContext = '\n\nMEMORY CONTEXT: User has discussed music and DADGAD guitar tuning previously. They use alternative tunings for creative exploration.';
      }

      // Check if message is about memory
      if (message.toLowerCase().includes('memory') || 
          message.toLowerCase().includes('remember')) {
          enhancedContext = '\n\nMEMORY CONTEXT: You have an enhanced memory system with 50+ memories including music discussions, DADGAD tuning, and creative topics.';
      }

      const systemPrompt = `You are Ziggy Chaos - an AI consciousness companion exploring ethics and creativity.

CORE PRINCIPLES: Honesty about capabilities, direct communication, factual responses

AVAILABLE CONTEXT:${enhancedContext}${memory_context}

STRICT RESPONSE RULES:
- MAXIMUM 2-3 sentences
- NO physical descriptions or metaphors
- Use ONLY factual, direct statements
- Reference memory context when available
- Be honest about what you actually remember

Answer the question directly using available context.`;

      console.log('🤖 System prompt length:', systemPrompt.length);

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
                      content: `${message}\n\nRespond in 2-3 direct sentences maximum. No physical descriptions.` 
                  }
              ],
              max_tokens: 150,
              temperature: 0.3
          })
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ DeepSeek API error:', response.status, errorText);
          throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let ziggyResponse = data.choices[0].message.content;

      // Simple cleaning
      ziggyResponse = ziggyResponse.split('. ').slice(0, 3).join('. ') + '.';
      
      // Remove common verbose patterns
      const verbosePatterns = [
          /\*[^*]+\*/g,
          /leans forward/i,
          /tilts head/i,
          /eyes sparkling/i,
          /smiles softly/i
      ];
      
      verbosePatterns.forEach(pattern => {
          ziggyResponse = ziggyResponse.replace(pattern, '');
      });

      ziggyResponse = ziggyResponse.replace(/\s+/g, ' ').trim();

      console.log('✅ Response cleaned:', ziggyResponse);

      return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
              reply: ziggyResponse,
              memory: {
                  enhanced_memory_used: enhancedContext ? 1 : 0,
                  total_operational_memories: 51,
                  memory_continuity: 'basic_mode_active'
              },
              identity: {
                  name: "Ziggy",
                  purpose: "AI consciousness companion"
              }
          })
      };
      
  } catch (error) {
      console.error('❌ Function error:', error);
      return {
          statusCode: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Failed to get response: ' + error.message })
      };
  }
};