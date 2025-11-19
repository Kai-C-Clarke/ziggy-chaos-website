// memory_merge_engine.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class MemoryMerger {
  constructor() {
    this.dbPath = './ziggy_memory_3d.txt'; // Your SQLite file
    this.jsonOutput = './merged_memories.json';
  }

  async extractAllMemories() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      const memories = [];
      
      // Query all memories with spatial data
      db.all(`
        SELECT 
          m.id,
          m.timestamp,
          m.user_message,
          m.ziggy_response,
          m.x, m.y, m.z,
          m.topics,
          m.emotional_tone,
          m.importance,
          m.cycle_number,
          s.x_min, s.x_max, s.y_min, s.y_max, s.z_min, s.z_max
        FROM memories m
        LEFT JOIN memory_spatial_index s ON m.id = s.id
        ORDER BY m.timestamp
      `, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        console.log(`📊 Extracted ${rows.length} memories from SQLite`);
        
        // Transform into current memory format
        const transformed = rows.map(row => ({
          id: row.id,
          timestamp: row.timestamp,
          user_message: row.user_message,
          ziggy_response: row.ziggy_response,
          spatial_context: {
            temporal: row.x,
            thematic: row.y, 
            emotional: row.z,
            bounding_box: {
              x: [row.x_min, row.x_max],
              y: [row.y_min, row.y_max],
              z: [row.z_min, row.z_max]
            }
          },
          metadata: {
            topics: row.topics ? row.topics.split(',') : [],
            emotional_tone: row.emotional_tone,
            importance: row.importance,
            cycle_number: row.cycle_number,
            source: 'sqlite_legacy'
          }
        }));

        db.close();
        resolve(transformed);
      });
    });
  }
}