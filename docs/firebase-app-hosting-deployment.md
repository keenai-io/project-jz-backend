# Firebase App Hosting Deployment Guide

This document provides comprehensive instructions for deploying the Next.js 15 marketplace-ai application to Firebase App Hosting.

## Overview

Firebase App Hosting is a modern hosting platform designed for full-stack web applications. It provides:

- **Server-side rendering** support for Next.js
- **Automatic scaling** based on traffic
- **Built-in CI/CD** with GitHub integration
- **Environment management** with secrets
- **Global CDN** for static assets

## Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** with App Hosting enabled
3. **Google Cloud account** with billing enabled
4. **GitHub repository** connected to Firebase

## 🚀 Local Environment Setup

Follow these steps to set up your local development environment for Firebase App Hosting deployment.

### Step 1: Install Required Tools

```bash
# Install Java (required for Firebase emulators)
# Debian 12/Ubuntu 22.04+:
sudo apt update && sudo apt install -y openjdk-17-jre-headless

# Ubuntu 20.04/Debian 11:
# sudo apt update && sudo apt install -y openjdk-11-jre-headless

# CentOS/RHEL:
# sudo yum install -y java-11-openjdk

# macOS:
# brew install openjdk@17

# Windows:
# Download from Oracle or use Chocolatey: choco install openjdk17

# Verify Java installation
java -version
# Expected output: openjdk version "17.x.x" or "11.x.x" or higher

# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
# Expected output: 13.x.x or higher

# Install project dependencies
npm ci
```

### Step 2: Firebase Authentication

```bash
# Login to Firebase (opens browser for authentication)
firebase login

# Verify you're logged in and can access projects
firebase projects:list

# If you see your projects listed, authentication is successful
```

### Step 3: Create Firebase Projects

Create separate Firebase projects for each environment:

```bash
# Create development project
firebase projects:create marketplace-ai-dev

# Create staging project  
firebase projects:create marketplace-ai-staging

# Create production project
firebase projects:create marketplace-ai-prod

# Enable App Hosting for each project
firebase use marketplace-ai-dev
firebase apphosting:backends:create marketplace-ai-dev-backend \
  --repo=github:YOUR_USERNAME/marketplace-ai \
  --branch=develop

firebase use marketplace-ai-staging
firebase apphosting:backends:create marketplace-ai-staging-backend \
  --repo=github:YOUR_USERNAME/marketplace-ai \
  --branch=staging

firebase use marketplace-ai-prod
firebase apphosting:backends:create marketplace-ai-backend \
  --repo=github:YOUR_USERNAME/marketplace-ai \
  --branch=main
```

> **Note**: Replace `YOUR_USERNAME/marketplace-ai` with your actual GitHub repository path.

### Step 4: Generate Firebase Service Account

#### Option A: Service Account File (Recommended for Local Development)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **development** project (`marketplace-ai-dev`)
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded file as `credentials.json` in your project root
6. The file is already in `.gitignore` for security

#### Option B: Environment Variables (Recommended for Production)

1. From the same Service Accounts page, copy the service account details
2. You'll need: Project ID, Client Email, and Private Key

### Step 5: Configure Local Environment Variables

```bash
# Copy the environment template
cp .env.example .env.local

# Edit the file with your actual values
nano .env.local  # or use your preferred editor
```

Required variables in `.env.local`:

```bash
# Application Environment
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=https://localhost:3000

# Auth.js v5 Configuration (generate a secure 32+ character secret)
AUTH_SECRET=your-very-long-secure-secret-here-minimum-32-characters
AUTH_URL=https://localhost:3000

# Google OAuth Configuration
# Get these from Google Cloud Console > APIs & Services > Credentials
AUTH_GOOGLE_ID=your-google-oauth-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=marketplace-ai-dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@marketplace-ai-dev.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"

# Firestore Database (usually "(default)" for new projects)
FIRESTORE_DATABASE_ID=(default)

# Alternative: Use service account file instead of individual env vars
# GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

### Step 6: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configure:
   - Application type: Web application
   - Authorized JavaScript origins: `https://localhost:3000`
   - Authorized redirect URIs: `https://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

### Step 7: Update Deployment Scripts

Make deployment scripts executable and update repository references:

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Edit deployment script to use your repository
sed -i 's/YOUR_USERNAME/your-actual-username/g' scripts/deploy-apphosting.sh
```

