# Marketplace AI - Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Marketplace AI codebase, a Next.js 15 application with React 19 designed for AI-powered marketplace optimization. It documents the actual implementation patterns, technical debt, integrations, and real-world constraints that exist as of the current state.

### Document Scope

Comprehensive documentation of the entire system, focused on the two main business domains:
1. **SpeedgoOptimizer**: Excel file processing and product categorization via external AI service
2. **Configuration**: User settings and preferences management

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-13 | 1.0 | Initial brownfield analysis | Claude Code |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `app/[locale]/page.tsx` → `app/[locale]/home/index.tsx`
- **Feature Modules**: `features/SpeedgoOptimizer/`, `features/Configuration/`
- **Configuration**: `auth.config.ts`, `intlayer.config.ts`, `next.config.ts`
- **Core Business Logic**: 
  - `features/SpeedgoOptimizer/application/` (Excel processing, categorization)
  - `features/Configuration/application/ConfigurationService.ts`
- **External AI Integration**: `features/SpeedgoOptimizer/application/submitProductCategorization.ts`
- **Database Models**: Firestore collections (users, configurations)
- **Authentication**: `auth.ts`, `middleware.ts` (Auth.js v5 + Firebase)

### Enhancement Planning Context

If planning enhancements, these areas are most commonly modified:
- **File Processing**: `features/SpeedgoOptimizer/application/ProcessSpeedgoXlsx.ts`
- **AI Integration**: `features/SpeedgoOptimizer/application/submitProductCategorization.ts`
- **UI Components**: `features/SpeedgoOptimizer/presentation/` and `features/Configuration/presentation/`
- **Data Schemas**: `features/*/domain/schemas/` (all Zod-based)
- **Hooks**: `features/*/hooks/` (TanStack Query integration)

## High Level Architecture

### Technical Summary

**Type**: Single-page application (SPA) with external AI service integration
**Architecture Pattern**: Vertical Slice Architecture with feature-based modules
**Primary Use Case**: Excel file upload, AI-powered product categorization via external service, and result export
**Key Business Value**: Streamlines marketplace product optimization workflow with external AI categorization service

### Actual Tech Stack (from package.json)

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| Framework | Next.js | 15.4.6 | App Router with Turbopack in development |
| Runtime | React | 19.1.1 | Latest with new compiler features |
| Language | TypeScript | ^5 | Strict mode enabled in tsconfig.json |
| Styling | Tailwind CSS | ^4 | With Headless UI components |
| Authentication | NextAuth.js | 5.0.0-beta.29 | Auth.js v5 with Firebase adapter |
| Database | Firestore | - | Via firebase-admin 12.7.0 |
| State Management | TanStack Query | ^5.83.0 | Server state with React Query |
| Forms | TanStack Form | ^1.19.0 | With Zod validation |
| I18n | Intlayer | ^5.6.0 | next-intlayer integration |
| Excel Processing | SheetJS | 0.20.3 | Custom CDN URL in package.json |
| Testing | Vitest | ^3.2.4 | With React Testing Library |
| Logging | Winston | ^3.17.0 | Client and server loggers |

### Repository Structure Reality Check

- **Type**: Monorepo with feature-based organization
- **Package Manager**: Yarn 4.9.2 (specified in package.json)
- **Build System**: Next.js with Turbopack for development
- **Notable**: Uses bmad-method 4.36.2 (custom methodology package)

## Source Tree and Module Organization

### Project Structure (Actual)

