# Marketplace AI

A Next.js 15 application with React 19, TypeScript, and Firebase/Firestore integration for AI-powered marketplace optimization.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled
- Google Cloud credentials (for Firebase Admin)

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd marketplace-ai
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
```

Configure your environment variables (see [Environment Variables](#environment-variables) section).

3. **Set up Firebase/Firestore**:
```bash
# Setup Firestore collections for Auth.js
npm run setup:firestore

# Verify your configuration
npm run type-check
```

4. **Build Intlayer dictionaries**:
```bash
npm run intlayer:build
```

5. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Core Technologies

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + Headless UI
- **Authentication**: Auth.js v5 (NextAuth.js) + Firebase Auth
- **Database**: Firestore
- **State Management**: TanStack Query
- **Forms**: TanStack Form + Zod validation
- **Internationalization**: Intlayer
- **Testing**: Vitest + React Testing Library

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

### Firebase Configuration

**Method 1: Individual environment variables (recommended for production)**
```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIRESTORE_DATABASE_ID=(default)  # Optional: specify database ID
```

**Method 2: Service account file (good for development)**
```bash
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
FIRESTORE_DATABASE_ID=your-database-id  # Optional
```

### Auth.js Configuration
```bash
AUTH_SECRET=your-32-character-secret-key
AUTH_URL=http://localhost:3000  # or your production URL
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
```

### Application Configuration
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔐 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Choose security rules (start in test mode for development)
   - Select a location (cannot be changed later)

### 2. Set up Authentication

1. Go to Authentication > Settings
2. Enable Google as a sign-in provider
3. Configure OAuth consent screen
4. Add your domain to authorized domains

### 3. Service Account Setup

**For Production:**
1. Go to Project Settings > Service Accounts
2. Generate a new private key
3. Use individual environment variables (secure)

**For Development:**
1. Download the service account JSON file
2. Save as `credentials.json` in project root
3. Add to `.gitignore` (never commit to repository)

### 4. Firestore Security Rules

The project includes security rules in `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User configurations - only accessible by the owner
    match /configurations/{userId} {
      allow read, write: if request.auth != null 
                      && request.auth.token.email == userId;
    }
    
    // NextAuth.js collections
    match /users/{document} {
      allow read, write: if request.auth != null && request.auth.uid == document;
    }
    // ... other rules
  }
}
```

Deploy rules using Firebase CLI:

**Step 1: Login to Firebase (one-time setup)**
```bash
firebase login
```

**Step 2: Initialize your project (if not done already)**
```bash
firebase use --add
# Select your Firebase project from the list
```

**Step 3: Deploy the rules**
```bash
# Option 1: Use npm script (recommended) - automatically uses database ID from .env.local
npm run deploy:firestore-rules

# Option 2: Use the deployment script - reads database ID from environment
./scripts/deploy-firestore-rules.sh

# Option 3: Generate config and deploy manually
npm run config:firebase
firebase deploy --only firestore:rules
```

**Database Configuration:**
The deployment automatically uses the `FIRESTORE_DATABASE_ID` from your `.env.local` file:
- If not specified, uses `(default)` database  
- If specified, deploys to the named database (e.g., `my-custom-db`)
- Uses dotenv to parse environment variables (handles comments properly)
- The firebase.json is dynamically generated to target the correct database

**Example `.env.local`:**
```bash
FIRESTORE_DATABASE_ID=my-custom-db  # Your database ID
# OR
FIRESTORE_DATABASE_ID=(default)    # Use default database
```

## 🛠️ Development Commands

### Core Scripts
```bash
# Development server with debugging
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm test
npm run test:watch
npm run test:coverage
npm run test:ui

# Formatting
npm run format
npm run format:check

# Build Intlayer dictionaries
npm run intlayer:build

# Setup Firestore
npm run setup:firestore

# Generate firebase.json with database configuration
npm run config:firebase

# Deploy Firestore rules (auto-generates config)
npm run deploy:firestore-rules

# Deploy all Firestore config (rules + indexes)
npm run deploy:firestore

# Comprehensive validation
npm run validate
```

### Development Workflow
```bash
# 1. Build dictionaries first
npm run intlayer:build

# 2. Run development server
npm run dev

# 3. Before committing, run validation
npm run validate
```

## 🌐 Internationalization (Intlayer)

### Building Dictionaries

**⚠️ Important**: Always use the npm script, not `npx intlayer build`:

```bash
# ✅ CORRECT
npm run intlayer:build

# ❌ AVOID - may fail due to binary symlink issues
npx intlayer build
```

### Content File Structure

Create `.content.ts` files co-located with components:

```typescript
// Component.content.ts
import {type Dictionary, t} from "intlayer";

