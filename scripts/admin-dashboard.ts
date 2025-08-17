/**
 * Admin Dashboard Script
 * 
 * Provides comprehensive admin user management information including
 * statistics, user lists, and security auditing.
 * Run with: npx tsx scripts/admin-dashboard.ts [action]
 * Actions: list, stats, audit (default: list)
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

const action = process.argv[2] || 'list';

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  enabledAdmins: number;
  disabledAdmins: number;
}

interface AdminUser {
  email: string;
  name: string;
  enabled: boolean;
  lastLogin: Date | null;
  createdAt: Date | null;
}

async function getAdminStats(): Promise<AdminStats> {
  const firestore = getFirestoreAdminInstance();
  
  const [allUsersSnapshot, adminSnapshot, enabledAdminSnapshot] = await Promise.all([
    firestore.collection('users').count().get(),
    firestore.collection('users').where('role', '==', 'admin').count().get(),
    firestore.collection('users').where('role', '==', 'admin').where('enabled', '==', true).count().get()
  ]);

  return {
    totalUsers: allUsersSnapshot.data().count,
    totalAdmins: adminSnapshot.data().count,
    enabledAdmins: enabledAdminSnapshot.data().count,
    disabledAdmins: adminSnapshot.data().count - enabledAdminSnapshot.data().count
  };
}

async function listAdmins(): Promise<AdminUser[]> {
  const firestore = getFirestoreAdminInstance();
  
  const adminsSnapshot = await firestore
    .collection('users')
    .where('role', '==', 'admin')
    .orderBy('createdAt', 'desc')
    .get();

  console.log('## 👥 Admin Users\n');

  if (adminsSnapshot.empty) {
    console.log('No admin users found\n');
    return [];
  }

  const admins: AdminUser[] = [];
  adminsSnapshot.docs.forEach((doc, index) => {
    const data = doc.data();
    const admin: AdminUser = {
      email: data.email || 'No email',
      name: data.name || 'No name',
      enabled: data.enabled,
      lastLogin: data.lastLogin ? new Date(data.lastLogin.seconds * 1000) : null,
      createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : null
    };
    
    admins.push(admin);
    
    console.log(`**${index + 1}. ${admin.email}**`);
    console.log(`- Status: ${admin.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`- Name: ${admin.name}`);
    console.log(`- Last Login: ${admin.lastLogin ? admin.lastLogin.toLocaleString() : 'Never'}`);
    console.log(`- Created: ${admin.createdAt ? admin.createdAt.toLocaleString() : 'Unknown'}`);
    console.log('');
  });

  return admins;
}

async function generateAuditReport(): Promise<void> {
  console.log('## 🔍 Admin Audit Report\n');
  
  const admins = await listAdmins();
  const stats = await getAdminStats();
  
  console.log('### Security Analysis\n');
  
  // Check for potential security issues
  const issues: string[] = [];
  
  if (stats.enabledAdmins === 0) {
    issues.push('⚠️ **No enabled admin users found** - System may be inaccessible');
  }
  
  if (stats.enabledAdmins > 5) {
    issues.push(`⚠️ **High number of admins** - ${stats.enabledAdmins} enabled admins (consider reducing)`);
  }
  
  const inactiveAdmins = admins.filter(admin => {
    if (!admin.lastLogin) return true;
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    return admin.lastLogin < ninetyDaysAgo;
  });
  
  if (inactiveAdmins.length > 0) {
    issues.push(`⚠️ **Inactive admins detected** - ${inactiveAdmins.length} admin(s) haven't logged in recently`);
    console.log('**Inactive Admins:**');
    inactiveAdmins.forEach(admin => {
      console.log(`- ${admin.email}: Last login ${admin.lastLogin ? admin.lastLogin.toLocaleString() : 'never'}`);
    });
    console.log('');
  }
  
  if (issues.length === 0) {
    console.log('✅ No security issues detected\n');
  } else {
    issues.forEach(issue => console.log(issue));
    console.log('');
  }
  
  console.log('### Recommendations\n');
  console.log('- Regular review of admin access (monthly)');
  console.log('- Remove admin access for inactive users');
  console.log('- Use principle of least privilege');
  console.log('- Monitor admin activity logs');
  console.log('- Enable multi-factor authentication for admin accounts');
  console.log('- Rotate admin credentials periodically');
  console.log('');
}

async function showStats(): Promise<void> {
  const stats = await getAdminStats();
  
  console.log('## 📊 Admin Statistics\n');
  console.log(`- **Total Users:** ${stats.totalUsers}`);
  console.log(`- **Total Admins:** ${stats.totalAdmins}`);
  console.log(`- **Enabled Admins:** ${stats.enabledAdmins}`);
  console.log(`- **Disabled Admins:** ${stats.disabledAdmins}`);
  
  if (stats.totalUsers > 0) {
    console.log(`- **Admin Percentage:** ${((stats.totalAdmins / stats.totalUsers) * 100).toFixed(1)}%`);
  }
  
  console.log('');
}

async function main(): Promise<void> {
  try {
    console.log(`# Admin Dashboard - ${action.toUpperCase()}\n`);
    console.log(`**Environment:** ${process.env.FIREBASE_PROJECT_ID || 'Unknown'}`);
    console.log(`**Generated:** ${new Date().toLocaleString()}\n`);
    
    switch (action) {
      case 'list':
        await showStats();
        await listAdmins();
        break;
      case 'stats':
        await showStats();
        break;
      case 'audit':
        await showStats();
        await generateAuditReport();
        break;
      default:
        console.log('❌ Unknown action. Use: list, stats, or audit');
        console.log('\nUsage: npx tsx scripts/admin-dashboard.ts [action]');
        console.log('Actions:');
        console.log('  list  - Show statistics and list all admin users (default)');
        console.log('  stats - Show only statistics');
        console.log('  audit - Show statistics and generate security audit report');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error generating dashboard:', error);
    process.exit(1);
  }
}

// Show usage if help flag is provided
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: npx tsx scripts/admin-dashboard.ts [action]');
  console.log('');
  console.log('Generates comprehensive admin user management dashboard.');
  console.log('');
  console.log('Actions:');
  console.log('  list   - Show statistics and list all admin users (default)');
  console.log('  stats  - Show only statistics summary');
  console.log('  audit  - Show statistics and generate security audit report');
  console.log('');
  console.log('Environment variables required:');
  console.log('  FIREBASE_PROJECT_ID');
  console.log('  FIREBASE_CLIENT_EMAIL');
  console.log('  FIREBASE_PRIVATE_KEY');
  console.log('');
  console.log('Examples:');
  console.log('  npx tsx scripts/admin-dashboard.ts list');
  console.log('  npx tsx scripts/admin-dashboard.ts stats');
  console.log('  npx tsx scripts/admin-dashboard.ts audit');
  process.exit(0);
}

main();