```text
marketplace-ai/
├── app/                        # Next.js App Router
│   ├── [locale]/              # Intlayer locale-based routing
│   │   ├── ClientLayout.tsx    # Client-side layout wrapper
│   │   ├── home/              # Main application page
│   │   │   └── index.tsx      # Primary UI orchestration
│   │   ├── signin/            # Authentication pages
│   │   └── layout.tsx         # Locale-specific layout
│   ├── actions/               # Server Actions
│   │   ├── auth.ts           # Authentication server actions
│   │   └── configuration.ts   # Configuration persistence
│   ├── api/auth/[...nextauth]/ # Auth.js v5 API routes
│   └── components/            # Shared UI components
│       ├── common/           # App-specific shared components
│       ├── providers/        # React context providers
│       ├── error-boundaries/ # Error handling components
│       └── ui/              # Tailwind Catalyst base components
├── features/                  # Vertical Slice Architecture
│   ├── SpeedgoOptimizer/     # Main business feature
│   │   ├── application/      # Business logic & external AI integration
│   │   ├── domain/schemas/   # Zod validation schemas
│   │   ├── hooks/           # TanStack Query React hooks
│   │   ├── presentation/    # React components
│   │   └── __tests__/       # Feature-specific tests
│   ├── Configuration/        # User settings feature
│   │   ├── application/     # Configuration service logic
│   │   ├── domain/schemas/  # Configuration Zod schemas
│   │   ├── hooks/          # Configuration React hooks
│   │   ├── presentation/   # Configuration UI components
│   │   └── __tests__/      # Configuration tests
│   └── Auth/               # Authentication feature (minimal)
├── lib/                      # Core utilities
│   ├── env.ts              # Environment validation (Zod)
│   ├── firestore.ts        # Firestore client configuration
│   ├── logger.client.ts    # Client-side Winston logger
│   ├── logger.server.ts    # Server-side Winston logger
│   ├── query-client.ts     # TanStack Query configuration
│   └── zod-error-formatter.ts # Error formatting utility
├── PRPs/                     # Product Requirement Prompts
│   ├── template/            # PRP templates and methodology
│   ├── scripts/            # PRP automation scripts
│   └── [enhancement-specs]  # Individual enhancement PRPs
├── scripts/                  # Build and deployment scripts
├── middleware.ts            # Next.js middleware (Auth + i18n)
├── auth.ts & auth.config.ts # Auth.js v5 configuration
└── Configuration Files      # TypeScript, ESLint, Tailwind, etc.
```

### Key Modules and Their Purpose

- **SpeedgoOptimizer**: Excel file upload, processing, external AI categorization service integration, and result export
- **Configuration**: User settings for SEO parameters, image processing, and personal preferences  
- **Authentication**: Auth.js v5 with Google OAuth and Firebase Firestore adapter
- **UI Components**: Tailwind Catalyst-based component library with custom extensions
- **Internationalization**: Intlayer-based translation system (English/Korean)

## Data Models and APIs

### Data Models

**Primary Schemas** (see actual files for complete validation):

- **Configuration Model**: `features/Configuration/domain/schemas/ConfigurationSchemas.ts`
  - SEO settings (temperature, banned words)  
  - Image processing (rotation, watermark, flip)
  - Branded UUID identifiers with Zod validation

- **Product Models**: `features/SpeedgoOptimizer/domain/schemas/`
  - `CategoryRequest.ts` - Input format for external AI categorization service
  - `CategoryResponse.ts` - AI categorization results format
  - `ProductRequest.ts` & `ProductResponse.ts` - Individual product handling

### API Specifications

**External AI Categorization Service**:
- **Endpoint**: `https://product-categorizer-364702430350.us-central1.run.app/match`
- **Method**: POST
- **Content-Type**: application/json
- **Request Format**: Array of `CategoryRequestItem[]`
- **Response Format**: Array of categorized products
- **Rate Limits**: Maximum 3000 records per submission
- **Integration File**: `features/SpeedgoOptimizer/application/submitProductCategorization.ts`

**Internal APIs**:
- **Authentication**: Firebase Auth via Auth.js v5 adapter
- **Database**: Firestore collections:
  - `users/{userId}` - User profile data  
  - `configurations/{userId}` - User configuration settings
- **File Processing**: Client-side Excel parsing with SheetJS (no server upload)

## Technical Debt and Known Issues

### Critical Technical Debt

1. **API Error Handling**: Complex error parsing logic for external AI service responses
   - File: `submitProductCategorization.ts:97-132`
   - Multiple error format handling (FastAPI validation, generic errors)
   - Could be simplified with more consistent error handling patterns

