# GitHub Actions Workflows

This directory contains GitHub Actions workflows for administrative user management operations.

## Available Workflows

### 1. Make User Admin (`make-admin.yml`)
**Purpose:** Promote users to admin status across environments

### 2. List Admin Users (`list-admins.yml`)
**Purpose:** Display all users with admin role and their status

### 3. Make User Admin (Production) (`make-admin-production.yml`)
**Purpose:** Secure workflow for production admin access with approval process

### 4. Admin Management Dashboard (`admin-dashboard.yml`)
**Purpose:** Comprehensive admin user analytics and auditing

## Quick Start

### Common Use Cases

1. **Promote a user to admin (dev/staging):**
   - Use `Make User Admin` workflow
   - Select environment and enter email
   - Execution is immediate

2. **Promote a user to admin (production):**
   - Use `Make User Admin (Production)` workflow
   - Provide business justification
   - Requires approval via GitHub issue

3. **View current admins:**
   - Use `List Admin Users` workflow
   - Select environment
   - View results in workflow summary

4. **Admin audit and analytics:**
   - Use `Admin Management Dashboard` workflow
   - Choose action: list, stats, or audit
   - Comprehensive reporting with security analysis

## Detailed Usage

### Make User Admin (Standard)

1. **Navigate to Actions tab** in the GitHub repository
2. **Select "Make User Admin"** workflow
3. **Click "Run workflow"**
4. **Fill in the required inputs:**
   - **User Email**: The email address of the user to promote to admin
   - **Environment**: Target environment (development, staging, production)

### Required Secrets

The workflow requires the following repository secrets to be configured for each environment:

#### Development Environment
- `FIREBASE_PROJECT_ID` - Firebase project ID for development
- `FIREBASE_CLIENT_EMAIL` - Service account email for development
- `FIREBASE_PRIVATE_KEY` - Service account private key for development

#### Staging Environment  
- `FIREBASE_PROJECT_ID` - Firebase project ID for staging
- `FIREBASE_CLIENT_EMAIL` - Service account email for staging
- `FIREBASE_PRIVATE_KEY` - Service account private key for staging

#### Production Environment
- `FIREBASE_PROJECT_ID` - Firebase project ID for production
- `FIREBASE_CLIENT_EMAIL` - Service account email for production
- `FIREBASE_PRIVATE_KEY` - Service account private key for production

### Security Features

1. **Email Validation**: Validates email format before execution
2. **Environment Isolation**: Uses GitHub environment protection rules
3. **Input Validation**: Ensures required inputs are provided
4. **Audit Trail**: Creates GitHub Actions run logs for compliance
5. **Error Handling**: Provides clear error messages for troubleshooting

### Prerequisites

1. **User must exist**: The user must have already signed in to the application at least once
2. **Firebase permissions**: The service account must have Firestore write permissions
3. **GitHub permissions**: Only users with workflow execution permissions can run this action

### Workflow Steps

1. **Checkout**: Downloads the repository code
2. **Setup Node.js**: Installs Node.js 20 with npm caching
3. **Install Dependencies**: Installs required npm packages
4. **Validate Email**: Checks email format using regex
5. **Setup Firebase**: Verifies Firebase environment variables
6. **Run Script**: Executes the make-admin TypeScript script
7. **Summary**: Provides execution summary in GitHub Actions UI

### Error Handling

The workflow will fail if:
- Email format is invalid
- Required secrets are not configured
- User does not exist in Firestore
- Firebase connection fails
- Service account lacks permissions

### Monitoring

All executions are logged in:
- GitHub Actions run history
- Firebase Admin SDK audit logs
- Application server logs (if configured)

### Best Practices

1. **Review before execution**: Verify the email address before running
2. **Use appropriate environment**: Match the environment to your intent
3. **Monitor execution**: Check the logs for successful completion
4. **Verify result**: Confirm the user has admin access in the application
5. **Document changes**: Record admin promotions for compliance

### Troubleshooting

#### Common Issues

**"Invalid email format"**
- Check that the email address is properly formatted
- Ensure no extra spaces or special characters

**"Firebase environment variables not set"**
- Verify secrets are configured in repository settings
- Check that the environment name matches the secret names

**"User not found"**
- Confirm the user has signed in to the application at least once
- Verify the email address matches exactly (case-sensitive)

**"Permission denied"**
- Ensure the service account has Firestore write permissions
- Check Firebase IAM roles and permissions

## Local Script Usage

You can also run admin management operations locally using npm scripts:

```bash
# Make a user admin locally
npm run admin:make user@example.com

# List all admin users locally
npm run admin:list

# Generate admin dashboard locally
npm run admin:dashboard list      # List users with stats
npm run admin:dashboard stats     # Show only statistics
npm run admin:dashboard audit     # Full security audit

# Test and manage lastLogin tracking
npm run admin:test-lastlogin user@example.com     # Check user's login status
npm run admin:update-lastlogin user@example.com   # Manually update lastLogin
npm run migrate:lastlogin                         # Add lastLogin field to existing users

# Show help for scripts
npx tsx scripts/make-admin.ts --help
npx tsx scripts/list-admins.ts --help
npx tsx scripts/admin-dashboard.ts --help
```

**Note:** Local execution requires proper Firebase environment variables in `.env.local`

## Workflow Features Comparison

| Feature | Make Admin | List Admins | Production | Dashboard |
|---------|------------|-------------|------------|-----------|
| Immediate execution | ✅ | ✅ | ❌ | ✅ |
| Requires approval | ❌ | ❌ | ✅ | ❌ |
| Multi-environment | ✅ | ✅ | ❌ | ✅ |
| Audit logging | ✅ | ✅ | ✅ | ✅ |
| Security analysis | ❌ | ❌ | ✅ | ✅ |
| Statistics | ❌ | ✅ | ❌ | ✅ |

### Support

For issues with these workflows:
1. Check the GitHub Actions logs for error details
2. Verify Firebase permissions and configuration
3. Ensure required secrets are properly set
4. Contact the development team for assistance