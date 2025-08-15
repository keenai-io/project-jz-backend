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
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  const databaseId = isEmulator ? '(default)' : (process.env.FIRESTORE_DATABASE_ID || '(default)');
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`🗄️  Configuring for database: ${databaseId}`);
  console.log(`🔒 Using ${isProduction ? 'production' : 'development'} security rules`);
  console.log(`🧪 Emulator mode: ${isEmulator ? 'enabled' : 'disabled'}`);
  
  const config = {
    firestore: {
      rules: isProduction ? "firestore.rules" : "firestore.rules.dev",
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
    },
    apphosting: {
      source: ".",
      ignore: [
        "firebase.json",
        "**/.*",
        "**/node_modules/**",
        "**/.next/**",
        "**/coverage/**",
        "**/test/**",
        "**/__tests__/**"
      ]
    },
    emulators: {
      auth: {
        port: 9099
      },
      firestore: {
        port: 8080
      },
      hosting: {
        port: 5000
      },
      ui: {
        enabled: true,
        port: 4000
      },
      singleProjectMode: false
    }
  };
  
  // Add database-specific configuration if not default
  if (databaseId !== '(default)') {
    config.firestore.database = databaseId;
  }
  
  return config;
}

// Generate .firebaserc configuration
function generateFirebaseRc() {
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  const projectId = isEmulator ? 'demo-project' : (process.env.FIREBASE_PROJECT_ID || 'project-jz-464301');
  
  return {
    projects: {
      staging: projectId,
      default: projectId
    },
    targets: {},
    etags: {}
  };
}

// Write firebase.json and .firebaserc
function writeFirebaseConfig() {
  try {
    // Write firebase.json
    const config = generateFirebaseConfig();
    const configPath = path.join(process.cwd(), 'firebase.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    console.log('✅ firebase.json generated successfully');
    
    // Write .firebaserc
    const firebaseRc = generateFirebaseRc();
    const firebaseRcPath = path.join(process.cwd(), '.firebaserc');
    fs.writeFileSync(firebaseRcPath, JSON.stringify(firebaseRc, null, 2) + '\n');
    console.log('✅ .firebaserc generated successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to generate Firebase config files:', error.message);
    return false;
  }
}

// Main execution
if (require.main === module) {
  const success = writeFirebaseConfig();
  process.exit(success ? 0 : 1);
}

module.exports = { generateFirebaseConfig, writeFirebaseConfig };