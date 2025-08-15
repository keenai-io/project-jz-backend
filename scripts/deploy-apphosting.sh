#!/bin/bash

# Firebase App Hosting Deployment Script
# Usage: ./scripts/deploy-apphosting.sh [environment]
# Environments: development, staging, production

set -e  # Exit on any error

# Default environment
ENVIRONMENT=${1:-development}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Firebase App Hosting deployment for ${ENVIRONMENT}...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed.${NC}"
    echo -e "${YELLOW}Please ensure firebase-tools is installed from package.json dependencies.${NC}"
    echo -e "${YELLOW}Run: npm install${NC}"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase. Please log in:${NC}"
    firebase login
fi

# Run pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Type check
echo -e "${YELLOW}📝 Type checking...${NC}"
npm run type-check

# Lint check
echo -e "${YELLOW}🧹 Linting...${NC}"
npm run lint

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test

echo -e "${GREEN}✅ All checks passed!${NC}"

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run intlayer:build
npm run build

# Set environment-specific configurations
case $ENVIRONMENT in
    "production")
        PROJECT_ID="marketplace-ai-prod"
        BACKEND_ID="marketplace-ai-backend"
        ;;
    "staging")
        PROJECT_ID="marketplace-ai-staging"
        BACKEND_ID="marketplace-ai-staging-backend"
        ;;
    "development"|*)
        PROJECT_ID="marketplace-ai-dev"
        BACKEND_ID="marketplace-ai-dev-backend"
        ;;
esac

echo -e "${BLUE}📦 Deploying to ${ENVIRONMENT} (Project: ${PROJECT_ID})...${NC}"

# Use the specified project
firebase use $PROJECT_ID

# Deploy App Hosting backend
echo -e "${YELLOW}☁️  Deploying App Hosting backend...${NC}"
firebase apphosting:backends:create $BACKEND_ID --repo=github:YOUR_USERNAME/marketplace-ai --branch=main

# Monitor deployment
echo -e "${BLUE}👀 Monitoring deployment status...${NC}"
firebase apphosting:backends:get $BACKEND_ID

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Your app should be available at: https://${BACKEND_ID}--${PROJECT_ID}.web.app${NC}"

# Optional: Run post-deployment tests
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}🧪 Running post-deployment smoke tests...${NC}"
    # Add your smoke test commands here
    # npm run test:e2e:production
fi

echo -e "${GREEN}✨ Deployment process completed!${NC}"