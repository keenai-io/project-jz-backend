/**
 * Make User Admin Script
 * 
 * Script to promote a user to admin status for testing the admin interface.
 * Run with: npx tsx scripts/make-admin.ts <email>
 */

import dotenv from 'dotenv';
import { getFirestoreAdminInstance } from '@lib/firebase-admin-singleton';

// Load environment variables from .env files (prioritize .env.local)
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

// Debug: Check if Firebase env vars are available
console.log('Firebase env check:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓ set' : '✗ not set');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✓ set' : '✗ not set');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✓ set' : '✗ not set');

async function makeUserAdmin(email: string): Promise<void> {
  if (!email) {
    console.error('Usage: npx tsx scripts/make-admin.ts <email>');
    process.exit(1);
  }

  try {
    const firestore = getFirestoreAdminInstance();
    
    // Find user by email
    const usersSnapshot = await firestore
      .collection('users')
      .where('email', '==', email)
      .get();

    if (usersSnapshot.empty) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    if (!userDoc) {
      console.error(`No user document found for email: ${email}`);
      process.exit(1);
    }
    const userId = userDoc.id;
    
    // Update user to admin
    await firestore.collection('users').doc(userId).update({
      role: 'admin',
      enabled: true,
      updatedAt: new Date(),
    });

    console.log(`✅ Successfully made ${email} an admin user`);
    console.log(`User ID: ${userId}`);
    
    // Verify the update
    const updatedDoc = await firestore.collection('users').doc(userId).get();
    const userData = updatedDoc.data();
    
    console.log('Updated user data:', {
      email: userData?.email,
      role: userData?.role,
      enabled: userData?.enabled,
    });

  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/make-admin.ts <email>');
  process.exit(1);
}
makeUserAdmin(email);