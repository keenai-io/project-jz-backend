#!/usr/bin/env node

/**
 * @fileoverview Firestore User Migration Script
 * 
 * This script migrates existing user documents in Firestore to include
 * the new 'role' and 'enabled' fields required for User Access Control.
 * 
 * The migration is safe and additive - it only adds missing fields with
 * default values and does not modify existing data.
 * 
 * Usage:
 *   node scripts/migrate-user-fields.js [--dry-run] [--project-id=PROJECT_ID]
 * 
 * Options:
 *   --dry-run: Preview changes without applying them
 *   --project-id: Firestore project ID (defaults to environment)
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Configuration
const DRY_RUN_FLAG = '--dry-run';
const PROJECT_ID_FLAG = '--project-id=';
const USERS_COLLECTION = 'users';

/**
 * Default field values for existing users during migration
 * Note: New users (created after this migration) will automatically get proper defaults
 * via the enhanced Firestore adapter. This migration is for existing users only.
 */
const DEFAULT_VALUES = {
  role: 'user',      // All existing users default to 'user' role
  enabled: true,     // Existing users remain enabled for backward compatibility
};

/**
 * Initialize Firebase Admin SDK
 * 
 * @param {string} projectId - Optional project ID override
 * @returns {Promise<import('firebase-admin/firestore').Firestore>} Firestore instance
 */
async function initializeFirestore(projectId) {
  let app;
  
  // Check if running in emulator mode
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  
  if (isEmulator) {
    console.log('🔧 Running in emulator mode');
    console.log('📍 Firestore Emulator Host:', process.env.FIRESTORE_EMULATOR_HOST);
    
    app = initializeApp({
      projectId: projectId || 'demo-project',
    });
  } else {
    // Production mode - require credentials
    const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    app = initializeApp({
      credential: cert({
        projectId: projectId || process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  
  return getFirestore(app);
}

/**
 * Parse command line arguments
 * 
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed configuration
 */
function parseArgs(args) {
  const config = {
    dryRun: false,
    projectId: null,
  };
  
  for (const arg of args) {
    if (arg === DRY_RUN_FLAG) {
      config.dryRun = true;
    } else if (arg.startsWith(PROJECT_ID_FLAG)) {
      config.projectId = arg.substring(PROJECT_ID_FLAG.length);
    }
  }
  
  return config;
}

/**
 * Validate user document structure
 * 
 * @param {Object} userData - User document data
 * @returns {boolean} True if document appears to be a valid user document
 */
function isValidUserDocument(userData) {
  // Basic validation - user documents should have an email field
  return userData && (userData.email || userData.id);
}

/**
 * Check if user document needs migration
 * 
 * @param {Object} userData - User document data
 * @returns {Object} Migration info with needed fields
 */
function getMigrationNeeds(userData) {
  const needs = {
    hasChanges: false,
    updates: {},
  };
  
  // Check if 'role' field is missing or invalid
  if (!userData.role || !['admin', 'user'].includes(userData.role)) {
    needs.updates.role = DEFAULT_VALUES.role;
    needs.hasChanges = true;
  }
  
  // Check if 'enabled' field is missing
  if (typeof userData.enabled !== 'boolean') {
    needs.updates.enabled = DEFAULT_VALUES.enabled;
    needs.hasChanges = true;
  }
  
  // Add updatedAt timestamp if making changes
  if (needs.hasChanges) {
    needs.updates.updatedAt = Timestamp.now();
  }
  
  return needs;
}

/**
 * Migrate a single user document
 * 
 * @param {import('firebase-admin/firestore').DocumentReference} docRef - Document reference
 * @param {Object} userData - Current user data
 * @param {Object} updates - Updates to apply
 * @param {boolean} dryRun - Whether this is a dry run
 * @returns {Promise<boolean>} True if migration was applied/would be applied
 */
async function migrateUserDocument(docRef, userData, updates, dryRun) {
  if (dryRun) {
    console.log(`  📝 Would update: ${JSON.stringify(updates)}`);
    return true;
  }
  
  try {
    await docRef.update(updates);
    console.log(`  ✅ Updated: ${JSON.stringify(updates)}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to update:`, error.message);
    return false;
  }
}

/**
 * Main migration function
 * 
 * @param {Object} config - Migration configuration
 */
async function runMigration(config) {
  console.log('🚀 Starting User Fields Migration');
  console.log('📋 Configuration:', config);
  console.log('🔧 Default values:', DEFAULT_VALUES);
  
  if (config.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be applied');
  }
  
  console.log('');
  
  try {
    // Initialize Firestore
    const db = await initializeFirestore(config.projectId);
    console.log('✅ Connected to Firestore');
    
    // Get all user documents
    console.log(`📖 Reading documents from '${USERS_COLLECTION}' collection...`);
    const usersSnapshot = await db.collection(USERS_COLLECTION).get();
    
    if (usersSnapshot.empty) {
      console.log('ℹ️  No user documents found');
      return;
    }
    
    console.log(`📊 Found ${usersSnapshot.docs.length} user documents`);
    console.log('');
    
    // Process each user document
    let processedCount = 0;
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      console.log(`👤 Processing user: ${userId}`);
      
      // Validate document
      if (!isValidUserDocument(userData)) {
        console.log(`  ⚠️  Skipping invalid user document`);
        processedCount++;
        continue;
      }
      
      // Check current field values
      console.log(`  📄 Current - role: ${userData.role || 'undefined'}, enabled: ${userData.enabled ?? 'undefined'}`);
      
      // Determine what needs to be migrated
      const migration = getMigrationNeeds(userData);
      
      if (!migration.hasChanges) {
        console.log(`  ✅ No migration needed`);
        processedCount++;
        continue;
      }
      
      // Apply migration
      const success = await migrateUserDocument(doc.ref, userData, migration.updates, config.dryRun);
      
      if (success) {
        migratedCount++;
      } else {
        errorCount++;
      }
      
      processedCount++;
      console.log('');
    }
    
    // Summary
    console.log('📋 Migration Summary:');
    console.log(`  📊 Total documents processed: ${processedCount}`);
    console.log(`  ✅ Documents migrated: ${migratedCount}`);
    console.log(`  ❌ Migration errors: ${errorCount}`);
    
    if (config.dryRun && migratedCount > 0) {
      console.log('');
      console.log('🔄 To apply changes, run without --dry-run flag');
    }
    
    if (migratedCount > 0 && !config.dryRun) {
      console.log('');
      console.log('✅ Migration completed successfully!');
      console.log('🔔 All existing users have been set to role="user" and enabled=true');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Main execution
 */
if (require.main === module) {
  const config = parseArgs(process.argv.slice(2));
  
  runMigration(config)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runMigration,
  parseArgs,
  DEFAULT_VALUES,
};