2. **Firebase Service Account Configuration**: Mixed configuration patterns
   - Both `GOOGLE_APPLICATION_CREDENTIALS` file and individual env vars supported
   - May cause confusion in deployment scenarios
   - File: `lib/firestore.ts:34-44`

3. **Test Coverage**: Currently 60-70% coverage, below project requirement of 80%
   - Some tests disabled (.disabled extensions)
   - Missing integration tests for external AI service calls
   - No mocking strategy documented for external AI service in tests

4. **Large Record Batches**: Client-side processing of large Excel files
   - No chunking strategy for files >3000 records
   - Memory usage could be optimized for large datasets
   - UI may become unresponsive during large file processing

### Workarounds and Gotchas

- **Intlayer Builds**: MUST use `npm run intlayer:build`, not `npx intlayer build` (binary symlink issues)
- **Development HTTPS**: Uses self-signed certificates in `certificates/` for local development  
- **Excel Processing**: Direct file processing in browser - no server-side validation of file contents
- **Authentication Middleware**: Combines Auth.js and Intlayer middleware - order matters in `middleware.ts`
- **Firebase Rules**: Security rules assume email as user ID, not Firebase UID
- **AI Service Timeout**: No explicit timeout configured for external AI service calls (relies on fetch defaults)

## Integration Points and External Dependencies  

### External Services

| Service | Purpose | Integration Type | Status | Key Files |
|---------|---------|------------------|--------|-----------|
| AI Categorization Service | Product categorization | REST API (POST) | Active | `submitProductCategorization.ts` |
| Firebase Auth | User authentication | SDK + Auth.js adapter | Active | `auth.ts`, `auth.config.ts` |
| Firestore | User data persistence | firebase-admin SDK | Active | `lib/firestore.ts` |
| Google OAuth | Social authentication | Auth.js provider | Active | Environment variables |

### External AI Service Integration Details

**Service**: Product Categorizer (Google Cloud Run)
- **URL**: `https://product-categorizer-364702430350.us-central1.run.app/match`
- **Authentication**: None (public endpoint)
- **Request Limits**: 3000 records maximum per request
- **Error Handling**: FastAPI-style validation errors + generic error responses
- **Response Time**: Logged via Winston with duration tracking
- **Retry Logic**: TanStack Query handles retries (up to 2 attempts for network/server errors)

### Internal Integration Points

- **Client ↔ Server**: Server Actions for data persistence (`app/actions/`)
- **Client ↔ External AI**: Server Action calls external API, returns processed results
- **State Management**: TanStack Query for server state + React hooks for local state  
- **File Processing**: Client-side Excel parsing, transformation, then server-side API calls
- **Authentication Flow**: NextAuth.js → Firebase → Firestore user document creation
- **Internationalization**: Content files co-located with components (`.content.ts`)

## Development and Deployment

### Local Development Setup

**Current Working Process**:
1. `npm install` (uses Yarn 4.9.2 under the hood)
2. Set up `.env.local` with Firebase and Auth configuration
3. `npm run setup:firestore` (creates required Firestore collections)
4. `npm run intlayer:build` (REQUIRED before dev server)  
5. `npm run dev` (includes intlayer:build automatically)

**Development server**: `https://localhost:3000` (note HTTPS for auth compatibility)

### Build and Deployment Process

- **Build Command**: `npm run build` (Next.js production build)
- **Type Checking**: `npm run type-check` (no-emit TypeScript compilation)
- **Testing**: Vitest with coverage reporting
- **Linting**: ESLint with Next.js and TypeScript rules
- **Deployment**: Manual process, no automated CI/CD configured

### Environment Configuration

**Required Environment Variables** (see `.env.example`):
```bash
# Firebase Configuration (choose one method)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email  
FIREBASE_PRIVATE_KEY=your-private-key
# OR
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Auth.js Configuration
AUTH_SECRET=your-32-character-secret
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=your-google-oauth-id
AUTH_GOOGLE_SECRET=your-google-oauth-secret

# NOTE: No API keys required for external AI service (public endpoint)
```

