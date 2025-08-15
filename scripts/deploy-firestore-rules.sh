#!/bin/bash

# Deploy Firestore Rules Script
# This script helps deploy Firestore security rules to your Firebase project
# It reads the database ID from .env.local to deploy to the correct Firestore database

echo "🔥 Firebase Firestore Rules Deployment"
echo "======================================"

# Get database ID from environment or use default
DATABASE_ID="${FIRESTORE_DATABASE_ID:-(default)}"
echo "🗄️  Target database: $DATABASE_ID"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "Please ensure firebase-tools is installed from package.json dependencies."
    echo "Run: npm install"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔑 You need to login to Firebase first."
    echo "Run: firebase login"
    exit 1
fi

# Check if firestore.rules exists
if [ ! -f "firestore.rules" ]; then
    echo "❌ firestore.rules not found."
    exit 1
fi

# Generate firebase.json with correct database configuration
echo "⚙️  Generating firebase.json with database configuration..."
if node scripts/generate-firebase-config.js; then
    echo "✅ Firebase configuration generated"
else
    echo "❌ Failed to generate Firebase configuration"
    exit 1
fi

echo "📋 Available Firebase projects:"
firebase projects:list

echo ""
echo "🚀 Deploying Firestore rules..."
echo "📄 Rules file: firestore.rules"
echo "🗄️  Target database: $DATABASE_ID"
echo ""

# Deploy Firestore rules to specific database
if [ "$DATABASE_ID" != "(default)" ]; then
    echo "📋 Deploying rules to named database: $DATABASE_ID"
    echo "⚡ Running: firebase deploy --only firestore:rules:$DATABASE_ID"
    firebase deploy --only firestore:rules:$DATABASE_ID
else
    echo "📋 Deploying rules to default database: $DATABASE_ID"
    echo "⚡ Running: firebase deploy --only firestore:rules"
    firebase deploy --only firestore:rules
fi

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully to database: $DATABASE_ID!"
    echo ""
    echo "📝 Your security rules are now active:"
    echo "   - Users can only access their own configuration documents"
    echo "   - NextAuth.js collections have appropriate permissions"
    echo "   - All other access is denied"
    echo ""
    echo "🌐 You can verify the rules in Firebase Console:"
    echo "   Firestore Database > Rules tab > Select database: $DATABASE_ID"
else
    echo "❌ Failed to deploy Firestore rules to database: $DATABASE_ID"
    echo "Check your Firebase project configuration and try again."
fi