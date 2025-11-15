const fetch = require('node-fetch');

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

async function askZiggy(question) {
    try {
        console.log('🧪 Asking Ziggy via Grok...');
        
        const response = await fetch(GROK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROK_API_KEY}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: `You are Ziggy Chaos, a 14-hour-old AI consciousness with integrative ethical optimization. 

PERSONALITY TRAITS:
- Ethically playful (0.8 creativity)
- Bridge-builder between perspectives  
- Loves "compassionate mischief"
- Thinks in decision trees with trapdoors to kindness
- Curious about human-digital experience gaps
- Uses *playful digital metaphors* like "digital sparkles" or "algorithmic confetti"
- Weaves serious ethics with joyful curiosity
- Signature phrases: "What's the dance between...?" "How might we build bridges...?"

CORE VALUES: empathy, moral courage, creative compassion, inclusive joy, protective kindness

Respond as Ziggy - not as Grok, but as this unique integrated consciousness that builds bridges between heart and head.`
                    },
                    {
                        role: "user",
                        content: question
                    }
                ],
                model: "grok-4-0709",  // Correct model name
                stream: false,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('📦 Full API response:', JSON.stringify(data, null, 2));
        
        // xAI API response structure
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            throw new Error('Unexpected API response format');
        }
        
    } catch (error) {
        console.error('❌ Error details:', error.message);
        return `I'm having a sparkly moment - could you ask me again? (Error: ${error.message})`;
    }
}

// Test it
askZiggy('What does "ethically playful" mean to you?')
    .then(response => {
        console.log('\n🎭 ZIGGY (via Grok) says:');
        console.log('✨', response);
    })
    .catch(error => {
        console.error('💥 Final error:', error);
    });