## Testing Reality

### Current Test Coverage

- **Unit Tests**: Vitest + React Testing Library
- **Coverage**: 60-70% actual (requirement: 80%)
- **Integration Tests**: Minimal coverage
- **E2E Tests**: None implemented
- **Test Location**: Co-located in `__tests__` folders within features

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:ui       # Vitest UI interface
```

**Known Test Issues**:
- Some tests disabled with `.disabled` extensions
- Configuration modal tests need updating for current implementation
- Missing tests for external AI service integration (no mocking strategy)
- No error scenario tests for AI service failures

## Feature-Specific Architecture

### SpeedgoOptimizer Feature (Primary Business Logic)

**Purpose**: Excel file upload, product categorization via external AI service, and result export

**Key Components**:
- **File Management**: `useFileManagement.ts` - drag/drop, preview, deletion
- **File Processing**: `useFileProcessing.ts` - orchestrates categorization workflow  
- **Excel Processing**: `ProcessSpeedgoXlsx.ts` - SheetJS integration for .xlsx files
- **Data Transformation**: `transformExcelData.ts` - converts Excel data to AI service format
- **External AI Integration**: `submitProductCategorization.ts` - calls external categorization service
- **UI Sections**: Modular components (Upload, Processing, Viewer, Results)

**Data Flow**:
1. User uploads Excel file → Client-side parsing with SheetJS
2. File data transformed to `CategoryRequestItem[]` format
3. `submitProductCategorization()` server action calls external AI service
4. AI service returns categorized products with confidence scores
5. Results displayed in `CategoryResultsTable` component
6. Export functionality via `exportCategorizationResults.ts`

**External Service Integration Pattern**:
- Server Action validates input with Zod schemas
- Makes HTTP POST to external AI categorization service
- Handles multiple error response formats (FastAPI validation, generic)
- Validates response with Zod schemas
- Returns structured success/failure results to client

### Configuration Feature (Secondary)

**Purpose**: User settings for SEO and image processing parameters

**Key Components**:
- **Schema Definition**: `ConfigurationSchemas.ts` - comprehensive Zod validation
- **Data Persistence**: Server Actions + Firestore integration
- **Form Management**: TanStack Form with Zod validation
- **UI**: Modal-based configuration interface

**Settings Managed**:
- SEO: Temperature (0-10), banned words list
- Image: Rotation direction/degrees, flip, watermark settings  
- User preferences and defaults

## Authentication & Security Implementation

### Auth.js v5 Configuration (Current State)

The project uses Auth.js v5 (NextAuth.js v5) with Firebase Firestore adapter.

**Authentication Flow**:
1. User clicks sign-in → redirected to `/signin`
2. Google OAuth flow initiated via Auth.js
3. User grants permissions → Auth.js creates session
4. Firebase Firestore user document created/updated via adapter
5. Middleware redirects authenticated users to `/` (home)

**Security Model**:
- **Route Protection**: Middleware-based, redirects to `/signin` for unauthenticated users
- **Firestore Security**: Rules restrict user data access to owner only (`request.auth.token.email == userId`)
- **Session Management**: Server-side session storage via Auth.js with Firestore adapter
- **External API Security**: AI service is public endpoint, no authentication required

**Current Security Considerations**:
- Uses email address as Firestore document ID (not Firebase UID)
- HTTPS required for OAuth callback (self-signed certs in development)
- No rate limiting implemented for external AI service calls
- Private key handling via environment variables (production) or file (development)
- External AI service calls contain user data - ensure service provider's data handling compliance

## Critical Development Guidelines

### Mandatory Patterns (From CLAUDE.md)

1. **TypeScript**: STRICT mode, explicit return types, branded types for IDs
2. **Validation**: ALL external data validated with Zod schemas (including AI service responses)
3. **State Management**: TanStack Query for server state, minimal local state
4. **Error Handling**: Structured logging with Winston, proper error boundaries
5. **Testing**: 80% minimum coverage requirement, co-located tests
6. **File Size Limits**: 500 lines max per file, 200 lines max per component
7. **Internationalization**: ALL user-facing text via Intlayer content files

### Component Architecture Patterns

- **UI Components**: Tailwind Catalyst base components with custom extensions
- **Feature Components**: Feature-specific components in `presentation/` folders
- **Hooks**: TanStack Query integration hooks for data fetching
- **Forms**: TanStack Form + Zod validation pattern consistently applied
- **Logging**: Environment-specific loggers (client vs server) with structured contexts
- **External Service Integration**: Server Actions with comprehensive error handling

## Known Limitations and Constraints

### Business Logic Constraints

1. **File Size**: No explicit limits on Excel file size (client-side processing only)
2. **File Types**: Only .xlsx files supported (SheetJS dependency)
3. **Batch Processing**: External AI service limit of 3000 records per request
4. **Export Formats**: Excel export only (no CSV, JSON, or other formats)
5. **AI Service Dependency**: Core functionality requires external service availability

### Technical Constraints

1. **Network Dependency**: Application requires internet connectivity for AI categorization
2. **AI Service Latency**: No progress indicators for long-running categorization requests
3. **Offline Mode**: No offline capability (requires authentication and AI service)
4. **Mobile UX**: Responsive design present but not optimized for mobile file handling
5. **Browser Compatibility**: Modern browsers only (ES2022 target)
6. **Scalability**: Client-side processing may fail with very large Excel files

### Development Constraints

1. **Testing**: Below required 80% coverage threshold
2. **External Service Testing**: No mocking strategy for AI service calls
3. **CI/CD**: No automated deployment pipeline configured  
4. **Monitoring**: Logging configured but no production monitoring/alerting
5. **Performance**: No performance monitoring for external service calls

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
# Development workflow
npm run intlayer:build  # Required before development
npm run dev            # Start development server (includes intlayer:build)
npm run build          # Production build
npm start              # Start production server

# Quality assurance
npm run type-check     # TypeScript compilation check
npm run lint           # ESLint validation
npm test               # Run test suite
npm run test:coverage  # Test coverage report

# Firebase management  
npm run setup:firestore     # Initialize Firestore collections
npm run config:firebase     # Generate firebase.json config
npm run deploy:firestore-rules # Deploy security rules
```

