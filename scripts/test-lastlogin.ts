/**
 * Test Last Login Script
 * 
 * Quick script to check the current state of a user's lastLogin field
 * Run with: npx tsx scripts/test-lastlogin.ts <email>
 */

import dotenv from 'dotenv';
import { getFirestoreAdminInstance } from '@lib/firebase-admin-singleton';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function testLastLogin(email: string): Promise<void> {
  if (!email) {
    console.error('Usage: npx tsx scripts/test-lastlogin.ts <email>');
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
    
    const userData = userDoc.data();
    
    console.log(`✅ Found user: ${userData.name || 'Unknown'}`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`🆔 ID: ${userDoc.id}`);
    console.log(`👤 Role: ${userData.role}`);
    console.log(`✅ Enabled: ${userData.enabled ? 'Yes' : 'No'}`);
    
    if (userData.lastLogin) {
      const lastLogin = new Date(userData.lastLogin.seconds * 1000);
      console.log(`📅 Last Login: ${lastLogin.toLocaleString()}`);
    } else {
      console.log(`📅 Last Login: Never (${userData.lastLogin})`);
    }
    
    if (userData.createdAt) {
      const createdAt = new Date(userData.createdAt.seconds * 1000);
      console.log(`🗓️  Created: ${createdAt.toLocaleString()}`);
    }
    
    if (userData.updatedAt) {
      const updatedAt = new Date(userData.updatedAt.seconds * 1000);
      console.log(`🔄 Updated: ${updatedAt.toLocaleString()}`);
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/test-lastlogin.ts <email>');
  process.exit(1);
}

testLastLogin(email);