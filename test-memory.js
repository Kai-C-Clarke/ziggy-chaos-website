// netlify/functions/test-memory.js
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    try {
        // Test different file paths
        const possiblePaths = [
            './core_identity.json',
            '../public/data/core_identity.json',
            '/opt/render/project/src/public/data/core_identity.json',
            path.join(process.cwd(), 'public', 'data', 'core_identity.json')
        ];
        
        const results = [];
        
        for (const filePath of possiblePaths) {
            try {
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    results.push(`✅ FOUND: ${filePath} (${content.length} bytes)`);
                } else {
                    results.push(`❌ NOT FOUND: ${filePath}`);
                }
            } catch (error) {
                results.push(`❌ ERROR: ${filePath} - ${error.message}`);
            }
        }
        
        // Also test current directory
        const currentDir = process.cwd();
        const filesInDir = fs.readdirSync('.');
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                current_directory: currentDir,
                files_in_directory: filesInDir,
                file_tests: results
            })
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};