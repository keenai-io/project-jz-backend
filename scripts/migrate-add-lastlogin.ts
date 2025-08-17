/**
 * Migration Script: Add lastLogin Field
 * 
 * Adds lastLogin field to existing users who don't have it.
 * Sets lastLogin to null for users without the field.
 * Run with: npx tsx scripts/migrate-add-lastlogin.ts
 */

import dotenv from 'dotenv';
import { getFirestoreAdminInstance } from '@lib/firebase-admin-singleton';
import { serverLogger } from '@lib/logger.server';

// Load environment variables from .env files (prioritize .env.local)
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

// Debug: Check if Firebase env vars are available
console.log('Firebase env check:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓ set' : '✗ not set');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✓ set' : '✗ not set');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✓ set' : '✗ not set');
console.log('');

interface UserDocument {
  id: string;
  email?: string;
  name?: string;
  lastLogin?: any;
  [key: string]: any;
}

async function migrateAddLastLogin(): Promise<void> {
  console.log('🚀 Starting lastLogin field migration...\n');
  
  try {
    const firestore = getFirestoreAdminInstance();
    
    // Get all users
    console.log('📋 Fetching all users...');
    const usersSnapshot = await firestore.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('📭 No users found. Migration complete.');
      return;
    }
    
    console.log(`👥 Found ${usersSnapshot.docs.length} user(s)\n`);
    
    const usersToUpdate: UserDocument[] = [];
    
    // Check which users need the lastLogin field
    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const user: UserDocument = {
        id: doc.id,
        email: data.email,
        name: data.name,
        lastLogin: data.lastLogin,
        ...data
      };
      
      // Check if lastLogin field is missing or undefined
      if (user.lastLogin === undefined) {
        usersToUpdate.push(user);
        console.log(`📝 User needs lastLogin field: ${user.email || user.id}`);
      } else {
        console.log(`✅ User already has lastLogin field: ${user.email || user.id}`);
      }
    });
    
    if (usersToUpdate.length === 0) {
      console.log('\n🎉 All users already have lastLogin field. Migration complete.');
      return;
    }
    
    console.log(`\n🔄 Updating ${usersToUpdate.length} user(s)...\n`);
    
    // Update users in batches to avoid overwhelming Firestore
    const batchSize = 10;
    let updateCount = 0;
    
    for (let i = 0; i < usersToUpdate.length; i += batchSize) {
      const batch = firestore.batch();
      const batchUsers = usersToUpdate.slice(i, i + batchSize);
      
      batchUsers.forEach((user) => {
        const userRef = firestore.collection('users').doc(user.id);
        batch.update(userRef, {
          lastLogin: null, // Set to null initially
          updatedAt: new Date(),
        });
      });
      
      try {
        await batch.commit();
        updateCount += batchUsers.length;
        
        batchUsers.forEach((user) => {
          console.log(`✅ Updated: ${user.email || user.id}`);
        });
        
        console.log(`📊 Progress: ${updateCount}/${usersToUpdate.length} users updated\n`);
        
        // Small delay between batches to be respectful to Firestore
        if (i + batchSize < usersToUpdate.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Failed to update batch starting at index ${i}:`, error);
        serverLogger.error('Failed to update user batch in lastLogin migration', 
          error instanceof Error ? error : new Error(String(error)), 
          'system', 
          { batchStartIndex: i, batchSize: batchUsers.length }
        );
        throw error;
      }
    }
    
    console.log('🎉 Migration completed successfully!\n');
    console.log('📊 Migration Summary:');
    console.log(`   Total users: ${usersSnapshot.docs.length}`);
    console.log(`   Users updated: ${updateCount}`);
    console.log(`   Users already migrated: ${usersSnapshot.docs.length - updateCount}`);
    
    serverLogger.info('LastLogin migration completed successfully', 'system', {
      totalUsers: usersSnapshot.docs.length,
      usersUpdated: updateCount,
      usersAlreadyMigrated: usersSnapshot.docs.length - updateCount,
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    serverLogger.error('LastLogin migration failed', 
      error instanceof Error ? error : new Error(String(error)), 
      'system'
    );
    process.exit(1);
  }
}

// Show usage if help flag is provided
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: npx tsx scripts/migrate-add-lastlogin.ts');
  console.log('');
  console.log('Adds lastLogin field to existing users who do not have it.');
  console.log('Sets lastLogin to null for users without the field.');
  console.log('');
  console.log('Environment variables required:');
  console.log('  FIREBASE_PROJECT_ID');
  console.log('  FIREBASE_CLIENT_EMAIL');
  console.log('  FIREBASE_PRIVATE_KEY');
  console.log('');
  console.log('Note: This script is safe to run multiple times.');
  process.exit(0);
}

// Confirm before running in production
if (process.env.NODE_ENV === 'production') {
  console.log('⚠️  WARNING: Running migration in PRODUCTION environment!');
  console.log('💾 Please ensure you have a backup of your Firestore data.');
  console.log('🔄 This migration will add lastLogin field to existing users.');
  console.log('');
  
  // In production, require explicit confirmation
  if (!process.argv.includes('--confirm')) {
    console.log('❌ Migration cancelled. To run in production, use: --confirm flag');
    console.log('Example: npx tsx scripts/migrate-add-lastlogin.ts --confirm');
    process.exit(1);
  }
}

migrateAddLastLogin();