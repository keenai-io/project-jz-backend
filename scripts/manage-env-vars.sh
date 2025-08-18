#!/bin/bash

# Firebase App Hosting Environment Variables Management Script
# Usage: ./scripts/manage-env-vars.sh [action] [environment] [var-file]
# Actions: set, get, delete, list
# Environments: development, staging, production

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ACTION=${1:-list}
ENVIRONMENT=${2:-development}
VAR_FILE=${3:-}

# Environment to Firebase project mapping
case $ENVIRONMENT in
    "production")
        PROJECT_ID="project-jz-464301"
        BACKEND_ID="project-jz-backend"
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

echo -e "${BLUE}🔧 Managing environment variables for ${ENVIRONMENT}...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed.${NC}"
    exit 1
fi

# Use the specified project
firebase use $PROJECT_ID

case $ACTION in
    "set")
        if [ -z "$VAR_FILE" ]; then
            echo -e "${RED}❌ Variable file is required for 'set' action${NC}"
            echo "Usage: $0 set $ENVIRONMENT .env.production"
            exit 1
        fi
        
        if [ ! -f "$VAR_FILE" ]; then
            echo -e "${RED}❌ Variable file '$VAR_FILE' not found${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}📝 Setting environment variables from $VAR_FILE...${NC}"
        
        # Read and set each variable from the file
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
                continue
            fi
            
            # Remove quotes from value if present
            value=$(echo "$value" | sed 's/^"//;s/"$//')
            
            echo -e "${BLUE}Setting $key...${NC}"
            echo "$value" | firebase apphosting:secrets:set --project=$PROJECT_ID --force $key
            firebase apphosting:secrets:grantaccess --backend=$BACKEND_ID $key
        done < "$VAR_FILE"
        
        echo -e "${GREEN}✅ Environment variables set successfully!${NC}"
        ;;
        
    "get")
        VAR_NAME=${3:-}
        if [ -z "$VAR_NAME" ]; then
            echo -e "${RED}❌ Variable name is required for 'get' action${NC}"
            echo "Usage: $0 get $ENVIRONMENT AUTH_SECRET"
            exit 1
        fi
        
        echo -e "${YELLOW}🔍 Getting environment variable: $VAR_NAME${NC}"
        firebase apphosting:secrets:describe $VAR_NAME --project=$PROJECT_ID
        ;;
        
    "delete")
        VAR_NAME=${3:-}
        if [ -z "$VAR_NAME" ]; then
            echo -e "${RED}❌ Variable name is required for 'delete' action${NC}"
            echo "Usage: $0 delete $ENVIRONMENT AUTH_SECRET"
            exit 1
        fi
        
        echo -e "${YELLOW}🗑️  Deleting environment variable: $VAR_NAME${NC}"
        firebase apphosting:secrets:destroy $VAR_NAME --project=$PROJECT_ID
        echo -e "${GREEN}✅ Variable deleted successfully!${NC}"
        ;;
        
    "list"|*)
        echo -e "${YELLOW}📋 Listing environment variables for $ENVIRONMENT...${NC}"
        echo -e "${BLUE}Note: Firebase App Hosting doesn't have a dedicated secrets list command.${NC}"
        echo -e "${BLUE}Using gcloud to list secrets for project $PROJECT_ID:${NC}"
        gcloud secrets list --project=$PROJECT_ID --filter="labels.firebase-apphosting=true OR name~'.*'" --format="table(name,createTime,updateTime)" 2>/dev/null || {
            echo -e "${YELLOW}⚠️  gcloud not available or not authenticated. Cannot list secrets.${NC}"
            echo -e "${BLUE}You can list secrets manually using: gcloud secrets list --project=$PROJECT_ID${NC}"
        }
        ;;
esac

echo -e "${GREEN}🎉 Environment variable operation completed!${NC}"