### Step 8: Test Local Setup

```bash
# Install dependencies
npm ci

# Build internationalization files
npm run intlayer:build

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test

# Test build process
npm run build
```

### Step 9: Start Local Development Environment

```bash
# Start Firebase emulators and Next.js dev server
npm run dev:local
```

This command will:
- Start Firebase emulators (Firestore, Auth, Hosting)
- Start Next.js development server with HTTPS
- Display URLs for all services

Expected output:
```
🔥 Firebase emulator UI: http://localhost:4000
🗄️  Firestore emulator: http://localhost:8080
🔐 Auth emulator: http://localhost:9099
⚡ Next.js app: https://localhost:3000
```

### Step 10: Verify Setup

Test each component:

```bash
# Test environment variable management
npm run env:list development

# Test health endpoint
curl https://localhost:3000/api/health

# Test Firebase connection
npm run config:firebase
```

## Environment-Specific Configuration

### Development Environment

```bash
# Set Firebase project
firebase use marketplace-ai-dev

# Test deployment (dry run)
npm run deploy:dev --dry-run
```

### Staging Environment

Update `.env.staging` with staging-specific values:

```bash
# Copy production template
cp .env.production .env.staging

# Edit with staging values
nano .env.staging

# Deploy environment variables
npm run env:set:staging
```

### Production Environment

Update `.env.production` with production values:

```bash
# Edit production environment file
nano .env.production

# Deploy environment variables (only after testing)
npm run env:set:production
```

## Project Structure

### Configuration Files

- `apphosting.yaml` - Firebase App Hosting configuration
- `firebase.json` - Firebase services configuration
- `.env.example` - Environment variable template
- `.env.production` - Production environment variables
- `.env.staging` - Staging environment variables

### Scripts

- `scripts/deploy-apphosting.sh` - Main deployment script
- `scripts/dev-deploy.sh` - Local development environment
- `scripts/manage-env-vars.sh` - Environment variable management

### GitHub Actions

- `.github/workflows/ci.yml` - Continuous integration
- `.github/workflows/deploy-staging.yml` - Staging deployment
- `.github/workflows/deploy-production.yml` - Production deployment

## Environment Setup

### 1. Local Development

Copy the environment template:
```bash
cp .env.example .env.local
```

Update `.env.local` with your local values:
```bash
# Auth.js v5 Configuration
AUTH_SECRET=your-local-auth-secret-minimum-32-characters
AUTH_URL=https://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret

# Firebase Admin
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 2. Production Environment

Update `.env.production` with production values and deploy:
```bash
npm run env:set:production
```

### 3. Staging Environment

Update `.env.staging` and deploy:
```bash
npm run env:set:staging
```

## Deployment Commands

### Manual Deployment

```bash
# Deploy to development
npm run deploy:dev

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Local Development

Start local development environment with Firebase emulators:
```bash
npm run dev:local
```

This starts:
- Next.js dev server at `https://localhost:3000`
- Firebase emulators at `http://localhost:4000`
- Firestore emulator at `http://localhost:8080`

### Environment Management

```bash
# List environment variables
npm run env:list

# Set variables for specific environment
npm run env:set:staging
npm run env:set:production

# Manual management
./scripts/manage-env-vars.sh set production .env.production
./scripts/manage-env-vars.sh get production AUTH_SECRET
./scripts/manage-env-vars.sh delete production OLD_VAR
```

## GitHub Actions Setup

### Required Secrets

Configure these secrets in your GitHub repository:

#### Production Environment
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON
- `AUTH_SECRET` - Auth.js secret key
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `FIRESTORE_DATABASE_ID` - Firestore database ID

#### Staging Environment
Same secrets with `_STAGING` suffix:
- `FIREBASE_SERVICE_ACCOUNT_STAGING`
- `AUTH_SECRET_STAGING`
- etc.

### Workflow Triggers

#### CI Pipeline (`ci.yml`)
- Runs on push to `main` or `develop`
- Runs on pull requests
- Tests, lints, and builds the application

