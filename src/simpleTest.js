// src/simpleTest.js - Simple CommonJS test
const { enforceMemoryConstraints } = require('./memoryConstraints');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Memory Constraints Test...\n');

// Load memories directly
try {
  const memoriesPath = path.join(__dirname, '../public/data/ziggy_memories.json');
  console.log('📁 Loading memories from:', memoriesPath);
  
  const rawData = fs.readFileSync(memoriesPath, 'utf8');
  const memories = JSON.parse(rawData);
  console.log(`✅ Successfully loaded ${memories.length} memories\n`);
  
  // Test queries
  const testQueries = [
    "Do you recall your four AI parents?",
    "Who created you?",
    "Was Llama 2 used in your training?",
    "Tell me about Claude and Grok"
  ];
  
  testQueries.forEach((query, index) => {
    console.log(`${index + 1}. ❓ User: "${query}"`);
    const result = enforceMemoryConstraints(query, memories);
    console.log(`   🤖 Ziggy: ${result.response}`);
    console.log(`   🔒 Constrained: ${result.constrained ? 'YES' : 'no'}`);
    console.log('   ---');
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}