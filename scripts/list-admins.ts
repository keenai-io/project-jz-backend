/**
 * List Admin Users Script
 * 
 * Script to list all users with admin role for administrative purposes.
 * Run with: npx tsx scripts/list-admins.ts
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
console.log('');

async function listAdmins(): Promise<void> {
  try {
    const firestore = getFirestoreAdminInstance();
    
    console.log('🔍 Fetching admin users...');
    
    const adminsSnapshot = await firestore
      .collection('users')
      .where('role', '==', 'admin')
      .orderBy('createdAt', 'desc')
      .get();

    if (adminsSnapshot.empty) {
      console.log('📭 No admin users found');
      return;
    }

    console.log(`👥 Found ${adminsSnapshot.docs.length} admin user(s):\n`);

    adminsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const lastLogin = data.lastLogin 
        ? new Date(data.lastLogin.seconds * 1000).toLocaleString()
        : 'Never';
      const createdAt = data.createdAt 
        ? new Date(data.createdAt.seconds * 1000).toLocaleString()
        : 'Unknown';

      console.log(`${index + 1}. 👤 ${data.email || 'No email'}`);
      console.log(`   📧 ID: ${doc.id}`);
      console.log(`   📝 Name: ${data.name || 'No name'}`);
      console.log(`   ✅ Enabled: ${data.enabled ? 'Yes' : 'No'}`);
      console.log(`   📅 Last Login: ${lastLogin}`);
      console.log(`   🗓️  Created: ${createdAt}`);
      if (data.updatedAt) {
        const updatedAt = new Date(data.updatedAt.seconds * 1000).toLocaleString();
        console.log(`   🔄 Updated: ${updatedAt}`);
      }
      console.log('');
    });

    // Summary statistics
    const enabledAdmins = adminsSnapshot.docs.filter(doc => doc.data().enabled);
    const recentLogins = adminsSnapshot.docs.filter(doc => {
      const lastLogin = doc.data().lastLogin;
      if (!lastLogin) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(lastLogin.seconds * 1000) > thirtyDaysAgo;
    });

    console.log(`📊 Summary:`);
    console.log(`   Total admins: ${adminsSnapshot.docs.length}`);
    console.log(`   Enabled admins: ${enabledAdmins.length}`);
    console.log(`   Disabled admins: ${adminsSnapshot.docs.length - enabledAdmins.length}`);
    console.log(`   Active in last 30 days: ${recentLogins.length}`);

  } catch (error) {
    console.error('❌ Error listing admins:', error);
    process.exit(1);
  }
}

// Show usage if help flag is provided
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: npx tsx scripts/list-admins.ts');
  console.log('');
  console.log('Lists all users with admin role from Firestore.');
  console.log('');
  console.log('Environment variables required:');
  console.log('  FIREBASE_PROJECT_ID');
  console.log('  FIREBASE_CLIENT_EMAIL');
  console.log('  FIREBASE_PRIVATE_KEY');
  process.exit(0);
}

listAdmins();