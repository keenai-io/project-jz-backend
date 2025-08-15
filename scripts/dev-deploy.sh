#!/bin/bash

# Local Development Deployment Script
# This script sets up and runs the development environment with Firebase emulators

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Setting up development environment...${NC}"

# Check dependencies
echo -e "${YELLOW}📋 Checking dependencies...${NC}"

if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java not found. Please install Java first.${NC}"
    echo -e "${YELLOW}Install with: sudo apt install -y openjdk-17-jre-headless${NC}"
    exit 1
fi

if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found.${NC}"
    echo -e "${YELLOW}Please ensure firebase-tools is installed from package.json dependencies.${NC}"
    echo -e "${YELLOW}Run: npm install${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Generate Firebase config
echo -e "${YELLOW}🔧 Generating Firebase configuration...${NC}"
npm run config:firebase

# Start Firebase emulators
echo -e "${BLUE}🔥 Starting Firebase emulators...${NC}"
firebase emulators:start --only firestore,auth,hosting &
FIREBASE_PID=$!

# Wait for emulators to start
sleep 5

# Start Next.js development server with emulator environment variables
echo -e "${BLUE}⚡ Starting Next.js development server...${NC}"
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
npm run dev &
NEXTJS_PID=$!

echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo -e "${BLUE}📱 Next.js app: https://localhost:3000${NC}"
echo -e "${BLUE}🔥 Firebase emulator UI: http://127.0.0.1:4000${NC}"
echo -e "${BLUE}🗄️  Firestore emulator: http://127.0.0.1:8080${NC}"
echo -e "${BLUE}🔐 Auth emulator: http://127.0.0.1:9099${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    
    # Kill the main processes
    kill $FIREBASE_PID 2>/dev/null || true
    kill $NEXTJS_PID 2>/dev/null || true
    
    # Wait a moment for graceful shutdown
    sleep 2
    
    # Force cleanup any remaining Firebase processes
    echo -e "${YELLOW}🔥 Ensuring all Firebase processes are stopped...${NC}"
    
    # Kill Firebase emulator processes
    pkill -f "firebase.*emulators" 2>/dev/null || true
    pkill -f "java.*firestore" 2>/dev/null || true
    pkill -f "java.*firebase" 2>/dev/null || true
    
    # Wait for processes to exit
    sleep 2
    
    # Force kill if still running
    pkill -9 -f "firebase.*emulators" 2>/dev/null || true
    pkill -9 -f "java.*firestore" 2>/dev/null || true
    pkill -9 -f "java.*firebase" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup complete!${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait