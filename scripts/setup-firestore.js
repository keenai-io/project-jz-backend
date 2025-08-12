#!/usr/bin/env node

/**
 * @fileoverview Setup script for Firestore database collections required by Auth.js
 * @description Creates the necessary collections for Auth.js authentication
 */

// Load environment variables from .env files
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { initializeApp, getApps, cert, applicationDefault } = require('firebase-admin/app');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getFirestore } = require('firebase-admin/firestore');

async function setupFirestore() {
  try {
    // Initialize Firebase Admin if not already initialized
    let app;
    if (getApps().length === 0) {
      const hasFirebaseEnvVars = process.env.FIREBASE_PROJECT_ID && 
                                 process.env.FIREBASE_CLIENT_EMAIL && 
                                 process.env.FIREBASE_PRIVATE_KEY;

      if (hasFirebaseEnvVars) {
        // Use individual environment variables
        app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
        console.log('✅ Firebase initialized with environment variables');
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Use service account credentials file
        app = initializeApp({
          credential: applicationDefault(),
        });
        console.log('✅ Firebase initialized with credentials file');
      } else {
        throw new Error('Firebase credentials not properly configured. Please provide either individual environment variables or GOOGLE_APPLICATION_CREDENTIALS path.');
      }
    } else {
      app = getApps()[0];
    }

    const db = getFirestore(app, process.env.FIRESTORE_DATABASE_ID || '(default)');
    
    console.log('🔥 Setting up Firestore collections for Auth.js...');
    
    // Auth.js uses these collections:
    // - users: Store user information
    // - accounts: Store linked accounts (OAuth providers)
    // - sessions: Store user sessions
    // - verification_tokens: Store email verification tokens
    
    const collections = ['users', 'accounts', 'sessions', 'verification_tokens'];
    
    for (const collectionName of collections) {
      // Create a dummy document to ensure the collection exists
      const docRef = db.collection(collectionName).doc('_setup_');
      
      try {
        await docRef.set({
          _setup: true,
          createdAt: new Date(),
        });
        console.log(`✅ Collection '${collectionName}' created/verified`);
        
        // Delete the setup document
        await docRef.delete();
      } catch (error) {
        console.error(`❌ Error setting up collection '${collectionName}':`, error.message);
      }
    }
    
    console.log('🎉 Firestore setup completed successfully!');
    console.log('📝 Your Auth.js adapter should now be able to connect to Firestore.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupFirestore();