# Local Environment Setup Checklist

Quick reference checklist for setting up Firebase App Hosting local development environment.

## ✅ Prerequisites Checklist

- [ ] **Node.js 18+ or 20+** installed (`node --version`)
- [ ] **Java 8+ or 11+** installed (`java -version`) - Required for Firebase emulators
- [ ] **npm** or **yarn** package manager
- [ ] **Git** for version control
- [ ] **Google Cloud account** with billing enabled
- [ ] **Firebase account** access
- [ ] **GitHub repository** for the project

## ✅ Installation Checklist

### 1. System Requirements
- [ ] Install Java (required for Firebase emulators):
  - **Debian 12/Ubuntu 22.04+**: `sudo apt update && sudo apt install -y openjdk-17-jre-headless`
  - **Ubuntu 20.04/Debian 11**: `sudo apt update && sudo apt install -y openjdk-11-jre-headless`
  - **CentOS/RHEL**: `sudo yum install -y java-11-openjdk`
  - **macOS**: `brew install openjdk@17` or `brew install openjdk@11`
  - **Windows**: Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use [Chocolatey](https://chocolatey.org/): `choco install openjdk17`
- [ ] Verify Java installation: `java -version` (should show version 8+)

### 2. Firebase CLI Setup
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Verify installation: `firebase --version` (should be 13.x.x+)
- [ ] Login to Firebase: `firebase login`
- [ ] Verify access: `firebase projects:list`

### 3. Project Dependencies
- [ ] Clone/navigate to project directory
- [ ] Install dependencies: `npm ci`
- [ ] Verify installation: `npm list firebase-admin next react`

### 4. Firebase Projects Setup
- [ ] Create development project: `firebase projects:create marketplace-ai-dev`
- [ ] Create staging project: `firebase projects:create marketplace-ai-staging`
- [ ] Create production project: `firebase projects:create marketplace-ai-prod`
- [ ] Enable App Hosting for each project (see detailed steps)

## ✅ Configuration Checklist

### 5. Service Account Setup
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Select development project
- [ ] Navigate to Project Settings > Service Accounts
- [ ] Generate new private key
- [ ] Save as `credentials.json` in project root
- [ ] Verify file is in `.gitignore`

### 6. Google OAuth Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Navigate to APIs & Services > Credentials
- [ ] Create OAuth 2.0 Client ID
- [ ] Add authorized origins: `https://localhost:3000`
- [ ] Add redirect URIs: `https://localhost:3000/api/auth/callback/google`
- [ ] Save Client ID and Client Secret

### 7. Environment Variables
- [ ] Copy template: `cp .env.example .env.local`
- [ ] Generate AUTH_SECRET (32+ characters)
- [ ] Set AUTH_URL: `https://localhost:3000`
- [ ] Add Google OAuth credentials
- [ ] Add Firebase project configuration
- [ ] Add service account details or file path

## ✅ Testing Checklist

### 8. Build and Type Checking
- [ ] Build internationalization: `npm run intlayer:build`
- [ ] Type check: `npm run type-check`
- [ ] Lint check: `npm run lint`
- [ ] Run tests: `npm run test`
- [ ] Build application: `npm run build`

### 9. Development Server
- [ ] Start development environment: `npm run dev:local`
- [ ] Verify Next.js app: https://localhost:3000
- [ ] Verify Firebase UI: http://localhost:4000
- [ ] Verify Firestore emulator: http://localhost:8080
- [ ] Test health endpoint: `curl -k https://localhost:3000/api/health`

### 10. Deployment Scripts
- [ ] Make scripts executable: `chmod +x scripts/*.sh`
- [ ] Update repository references in scripts
- [ ] Test environment management: `npm run env:list development`

## ✅ Quick Commands Reference

```bash
# Installation
sudo apt update && sudo apt install -y openjdk-17-jre-headless  # Debian 12/Ubuntu 22.04+
npm install -g firebase-tools
firebase login
npm ci

# Project setup
firebase projects:create marketplace-ai-dev
firebase use marketplace-ai-dev
cp .env.example .env.local

# Testing
npm run type-check
npm run lint
npm run test
npm run build

# Development
npm run dev:local
```

## ✅ Environment Variables Template

Copy this to your `.env.local` and fill in actual values:

```bash
# Application
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=https://localhost:3000

# Auth.js v5
AUTH_SECRET=your-32-character-secret-here
AUTH_URL=https://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=your-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-client-secret

# Firebase
FIREBASE_PROJECT_ID=marketplace-ai-dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@marketplace-ai-dev.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-key-here\n-----END PRIVATE KEY-----"
FIRESTORE_DATABASE_ID=(default)

# Alternative: Service account file
# GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Firebase Emulator Configuration (for development)
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

## ✅ Verification Commands

Run these to verify your setup:

```bash
# System checks
node --version          # 18+ or 20+
java -version          # 8+ or 11+
firebase --version      # 13.x.x+
firebase projects:list  # Shows your projects

# Project checks
npm run type-check      # No TypeScript errors
npm run lint           # No linting errors
npm run test           # All tests pass
npm run build          # Builds successfully

# Development server
npm run dev:local      # Starts all services
curl -k https://localhost:3000/api/health  # Health check
```

## ❌ Common Issues

| Issue | Quick Fix |
|-------|-----------|
| `Could not spawn java -version` | Install Java: `sudo apt install -y openjdk-17-jre-headless` |
| `firebase: command not found` | `npm install -g firebase-tools` |
| `Port 3000 in use` | `lsof -i :3000` then `kill -9 <PID>` |
| `Environment validation failed` | Check all variables in `.env.local` |
| `OAuth redirect mismatch` | Update redirect URIs in Google Cloud Console |
| `Cannot connect to Firestore` | Verify service account setup |
| `TypeScript errors` | `rm -rf .next && npm run intlayer:build` |

## 📚 Next Steps

After completing this checklist:

1. **Read the full documentation**: `docs/firebase-app-hosting-deployment.md`
2. **Set up CI/CD**: Configure GitHub secrets for automated deployment
3. **Configure staging/production**: Update environment files for other environments
4. **Test deployment**: Try `npm run deploy:dev` when ready

## 🆘 Need Help?

- **Detailed troubleshooting**: See `docs/firebase-app-hosting-deployment.md`
- **Firebase docs**: https://firebase.google.com/docs/app-hosting
- **Next.js docs**: https://nextjs.org/docs
- **Auth.js docs**: https://authjs.dev/