const content = {
  key: "unique-component-key", // Must be unique across app
  content: {
    SectionName: {
      messageKey: t({
        en: "English translation",
        ko: "Korean translation",
      }),
    },
  },
} satisfies Dictionary;

export default content;
```

### Using Translations

```typescript
'use client'
import {useIntlayer} from "next-intlayer";

export function MyComponent() {
  const content = useIntlayer("unique-component-key");
  
  return <div>{content.SectionName.messageKey}</div>;
}
```

## 🔧 Troubleshooting

### Firebase Authentication Errors

**Error: `5 NOT_FOUND` - Firestore database not found**

1. **Verify Firestore is enabled**:
   - Firebase Console > Project Settings
   - Ensure Firestore Database exists (not just Realtime Database)

2. **Check database ID**:
   ```bash
   # In .env.local
   FIRESTORE_DATABASE_ID=(default)
   ```

3. **Test connection**:
   ```bash
   node -r dotenv/config -e "console.log('Project:', process.env.FIREBASE_PROJECT_ID); console.log('Database:', process.env.FIRESTORE_DATABASE_ID || '(default)');" dotenv_config_path=.env.local
   ```

4. **Run setup script**:
   ```bash
   npm run setup:firestore
   ```

**Error: `AdapterError` - Connection failures**

1. Check network connectivity to Firebase
2. Verify private key format (newlines properly escaped)
3. Ensure project ID matches exactly
4. Check Firebase quota limits

### Firestore Rules Deployment Issues

**Error: Permission denied**
- Ensure you're logged in: `firebase login`
- Check project permissions in Firebase Console > IAM & Admin
- Verify you have "Firebase Rules System Admin" role

**Error: Project not found**
- Run `firebase projects:list` to see available projects
- Use `firebase use PROJECT_ID` to set the correct project
- Verify the project ID matches your Firebase console

**Error: Rules syntax error**
- Validate rules syntax in Firebase Console > Firestore > Rules tab
- Check for missing semicolons or quotes in firestore.rules
- Test rules in the Firebase Console simulator

### Intlayer Build Issues

**Binary not found error**:
- Use `npm run intlayer:build` instead of `npx intlayer build`

**Dictionary conflicts**:
- Ensure all `key` values are unique across content files

**Missing translations**:
- Verify all content files include all configured locales

**Debug commands**:
```bash
# Check configuration
cat intlayer.config.ts

# Find content files
find . -name "*.content.ts" -type f

# Manual build with verbose output
node node_modules/intlayer-cli/dist/cjs/index.cjs build --verbose
```

### Build/Development Issues

**Module resolution errors**:
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Type errors**:
- Run type checking: `npm run type-check`
- Check for missing imports or incorrect types

**Environment variable issues**:
- Verify all required variables are set
- Check variable names (case-sensitive)
- Restart development server after changes

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── [locale]/          # Locale-specific routes
│   ├── actions/           # Server Actions
│   ├── api/               # API routes
│   └── components/        # Shared components
├── features/              # Feature modules (Vertical Slice Architecture)
│   └── [FeatureName]/
│       ├── domain/        # Business logic & schemas
│       ├── hooks/         # React hooks
│       ├── presentation/  # Components & UI
│       └── __tests__/     # Co-located tests
├── lib/                   # Core utilities
├── public/                # Static assets
├── scripts/               # Build/setup scripts
├── firestore.rules        # Firestore security rules
└── intlayer.config.ts     # Internationalization config
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI interface
npm run test:ui
```

### Test Requirements
- Minimum 80% code coverage
- Co-locate tests in `__tests__` folders
- Use React Testing Library for components
- Mock external dependencies appropriately

## 🚀 Deployment

### Build for Production
```bash
# Build Intlayer dictionaries
npm run intlayer:build

# Create production build
npm run build

# Test production build locally
npm start
```

### Environment Setup
1. Set all required environment variables
2. Use individual Firebase environment variables (not service account file)
3. Deploy Firestore security rules
4. Verify authentication configuration

### Deployment Checklist
- [ ] All environment variables configured
- [ ] Firestore security rules deployed
- [ ] Firebase project has proper IAM permissions
- [ ] Build passes without errors
- [ ] Tests pass with required coverage

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features
- [Firebase Documentation](https://firebase.google.com/docs) - Firebase setup and configuration
- [Auth.js Documentation](https://authjs.dev) - Authentication implementation
- [TanStack Query](https://tanstack.com/query) - Data fetching and caching
- [Intlayer Documentation](https://intlayer.org/docs) - Internationalization

## 🤝 Contributing

1. Follow the development workflow
2. Run validation before committing: `npm run validate`
3. Ensure all tests pass
4. Update documentation as needed

---

For AI development guidelines and detailed implementation patterns, see [CLAUDE.md](./CLAUDE.md).