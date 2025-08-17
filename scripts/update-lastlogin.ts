/**
 * Update Last Login Script
 * 
 * Manually updates a user's lastLogin timestamp (for testing purposes)
 * Run with: npx tsx scripts/update-lastlogin.ts <email>
 */

import dotenv from 'dotenv';
import { getFirestoreAdminInstance } from '@lib/firebase-admin-singleton';
import { serverLogger } from '@lib/logger.server';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function updateLastLogin(email: string): Promise<void> {
  if (!email) {
    console.error('Usage: npx tsx scripts/update-lastlogin.ts <email>');
    process.exit(1);
  }

  try {
    const firestore = getFirestoreAdminInstance();
    
    // Find user by email
    console.log(`🔍 Looking up user: ${email}`);
    const usersSnapshot = await firestore
      .collection('users')
      .where('email', '==', email)
      .get();

    if (usersSnapshot.empty) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    if (!userDoc) {
      console.error(`❌ Error accessing user document for email: ${email}`);
      process.exit(1);
    }
    
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`✅ Found user: ${userData.name || 'Unknown'} (ID: ${userId})`);
    
    // Show current lastLogin
    if (userData.lastLogin) {
      const currentLastLogin = new Date(userData.lastLogin.seconds * 1000);
      console.log(`📅 Current Last Login: ${currentLastLogin.toLocaleString()}`);
    } else {
      console.log(`📅 Current Last Login: Never`);
    }
    
    // Update lastLogin timestamp
    const now = new Date();
    console.log(`🔄 Updating lastLogin to: ${now.toLocaleString()}`);
    
    await firestore.collection('users').doc(userId).update({
      lastLogin: now,
      updatedAt: now,
    });
    
    console.log(`✅ Successfully updated lastLogin for ${email}`);
    
    // Verify the update
    const updatedDoc = await firestore.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();
    
    if (updatedData?.lastLogin) {
      const newLastLogin = new Date(updatedData.lastLogin.seconds * 1000);
      console.log(`📅 New Last Login: ${newLastLogin.toLocaleString()}`);
    }
    
    serverLogger.info('Manually updated user lastLogin', 'system', {
      userId,
      email,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('❌ Error updating lastLogin:', error);
    serverLogger.error('Failed to manually update lastLogin', 
      error instanceof Error ? error : new Error(String(error)), 
      'system', 
      { email }
    );
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/update-lastlogin.ts <email>');
  process.exit(1);
}

updateLastLogin(email);