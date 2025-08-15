# DevOps & Infrastructure Guidelines

This file provides specialized guidance for development operations, deployment, environment management, and infrastructure configuration.

## Core DevOps Philosophy

### Environment First

- **MUST validate ALL environment variables** with Zod schemas
- **Fail Fast**: Environment validation should happen at startup
- **Configuration as Code**: All configurations should be version controlled
- **Security by Default**: Never expose sensitive data in code

## 📦 Package Management & Dependencies

The project uses modern Next.js 15 with React 19 and TypeScript. For complete setup instructions and dependency list, see [README.md](./README.md#core-technologies).

### Dependency Management Principles

- **Lock versions** for production dependencies
- **Regular updates** with testing
- **Security scanning** for vulnerabilities
- **Minimal dependencies** - avoid unnecessary packages

## 🔧 Environment Configuration

### Environment Validation (MUST VALIDATE)

```typescript
// lib/env.ts
import {z} from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32), // Auth.js v5
  AUTH_URL: z.string().url(), // Auth.js v5
  
  // Firebase Configuration
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  
  // Optional development variables
  SKIP_ENV_VALIDATION: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(process.env);
```

### Environment Files Structure

```
.env                    # Default environment variables
.env.local             # Local development overrides (gitignored)
.env.development       # Development environment
.env.test             # Test environment  
.env.production       # Production environment (example only)
```

### Environment Variables Checklist

- [ ] All environment variables defined in Zod schema
- [ ] Sensitive variables only in `.env.local` (gitignored)
- [ ] Example variables documented in `.env.example`
- [ ] Production variables stored securely (not in repository)
- [ ] Environment validation runs at application startup

## 🚀 Build & Deployment Configuration

### Next.js Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // Turbopack configuration for development
    },
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['example.com'], // Add allowed image domains
  },
  // Bundle analyzer
  webpack: (config, {dev, isServer}) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Build Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "intlayer:build": "intlayer build",
    "intlayer:watch": "intlayer build --watch"
  }
}
```

## 🔐 Security Configuration

### Security Headers

```typescript
// Security headers in Next.js config
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options', 
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ],
    },
  ];
}
```

### Content Security Policy

```typescript
// CSP configuration for enhanced security
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

// Add to headers configuration
{
  key: 'Content-Security-Policy',
  value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
}
```

## 📝 Logging Infrastructure

### Environment-Specific Logging Behavior

**Development:**
- Enhanced console output with colors and source file locations
- Debug level enabled
- Pretty-printed objects and stack traces

**Production:**
- JSON structured logs
- File logging enabled (`logs/app.log`, `logs/error.log`)
- Optimized for log aggregation systems

**Test:**
- Minimal logging to reduce noise
- Silent mode for console output

### Log File Configuration

```typescript
// Production logging setup
if (process.env.NODE_ENV === 'production') {
  // Configure Winston for file logging
  const winston = require('winston');
  
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/app.log' }),
    ],
  });
}
```

## 📋 Development Commands & Workflow

### Essential Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server

# Quality Assurance
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript compilation check
npm run format          # Format code with Prettier
npm run format:check    # Check formatting

# Testing
npm run test            # Run tests
npm run test:coverage   # Run tests with coverage report
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI

# Internationalization
npm run intlayer:build  # Build Intlayer types
npm run intlayer:watch  # Watch Intlayer changes
```

### Pre-deployment Checklist

```bash
# Run all quality checks before deployment
npm run type-check      # Must pass with zero errors
npm run lint           # Must pass with zero warnings
npm run test:coverage  # Must maintain 80%+ coverage
npm run build          # Must build successfully
npm run format:check   # Must be properly formatted
```

## 🔄 CI/CD Pipeline Configuration

### GitHub Actions Example

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type check
        run: npm run type-check
        
      - name: Lint
        run: npm run lint
        
      - name: Format check
        run: npm run format:check
        
      - name: Build Intlayer
        run: npm run intlayer:build
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Build application
        run: npm run build
```

### Environment Variables in CI/CD

```yaml
# GitHub Actions environment variables
env:
  NODE_ENV: test
  NEXT_PUBLIC_APP_URL: http://localhost:3000
  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
  AUTH_SECRET: ${{ secrets.TEST_AUTH_SECRET }}
  AUTH_URL: http://localhost:3000
```

## 🚀 Deployment Configuration

### Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "INTLAYER_BUILD": "true"
    }
  }
}
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run intlayer:build
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

## 🔧 Development Tools Configuration

### ESLint Configuration

```javascript
// eslint.config.mjs
import {dirname} from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "no-console": ["error", {"allow": ["warn", "error"]}],
      "react/function-component-definition": ["error", {
        "namedComponents": "arrow-function"
      }],
    },
  },
];

export default eslintConfig;
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🏗️ Infrastructure as Code

### Firebase Configuration

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: env.FIREBASE_PROJECT_ID,
  // Other config from environment variables
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

## DevOps FORBIDDEN Practices

- ❌ **NEVER commit sensitive data** to version control
- ❌ **NEVER hardcode environment variables** in source code
- ❌ **NEVER skip environment validation** in production
- ❌ **NEVER deploy without running full test suite**
- ❌ **NEVER ignore security headers** in production
- ❌ **NEVER use development dependencies** in production builds
- ❌ **NEVER skip type checking** in CI/CD pipeline
- ❌ **NEVER deploy with failing tests** or linting errors

## DevOps Checklist

- [ ] Environment variables validated with Zod schema
- [ ] All sensitive data in environment variables (not code)
- [ ] Security headers configured
- [ ] Content Security Policy implemented
- [ ] Build process optimized for production
- [ ] CI/CD pipeline configured with all quality checks
- [ ] Deployment configuration ready
- [ ] Docker configuration (if applicable)
- [ ] Monitoring and logging configured for production
- [ ] Error tracking system integrated
- [ ] Performance monitoring in place
- [ ] Automated dependency updates configured

---

*Specialized for DevOps and infrastructure management*
*For complete guidelines, see main CLAUDE.md*