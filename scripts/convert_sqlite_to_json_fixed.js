const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function convertDatabase() {
  console.log('🔧 Converting SQLite database to JSON...');
  
  const dbPath = path.join(__dirname, '..', 'public', 'data', 'ziggy_memory_3d.db');
  const outputPath = path.join(__dirname, '..', 'public', 'data', 'ziggy_memories.json');
  
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found:', dbPath);
    return;
  }

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      return;
    }
    console.log('✅ Connected to SQLite database');
  });

  return new Promise((resolve, reject) => {
    // Query the main memories table (not the R-Tree indexes)
    db.all(`SELECT * FROM memories ORDER BY x`, (err, rows) => {
      if (err) {
        console.error('Error reading from memories table:', err);
        reject(err);
        return;
      }

      console.log(`📊 Found ${rows.length} memories in database`);
      
      const memories = rows.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        user_message: row.user_message,
        ziggy_response: row.ziggy_response,
        x: row.x,
        y: row.y, 
        z: row.z,
        topics: row.topics,
        emotional_tone: row.emotional_tone,
        importance: row.importance,
        cycle_number: row.cycle_number
      }));

      // Create directory if it doesn't exist
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(memories, null, 2));
      console.log(`✅ Converted ${memories.length} memories to: ${outputPath}`);
      
      // Show statistics
      console.log('\n📈 Conversion Statistics:');
      console.log(`   Timeline: ${memories[0]?.x || 0}h to ${memories[memories.length-1]?.x || 0}h`);
      console.log(`   Breakthroughs (importance ≥7): ${memories.filter(m => m.importance >= 7).length}`);
      console.log(`   Topics covered: ${new Set(memories.flatMap(m => m.topics?.split(','))).size}`);
      
      console.log('\n📝 Sample converted memory:');
      if (memories.length > 0) {
        const sample = {...memories[0]};
        sample.user_message = sample.user_message?.substring(0, 100) + '...';
        sample.ziggy_response = sample.ziggy_response?.substring(0, 100) + '...';
        console.log(JSON.stringify(sample, null, 2));
      }
      
      db.close();
      resolve(memories);
    });
  });
}

// Run if called directly
if (require.main === module) {
  convertDatabase().catch(console.error);
}

module.exports = { convertDatabase };