#### Staging Deployment (`deploy-staging.yml`)
- Triggers on push to `develop` or `staging` branches
- Triggers on pull requests to `main`
- Deploys to staging environment
- Comments deployment URL on PR

#### Production Deployment (`deploy-production.yml`)
- Triggers on push to `main` branch
- Deploys to production environment
- Runs smoke tests after deployment

## Firebase Project Configuration

### 1. Create Firebase Projects

Create separate projects for each environment:
```bash
# Development
firebase projects:create marketplace-ai-dev

# Staging  
firebase projects:create marketplace-ai-staging

# Production
firebase projects:create marketplace-ai-prod
```

### 2. Enable App Hosting

For each project:
```bash
firebase use marketplace-ai-prod
firebase apphosting:backends:create marketplace-ai-backend \
  --repo=github:YOUR_USERNAME/marketplace-ai \
  --branch=main
```

### 3. Configure Environment Variables

Use the management script or Firebase Console:
```bash
./scripts/manage-env-vars.sh set production .env.production
```

## Health Monitoring

The application includes a health check endpoint at `/api/health` that:

- Returns application status and metadata
- Checks service availability
- Provides uptime information
- Used by Firebase App Hosting for health monitoring

## 🔧 Troubleshooting Local Environment Setup

### Common Setup Issues

#### 1. Firebase CLI Issues

**Problem**: `firebase: command not found`
```bash
# Solution: Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

**Problem**: Permission denied when installing Firebase CLI
```bash
# Solution: Use sudo (Linux/Mac) or run as administrator (Windows)
sudo npm install -g firebase-tools

# Or use npx to run without installing globally
npx firebase-tools --version
```

**Problem**: Firebase login fails or hangs
```bash
# Solution: Clear Firebase cache and retry
firebase logout
rm -rf ~/.config/firebase
firebase login --reauth
```

#### 2. Environment Variable Issues

**Problem**: `Invalid environment configuration` errors
```bash
# Check your .env.local file exists and has all required variables
ls -la .env.local

# Validate environment variables
npm run type-check

# Common issues:
# - Missing AUTH_SECRET (must be 32+ characters)
# - Incorrect FIREBASE_PRIVATE_KEY formatting (needs \n for newlines)
# - Wrong project IDs
```

**Problem**: Firebase private key formatting errors
```bash
# Correct format in .env.local:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-key-content-here\n-----END PRIVATE KEY-----"

# Or use service account file instead:
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

#### 3. Port Conflicts

**Problem**: `Port 3000 is already in use`
```bash
# Find process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Problem**: Firebase emulator ports in use
```bash
# Check for conflicting services
lsof -i :4000  # Firebase UI
lsof -i :8080  # Firestore
lsof -i :9099  # Auth

# Stop Firebase emulators
firebase emulators:stop
```

#### 4. SSL Certificate Issues

**Problem**: HTTPS certificate errors in development
```bash
# Regenerate certificates
rm certificates/localhost*
npm run dev

# Or disable HTTPS temporarily
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

#### 5. Node.js Version Issues

**Problem**: Compatibility errors with Node.js version
```bash
# Check Node.js version (requires 18+ or 20+)
node --version

# Install correct version using nvm
nvm install 20
nvm use 20

# Or update package.json engines field
"engines": {
  "node": ">=20.0.0"
}
```

#### 6. Google OAuth Setup Issues

**Problem**: OAuth redirect URI mismatch
```
Error: redirect_uri_mismatch
```

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add these authorized redirect URIs:
   - `https://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for fallback)

#### 7. Firestore Connection Issues

**Problem**: Cannot connect to Firestore
```bash
# Check if service account is properly configured
npm run config:firebase

# Test Firestore connection
node -e "
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp();
console.log('Firestore connected successfully');
"
```

#### 8. Build and Type Errors

**Problem**: TypeScript compilation errors
```bash
# Clean build cache
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm run intlayer:build
npm run type-check
```

**Problem**: Intlayer build errors
```bash
# Clean intlayer cache
rm -rf .intlayer

