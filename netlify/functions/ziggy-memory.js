// Netlify Function for enhanced memory processing
const memoryData = require('../../public/data/ziggy_memories.json');

exports.handler = async (event, context) => {
  // CORS headers for browser access
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, query, radius = 2.0 } = JSON.parse(event.body);

    switch (action) {
      case 'thinkAbout':
        const result = await thinkAbout(query, radius);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      
      case 'getBreakthroughs':
        const breakthroughs = memoryData
          .filter(m => m.importance >= 7.0)
          .sort((a, b) => b.importance - a.importance);
        return {
          statusCode: 200,
          headers, 
          body: JSON.stringify(breakthroughs.slice(0, 10))
        };
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Unknown action' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function thinkAbout(query, radius) {
  // Server-side implementation of thinkAbout
  const queryLower = query.toLowerCase();
  
  const focalMemory = memoryData.find(memory => 
    memory.user_message.toLowerCase().includes(queryLower) ||
    memory.ziggy_response.toLowerCase().includes(queryLower) ||
    memory.topics.toLowerCase().includes(queryLower)
  ) || memoryData[0];

  const nearbyMemories = memoryData
    .map(memory => {
      const dx = focalMemory.x - memory.x;
      const dy = focalMemory.y - memory.y; 
      const dz = focalMemory.z - memory.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      return { ...memory, distance };
    })
    .filter(memory => memory.distance <= radius && memory.id !== focalMemory.id)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8);

  const topics = new Set();
  nearbyMemories.forEach(mem => {
    mem.topics.split(',').forEach(topic => topics.add(topic.trim()));
  });

  const synthesis = `Memory cluster around ${focalMemory.topics}. ${nearbyMemories.length} nearby memories connecting: ${Array.from(topics).slice(0, 4).join(', ')}`;

  return { focal: focalMemory, nearby: nearbyMemories, synthesis };
}