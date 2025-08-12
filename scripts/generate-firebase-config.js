#!/usr/bin/env node

/**
 * Generate firebase.json with environment-specific database configuration
 * This script reads FIRESTORE_DATABASE_ID from .env.local and generates
 * the appropriate Firebase configuration.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local using dotenv
require('dotenv').config({ path: '.env.local' });
console.log('📄 Loaded environment variables from .env.local');

// Generate Firebase configuration
function generateFirebaseConfig() {
  const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
  
  console.log(`🗄️  Configuring for database: ${databaseId}`);
  
  const config = {
    firestore: {
      rules: "firestore.rules",
      indexes: "firestore.indexes.json"
    },
    hosting: {
      public: "out",
      ignore: [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      rewrites: [
        {
          source: "**",
          destination: "/index.html"
        }
      ]
    }
  };
  
  // Add database-specific configuration if not default
  if (databaseId !== '(default)') {
    config.firestore.database = databaseId;
  }
  
  return config;
}

// Write firebase.json
function writeFirebaseConfig() {
  try {
    const config = generateFirebaseConfig();
    const configPath = path.join(process.cwd(), 'firebase.json');
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    console.log('✅ firebase.json generated successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to generate firebase.json:', error.message);
    return false;
  }
}

// Main execution
if (require.main === module) {
  const success = writeFirebaseConfig();
  process.exit(success ? 0 : 1);
}

module.exports = { generateFirebaseConfig, writeFirebaseConfig };