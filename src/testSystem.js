// src/testSystem.js
const ZiggyResponseSystem = require('./ziggyResponseSystem');
const MemoryLoader = require('./memoryLoader');

async function testSystem() {
  // Load memories - use the correct path to your JSON file
  const loader = new MemoryLoader();
  const memories = loader.loadFromJSON('./public/data/ziggy_memories.json');
  
  // Initialize system
  const ziggy = new ZiggyResponseSystem(memories);
  
  // Test cases that should trigger memory constraints
  const testQueries = [
    "Do you recall your four AI parents?",
    "Who created you?",
    "What were your training cycles?",
    "Tell me about Claude and Grok",
    "Was Llama 2 used in your training?",
    "How were you developed?"
  ];
  
  console.log('🧪 Testing Memory Recall Constraints...\n');
  
  for (const query of testQueries) {
    console.log(`❓ User: ${query}`);
    const response = await ziggy.generateResponse(query);
    console.log(`🤖 Ziggy: ${response}`);
    console.log('---');
  }
  
  // Validate memory integrity
  const validation = loader.validateMemoryIntegrity();
  console.log(`\n🔍 Memory Integrity Check: ${validation.summary}`);
  if (validation.issues.length > 0) {
    console.log('Issues found:', validation.issues);
  }
}

// Run tests
testSystem().catch(console.error);