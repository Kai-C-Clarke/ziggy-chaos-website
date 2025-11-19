const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

function checkDatabaseStructure() {
  console.log('🔍 Checking database structure...');
  
  const dbPath = path.join(__dirname, '..', 'public', 'data', 'ziggy_memory_3d.db');
  
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

  // Check all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err);
      db.close();
      return;
    }

    console.log('\n📋 FOUND TABLES:');
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });

    // Check structure of each table
    tables.forEach(table => {
      db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
        if (err) {
          console.error(`Error getting columns for ${table.name}:`, err);
          return;
        }

        console.log(`\n📊 TABLE STRUCTURE: ${table.name}`);
        columns.forEach(col => {
          console.log(`   - ${col.name} (${col.type})`);
        });

        // Show sample data from each table
        db.all(`SELECT * FROM ${table.name} LIMIT 2`, (err, rows) => {
          if (err) {
            console.error(`Error getting sample data from ${table.name}:`, err);
            return;
          }

          console.log(`\n📝 SAMPLE DATA from ${table.name}:`);
          if (rows.length > 0) {
            console.log(JSON.stringify(rows, null, 2));
          } else {
            console.log('   (empty table)');
          }

          // If this is the last table, close the database
          if (table === tables[tables.length - 1]) {
            db.close();
            console.log('\n✅ Database check complete!');
          }
        });
      });
    });

    if (tables.length === 0) {
      db.close();
      console.log('❌ No tables found in database!');
    }
  });
}

checkDatabaseStructure();