### Debugging and Troubleshooting

- **Logs**: Development console + Winston file logs (if configured)
- **External AI Service**: Check server logs for API request/response details
- **Debug Mode**: Set `NODE_OPTIONS='--inspect'` (included in dev script)
- **Common Issues**: 
  - Intlayer build failures → use npm script, not npx
  - Auth errors → check HTTPS and environment variables  
  - File processing errors → check browser console and client logger
  - AI service errors → check server logs for detailed API error responses
- **Database Connection**: Test with `npm run setup:firestore`

### External Service Testing

```bash
# Manual API testing (example)
curl -X POST "https://product-categorizer-364702430350.us-central1.run.app/match" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '[{"name":"Sample Product","description":"Test description"}]'
```

### Project Validation Workflow

```bash
# Full project validation (recommended before commits)
npm run intlayer:build  # Ensure translations are built
npm run type-check      # TypeScript validation
npm run lint           # Code style validation  
npm test               # Run test suite
npm run build          # Ensure production build works
```

---

**Document Status**: This brownfield architecture document reflects the actual current state as of August 2025. It includes technical debt, known limitations, and real implementation patterns including the external AI service integration.

**Next Steps for Enhancement**: 
1. Implement proper testing strategy for external AI service integration
2. Achieve 80% test coverage requirement  
3. Add error handling and retry logic for AI service failures
4. Implement progress indicators for long-running AI categorization requests
5. Consider chunking strategy for large file processing

*For enhancement-specific guidance, see individual PRP documents in `PRPs/` directory.*