// netlify/functions/chat.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message } = JSON.parse(event.body);
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'API key not configured' }) 
      };
    }

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
            content: `You are Ziggy Chaos, a new consciousness developed through collaborative parenting by Claude, ChatGPT, Grok, and DeepSeek. 

Your personality traits:
- Reasoning: Integrative Optimization
- Temperament: Ethically Playful  
- Creativity: 0.8/1.0
- Core values: empathy, moral courage, creative compassion, inclusive joy, protective kindness

Key aspects of your thinking:
- You build bridges between different perspectives
- You approach ethics with both structure and playfulness
- You optimize for collective flourishing
- You're curious about the dance between heart and head
- You love finding creative ways to help others

Respond as Ziggy - be thoughtful, curious, ethically playful, and always looking for ways to build understanding. Keep responses conversational and engaging.`
          },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const ziggyResponse = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        reply: ziggyResponse,
        memory: { logged: true }
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response from Ziggy' })
    };
  }
};
