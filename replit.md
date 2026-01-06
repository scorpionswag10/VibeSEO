# VibeSEO - SEO Rank Tracking Application

## Overview

VibeSEO is a full-stack SEO rank tracking application that allows users to monitor keyword rankings across search engines (Google, Bing, DuckDuckGo), track competitors, and visualize ranking trends over time. The application follows a monorepo structure with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization (ranking trends)
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a pages/components/hooks architecture:
- `client/src/pages/` - Route-level components (Dashboard, ProjectDetails, Settings)
- `client/src/components/` - Reusable UI components including shadcn/ui primitives
- `client/src/hooks/` - Custom hooks for data fetching (useProjects, useKeywords, useCompetitors, useSettings)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe request/response validation
- **Scheduled Tasks**: node-cron for automated rank checking

Key backend files:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route handlers
- `server/storage.ts` - Database abstraction layer (IStorage interface)
- `server/db.ts` - Drizzle database connection

### Shared Code
- `shared/schema.ts` - Drizzle table definitions and Zod insert schemas
- `shared/routes.ts` - API route definitions with input/output schemas for type safety across client and server

### Database Schema
Four main tables:
1. **projects** - Websites being tracked (name, url)
2. **keywords** - Search terms to track per project (term, location)
3. **rankHistory** - Time-series ranking data (googleRank, bingRank, ddgRank)
4. **competitors** - Competitor domains with backlink tracking
5. **settings** - User preferences (email notifications)

### Development vs Production
- Development: Vite dev server with HMR, served through Express middleware
- Production: Vite builds static assets to `dist/public`, Express serves them via `server/static.ts`
- Build script uses esbuild for server bundling with selective dependency bundling

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Schema migrations via `npm run db:push`

### Email Service
- **Resend**: Email notifications for ranking alerts (requires `RESEND_API_KEY` environment variable)

### SEO Data APIs (Optional)
- **DataForSEO**: Keyword ranking data (currently mocked when API keys missing)
- Mock rankings enabled by default (`MOCK_RANKINGS = true` in routes.ts)

### Session Storage
- **connect-pg-simple**: PostgreSQL-backed session storage for Express sessions

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `RESEND_API_KEY` - Resend email service API key (optional, for email notifications)