/**
 * @fileoverview Enhanced Firestore Adapter for NextAuth
 * 
 * This module provides an enhanced version of the NextAuth FirestoreAdapter
 * that automatically includes role and enabled fields when creating new users.
 */

import { FirestoreAdapter } from "@auth/firebase-adapter";
import { getFirestoreAdminInstance } from './firebase-admin-singleton';
import { serverLogger } from './logger.server';
import type { Adapter, AdapterUser } from 'next-auth/adapters';

/**
 * Enhanced adapter interface that includes the updateLastLogin function
 */
interface EnhancedAdapter extends Adapter {
  updateLastLogin?: (userId: string) => Promise<void>;
}

/**
 * Create an enhanced FirestoreAdapter that includes default role and enabled fields
 * 
 * This adapter wraps the standard FirestoreAdapter and ensures that new users
 * are created with the required role and enabled fields for the User Access Control system.
 * 
 * @returns {EnhancedAdapter} Enhanced NextAuth adapter with updateLastLogin function
 */
export function createEnhancedFirestoreAdapter(): EnhancedAdapter {
  const baseAdapter = FirestoreAdapter(getFirestoreAdminInstance()) as Adapter;
  
  // Store the original createUser function
  const originalCreateUser = baseAdapter.createUser;
  
  if (originalCreateUser) {
    // Override the createUser function to include default fields
    baseAdapter.createUser = async (user) => {
      serverLogger.info('Creating user with enhanced fields', 'auth', {
        userId: user.id,
        email: user.email,
      });
      
      // Add default role and enabled fields
      const enhancedUser = {
        ...user,
        role: 'user' as const,
        enabled: false, // New users require admin approval
        lastLogin: null, // Initialize as null, will be set on first login
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      try {
        const result = await originalCreateUser(enhancedUser);
        
        serverLogger.info('User created successfully with enhanced fields', 'auth', {
          userId: result.id,
          role: 'user',
          enabled: false,
        });
        
        return result;
      } catch (error) {
        serverLogger.error('Failed to create user with enhanced fields', 
          error instanceof Error ? error : new Error(String(error)), 
          'auth', 
          { userId: user.id }
        );
        throw error;
      }
    };
  }
  
  // Store the original getUser function to ensure we return enhanced user data
  const originalGetUser = baseAdapter.getUser;
  
  if (originalGetUser) {
    baseAdapter.getUser = async (id) => {
      const user = await originalGetUser(id);
      
      if (user) {
        // Ensure user has required fields with defaults
        const userWithRole = user as AdapterUser & { role?: string; enabled?: boolean };
        return {
          ...user,
          role: userWithRole.role || 'user',
          enabled: userWithRole.enabled !== undefined ? userWithRole.enabled : false,
        };
      }
      
      return user;
    };
  }
  
  // Store the original getUserByEmail function
  const originalGetUserByEmail = baseAdapter.getUserByEmail;
  
  if (originalGetUserByEmail) {
    baseAdapter.getUserByEmail = async (email) => {
      const user = await originalGetUserByEmail(email);
      
      if (user) {
        // Ensure user has required fields with defaults
        const userWithRole = user as AdapterUser & { role?: string; enabled?: boolean };
        return {
          ...user,
          role: userWithRole.role || 'user',
          enabled: userWithRole.enabled !== undefined ? userWithRole.enabled : false,
        };
      }
      
      return user;
    };
  }
  
  // Add custom updateLastLogin function for session tracking
  const updateLastLogin = async (userId: string): Promise<void> => {
    try {
      const firestore = getFirestoreAdminInstance();
      await firestore.collection('users').doc(userId).update({
        lastLogin: new Date(),
      });
      
      serverLogger.info('Updated user last login timestamp', 'auth', {
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      serverLogger.error('Failed to update last login timestamp', 
        error instanceof Error ? error : new Error(String(error)), 
        'auth', 
        { userId }
      );
      // Don't throw error to avoid blocking authentication
    }
  };

  // Add the updateLastLogin function to the adapter for external use
  const enhancedAdapter = baseAdapter as EnhancedAdapter;
  enhancedAdapter.updateLastLogin = updateLastLogin;
  
  return enhancedAdapter;
}