# Rebuild internationalization
npm run intlayer:build
```

### Step-by-Step Verification Checklist

Use this checklist to verify your setup:

```bash
# ✅ 1. Check Node.js version
node --version  # Should be 18+ or 20+

# ✅ 2. Check Firebase CLI
firebase --version  # Should be 13.x.x+

# ✅ 3. Check Firebase authentication
firebase projects:list  # Should show your projects

# ✅ 4. Check environment file
cat .env.local | grep -E "(AUTH_SECRET|FIREBASE_PROJECT_ID|AUTH_GOOGLE_ID)"

# ✅ 5. Check dependencies
npm list --depth=0 | grep -E "(next|react|firebase)"

# ✅ 6. Test type checking
npm run type-check

# ✅ 7. Test linting
npm run lint

# ✅ 8. Test building
npm run build

# ✅ 9. Test health endpoint (after starting dev server)
curl -k https://localhost:3000/api/health
```

### Debug Commands for Local Environment

```bash
# Check all environment variables loaded
node -e "console.log(process.env)" | grep -E "(AUTH_|FIREBASE_|NODE_ENV)"

# Test Firebase configuration
npm run config:firebase

# Check Firebase project settings
firebase use --list

# Verify App Hosting backends
firebase apphosting:backends:list

# Check emulator status
firebase emulators:list

# Test Next.js configuration
npx next info

# Check installed package versions
npm list firebase-admin next react

# Verify certificate files exist
ls -la certificates/
```

### Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at console output for specific error messages
2. **Verify prerequisites**: Ensure all required tools and accounts are set up
3. **Test minimal setup**: Try with a fresh `.env.local` file
4. **Check network**: Ensure no corporate firewalls block Firebase APIs
5. **Review documentation**: Check [Firebase App Hosting docs](https://firebase.google.com/docs/app-hosting)

### Common Error Messages and Solutions

| Error | Solution |
|-------|----------|
| `FIREBASE_PRIVATE_KEY must be a valid private key string` | Check private key formatting with proper `\n` newlines |
| `Cannot find module 'firebase-admin'` | Run `npm ci` to install dependencies |
| `Port 3000 is already in use` | Kill existing process or use different port |
| `redirect_uri_mismatch` | Update Google OAuth redirect URIs in Cloud Console |
| `Project not found or insufficient permissions` | Check Firebase project ID and service account permissions |
| `EACCES: permission denied` | Use `sudo` for global npm installs or check file permissions |

## Troubleshooting Deployment Issues

### Debug Commands

```bash
# Check Firebase authentication
firebase auth:list

# List Firebase projects
firebase projects:list

# Check App Hosting backends
firebase apphosting:backends:list

# View deployment logs
firebase apphosting:backends:get marketplace-ai-backend --logs
```

### Logs and Monitoring

- **Application logs**: Available in Firebase Console
- **Build logs**: Available in GitHub Actions
- **Health monitoring**: `/api/health` endpoint
- **Error tracking**: Configured via Winston logger

## Security Considerations

1. **Environment Variables**
   - Use Firebase secrets for sensitive data
   - Never commit `.env.local` or production files
   - Rotate secrets regularly

2. **Authentication**
   - Use service accounts with minimal permissions
   - Enable MFA on Firebase and Google Cloud accounts
   - Regularly review access permissions

3. **Network Security**
   - Firebase App Hosting provides HTTPS by default
   - Configure CORS appropriately
   - Use Firebase Security Rules for Firestore

## Performance Optimization

1. **Build Optimization**
   - Next.js 15 with Turbopack for faster builds
   - Tree shaking and code splitting enabled
   - Image optimization with next/image

2. **Runtime Performance**
   - Server-side rendering for better SEO
   - Automatic caching via Firebase CDN
   - Optimized bundle sizes

3. **Scaling Configuration**
   - Auto-scaling based on traffic (configured in `apphosting.yaml`)
   - Memory and CPU allocation optimization
   - Concurrency settings for optimal performance

## Support and Resources

- [Firebase App Hosting Documentation](https://firebase.google.com/docs/app-hosting)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Auth.js v5 Documentation](https://authjs.dev/)

For project-specific issues, check the GitHub repository issues or create a new issue with detailed information about the problem.