# Firebase App Hosting Deployment Guide

This document provides comprehensive instructions for deploying the Next.js 15 marketplace-ai application to Firebase App Hosting based on the [official Firebase App Hosting documentation](https://firebase.google.com/docs/app-hosting/get-started).

## Overview

Firebase App Hosting is a modern hosting platform designed for full-stack web applications. It provides:

- **Server-side rendering** support for Next.js
- **Automatic scaling** based on traffic
- **Built-in CI/CD** with GitHub integration (automatic deployments)
- **Environment management** with secrets
- **Global CDN** for static assets

## Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** with App Hosting enabled
3. **Google Cloud account** with billing enabled
4. **GitHub repository** with your application code

## 🚀 Setting Up Firebase App Hosting

### Step 1: Create Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or use an existing project
3. Enable billing (required for App Hosting)

### Step 2: Connect Your Repository

**Important**: Firebase App Hosting uses automatic deployments from your GitHub repository. You don't deploy manually via CLI commands.

1. In Firebase Console, go to **App Hosting** 
2. Click **Get started**
3. **Connect your repository**:
   - Choose GitHub as your provider
   - Authorize Firebase to access your GitHub account
   - Select your repository (e.g., `keenai-io/marketplace-ai`)
   - Choose the branch for automatic deployments (e.g., `main` for production)

4. **Configure your app**:
   - Framework: Next.js
   - Build command: `npm run build` (or your custom build command)
   - Output directory: `.next` (Next.js default)

### Step 3: Configure Build Settings

Firebase App Hosting will automatically detect your `apphosting.yaml` file for configuration. Ensure your file includes:

```yaml
# apphosting.yaml
runtime: nodejs20

build:
  commands:
    - npm ci
    - npm run intlayer:build
    - npm run build
  
  env:
    NODE_ENV: production
    NEXT_TELEMETRY_DISABLED: 1

# Runtime environment variables (references to secrets)
env:
  - variable: NODE_ENV
    value: production
  - variable: AUTH_SECRET
    secret: AUTH_SECRET
  - variable: AUTH_GOOGLE_ID
    secret: AUTH_GOOGLE_ID
  # ... other environment variables
```

### Step 4: Set Up Environment Variables/Secrets

Use the Firebase CLI to set up secrets that your application needs:

```bash
# Set secrets for your application
npm run env:set:production

# Or manually set individual secrets
echo "your-auth-secret" | firebase apphosting:secrets:set AUTH_SECRET --project=your-project-id --force
echo "your-google-client-id" | firebase apphosting:secrets:set AUTH_GOOGLE_ID --project=your-project-id --force
```

## Automatic Deployments

### How It Works

Firebase App Hosting automatically deploys your application when:
- You push commits to your connected branch (e.g., `main`)
- You create pull requests (for preview deployments)

### No Manual Deployment Required

Unlike traditional hosting, you **DO NOT** need to:
- Run `firebase deploy` commands
- Use custom deployment scripts
- Set up GitHub Actions for deployment
- Manually create or manage backends

### Monitoring Deployments

1. **Firebase Console**: View deployment status in the App Hosting section
2. **GitHub**: See deployment status in your commit/PR status checks
3. **Logs**: View build and runtime logs in Firebase Console

## Branch Management

### Production Branch
- Connect your `main` branch to your production Firebase project
- All pushes to `main` automatically deploy to production

### Preview Deployments
- Pull requests automatically create preview deployments
- Each PR gets a unique preview URL
- Preview deployments are automatically cleaned up when PR is closed

### Multiple Environments

For staging/development environments:
1. Create separate Firebase projects
2. Connect different branches to different projects:
   - `main` branch → Production project
   - `develop` branch → Staging project
   - Feature branches → Preview deployments

## Local Development Setup

### Step 1: Install Dependencies

```bash
# Install dependencies
npm ci

# Install Firebase CLI globally
npm install -g firebase-tools
```

### Step 2: Authentication

```bash
# Login to Firebase
firebase login

# Select your project
firebase use --add
```

### Step 3: Environment Variables

Create local environment file:
```bash
cp .env.example .env.local
```

Update `.env.local` with your local development values:
```bash
# Auth.js v5 Configuration
AUTH_SECRET=your-local-auth-secret-minimum-32-characters
AUTH_URL=https://localhost:3000

# Google OAuth (get from Google Cloud Console)
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret

# Firebase Admin
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Step 4: Local Development

```bash
# Start local development with Firebase emulators
npm run dev:local
```

This starts:
- Next.js dev server at `https://localhost:3000`
- Firebase emulators at `http://localhost:4000`
- Firestore emulator at `http://localhost:8080`

## Environment Management

### Setting Production Secrets

```bash
# Set all environment variables from .env.production
npm run env:set:production

# Set individual secrets
echo "production-secret" | firebase apphosting:secrets:set AUTH_SECRET --project=your-project-id --force
```

### Listing Secrets

```bash
# List all secrets (using gcloud if available)
npm run env:list

# Get specific secret metadata
firebase apphosting:secrets:describe AUTH_SECRET --project=your-project-id
```

### Managing Secrets

```bash
# Access secret value (for debugging)
firebase apphosting:secrets:access AUTH_SECRET --project=your-project-id

# Delete a secret (be careful!)
firebase apphosting:secrets:destroy OLD_SECRET --project=your-project-id
```

## Project Structure

### Configuration Files

- `apphosting.yaml` - Firebase App Hosting configuration
- `firebase.json` - Firebase services configuration (Firestore, Auth, etc.)
- `.env.example` - Environment variable template
- `.env.production` - Production environment variables
- `.env.local` - Local development environment variables

### Important Scripts

- `npm run env:set:production` - Deploy production environment variables
- `npm run dev:local` - Local development with emulators
- `npm run build:apphosting` - Build command used by Firebase
- `npm run type-check` - TypeScript validation

## Testing Your Setup

### Health Check

Your application includes a health endpoint at `/api/health`:

```bash
# Test locally
curl https://localhost:3000/api/health

# Test production
curl https://your-app-url.web.app/api/health
```

### Build Verification

```bash
# Test the build process locally
npm run type-check
npm run lint
npm run build
```

## Monitoring and Debugging

### Viewing Logs

1. **Firebase Console**: App Hosting → Your backend → Logs
2. **Real-time logs**: Available during deployment and runtime
3. **Error tracking**: Integrated with Google Cloud Error Reporting

### Debug Commands

```bash
# Check Firebase project status
firebase projects:list

# List App Hosting backends
firebase apphosting:backends:list

# Get backend details and logs
firebase apphosting:backends:get your-backend-id
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Firebase Console
   - Ensure all dependencies are in `package.json`
   - Verify build commands in `apphosting.yaml`

2. **Environment Variable Issues**
   - Verify secrets are set: `firebase apphosting:secrets:describe SECRET_NAME`
   - Check secret references in `apphosting.yaml`
   - Ensure proper secret naming

3. **Runtime Errors**
   - Check runtime logs in Firebase Console
   - Verify health endpoint: `/api/health`
   - Test locally with same environment

### Getting Help

- [Firebase App Hosting Documentation](https://firebase.google.com/docs/app-hosting)
- [Firebase Console](https://console.firebase.google.com)
- [GitHub Repository Issues](https://github.com/your-username/marketplace-ai/issues)

## Key Differences from Manual Deployment

❌ **Don't do this** (old approach):
```bash
# These commands are NOT needed for Firebase App Hosting
firebase deploy
firebase apphosting:backends:create
npm run deploy:production
```

✅ **Do this instead** (Firebase App Hosting approach):
1. Push your code to the connected GitHub branch
2. Firebase automatically builds and deploys
3. Monitor deployment in Firebase Console
4. Use secrets for environment variables

Firebase App Hosting handles all deployment automation for you!