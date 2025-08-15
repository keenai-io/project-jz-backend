'use server'

import { getFirestoreInstance } from '@/lib/firestore';
import { serverLogger } from '@/lib/logger.server';

/**
 * Server action to test Firebase emulator connectivity
 * This will verify that server-side Firebase operations use emulators in development
 */
export async function testFirestoreEmulator() {
  try {
    serverLogger.info('Testing Firestore emulator connection from server action', 'system');
    
    const firestore = getFirestoreInstance();
    
    // Create a test document
    const testData = {
      message: 'Server-side test from emulator',
      timestamp: new Date().toISOString(),
      serverTest: true,
      randomValue: Math.floor(Math.random() * 1000)
    };
    
    const docRef = firestore.collection('server-test').doc();
    await docRef.set(testData);
    
    serverLogger.info('Server test document created successfully', 'system', { 
      docId: docRef.id,
      collection: 'server-test'
    });
    
    // Try to read it back
    const doc = await docRef.get();
    const data = doc.data();
    
    if (data) {
      serverLogger.info('Server test document read successfully', 'system', { 
        docId: doc.id,
        hasData: !!data
      });
      
      return {
        success: true,
        message: `Server-side Firestore test successful! Document ID: ${doc.id}`,
        data: data,
        emulatorUsed: process.env.NODE_ENV === 'development' && !!process.env.FIRESTORE_EMULATOR_HOST
      };
    } else {
      throw new Error('Document was created but could not be read back');
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    serverLogger.error('Server-side Firestore test failed', 
      error instanceof Error ? error : new Error(errorMessage), 
      'system'
    );
    
    return {
      success: false,
      message: `Server-side test failed: ${errorMessage}`,
      emulatorUsed: process.env.NODE_ENV === 'development' && !!process.env.FIRESTORE_EMULATOR_HOST
    };
  }
}

/**
 * Server action to list all documents in server-test collection
 */
export async function getServerTestDocuments() {
  try {
    const firestore = getFirestoreInstance();
    
    const snapshot = await firestore.collection('server-test').get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    serverLogger.info('Retrieved server test documents', 'system', { 
      count: documents.length 
    });
    
    return {
      success: true,
      documents: documents,
      count: documents.length,
      emulatorUsed: process.env.NODE_ENV === 'development' && !!process.env.FIRESTORE_EMULATOR_HOST
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    serverLogger.error('Failed to retrieve server test documents', 
      error instanceof Error ? error : new Error(errorMessage), 
      'system'
    );
    
    return {
      success: false,
      message: `Failed to get documents: ${errorMessage}`,
      documents: [],
      count: 0,
      emulatorUsed: process.env.NODE_ENV === 'development' && !!process.env.FIRESTORE_EMULATOR_HOST
    };
  }
}