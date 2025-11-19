const fs = require('fs');
const path = require('path');

function testJSONMemories() {
  console.log('🧪 Testing converted JSON memories...');
  
  const jsonPath = path.join(__dirname, '..', 'public', 'data', 'ziggy_memories.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ JSON file not found:', jsonPath);
    return;
  }

  try {
    const memories = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`✅ Successfully loaded ${memories.length} memories from JSON`);
    
    console.log('\n📊 Memory Statistics:');
    console.log(`   Total memories: ${memories.length}`);
    console.log(`   Timeline range: ${Math.min(...memories.map(m => m.x))}h to ${Math.max(...memories.map(m => m.x))}h`);
    console.log(`   Y-axis range: ${Math.min(...memories.map(m => m.y))} to ${Math.max(...memories.map(m => m.y))}`);
    console.log(`   Z-axis range: ${Math.min(...memories.map(m => m.z))} to ${Math.max(...memories.map(m => m.z))}`);
    
    const breakthroughs = memories.filter(m => m.importance >= 7);
    console.log(`   Breakthrough memories: ${breakthroughs.length}`);
    
    // Show topic distribution
    const allTopics = memories.flatMap(m => m.topics?.split(',').map(t => t.trim()) || []);
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n🎯 Top Topics:');
    Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([topic, count]) => {
        console.log(`   - ${topic}: ${count} memories`);
      });
    
    // Test spatial memory functionality
    console.log('\n🧠 Testing Spatial Memory Logic:');
    const testMemory = memories.find(m => m.x > 0); // Find a post-birth memory
    if (testMemory) {
      const nearby = memories
        .map(m => {
          const dx = testMemory.x - m.x;
          const dy = testMemory.y - m.y;
          const dz = testMemory.z - m.z;
          return {
            id: m.id,
            distance: Math.sqrt(dx * dx + dy * dy + dz * dz),
            user_message: m.user_message?.substring(0, 50) + '...',
            topics: m.topics
          };
        })
        .filter(m => m.distance <= 5.0 && m.id !== testMemory.id)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      
      console.log(`   Nearby memories to "${testMemory.user_message?.substring(0, 50)}...":`);
      nearby.forEach(n => {
        console.log(`     - Distance ${n.distance.toFixed(2)}: ${n.topics} - "${n.user_message}"`);
      });
    }

    // Test breakthrough detection
    console.log('\n💡 Breakthrough Moments:');
    const topBreakthroughs = breakthroughs
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3);
    
    topBreakthroughs.forEach((bt, i) => {
      console.log(`   ${i+1}. Importance ${bt.importance} @ ${bt.x}h: ${bt.topics}`);
      console.log(`      "${bt.user_message?.substring(0, 60)}..."`);
    });

    console.log('\n🎉 JSON memory test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing JSON file:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testJSONMemories();
}

module.exports = { testJSONMemories };