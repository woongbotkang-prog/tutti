# TUTTI Platform - Technical Conventions & Development Guide

**Version:** 1.0.0  
**Last Updated:** 2026-02-14  
**Stack:** Next.js 14 (App Router), TypeScript, Supabase (PostgreSQL + Auth), React 19

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Naming Conventions](#naming-conventions)
4. [Code Style & Quality](#code-style--quality)
5. [TypeScript Standards](#typescript-standards)
6. [Component Architecture](#component-architecture)
7. [API & Data Fetching](#api--data-fetching)
8. [Environment Variables](#environment-variables)
9. [Git Workflow](#git-workflow)
10. [Database & ORM](#database--orm)
11. [Authentication & Authorization](#authentication--authorization)
12. [Error Handling](#error-handling)
13. [Testing Strategy](#testing-strategy)
14. [Performance & Optimization](#performance--optimization)
15. [Deployment](#deployment)

---

## Project Overview

### What is TUTTI?

**TUTTI** (together) is a musician matching platform connecting individual performers with organizations and vice versa. The platform facilitates:

- **Individual Musicians**: Showcase profiles, find ensemble/organizational opportunities
- **Organizations/Ensembles**: Post recruitment listings, find talented musicians
- **Matching & Collaboration**: Application system with blind reviews
- **Communication**: Built-in messaging after successful matches
- **Community Ratings**: Manner temperature and blind review system

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 14+ | App Router, Server Components, API Routes |
| **Framework** | React | 19+ | UI components, hooks |
| **Language** | TypeScript | 5.0+ | Type-safe development |
| **Styling** | Tailwind CSS | 3+ | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Accessible component library |
| **Database** | PostgreSQL | 14+ | Relational data (Supabase) |
| **Auth** | Supabase Auth | - | Email/password, OAuth integrations |
| **ORM** | Prisma | 5+ | Type-safe database queries |
| **Forms** | React Hook Form | 7+ | Form state management |
| **Validation** | Zod | 3+ | TypeScript-first validation |
| **State Management** | TanStack Query | 5+ | Server state management |
| **HTTP Client** | Fetch API / Axios | - | API communication |
| **Testing** | Jest + React Testing Library | - | Unit & component tests |
| **Linting** | ESLint | Latest | Code quality |
| **Formatting** | Prettier | Latest | Code formatting |

---

## Folder Structure

```
tutti/
├── .github/
│   └── workflows/              # CI/CD workflows (GitHub Actions)
│       ├── test.yml
│       ├── lint.yml
│       └── deploy.yml
│
├── app/                         # Next.js App Router (main application)
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404 page
│   │
│   ├── (auth)/                 # Authentication route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx          # Auth-specific layout
│   │
│   ├── (dashboard)/            # Protected routes (with layout)
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   └── layout.tsx
│   │   ├── profile/
│   │   │   ├── [type]/         # [individual|organization]
│   │   │   │   └── page.tsx
│   │   │   ├── edit/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── listings/
│   │   │   ├── page.tsx        # Browse listings
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # Listing detail
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── my-listings/
│   │   │       └── page.tsx
│   │   ├── applications/
│   │   │   ├── page.tsx        # All applications
│   │   │   ├── received/
│   │   │   │   └── page.tsx    # Received applications
│   │   │   └── sent/
│   │   │       └── page.tsx    # Sent applications
│   │   ├── chat/
│   │   │   ├── page.tsx        # Chat list
│   │   │   └── [roomId]/
│   │   │       └── page.tsx    # Chat room
│   │   ├── reviews/
│   │   │   ├── page.tsx        # My reviews
│   │   │   └── [chatId]/
│   │   │       └── page.tsx    # Review form
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   └── not-found.tsx       # Dashboard 404
│   │
│   ├── (public)/               # Public pages
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── faq/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/                    # API routes (backend)
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── refresh/route.ts
│   │   ├── users/              # User profile endpoints
│   │   │   ├── route.ts        # GET /api/users (current user)
│   │   │   ├── [id]/route.ts   # GET /api/users/[id]
│   │   │   └── update/route.ts # PUT /api/users/update
│   │   ├── profiles/           # Individual/Organization profiles
│   │   │   ├── individual/
│   │   │   │   ├── route.ts    # GET/POST individual profiles
│   │   │   │   └── [id]/route.ts
│   │   │   ├── organization/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── repertoire/
│   │   │       ├── route.ts    # GET/POST/DELETE repertoire
│   │   │       └── [id]/route.ts
│   │   ├── listings/           # Listing CRUD endpoints
│   │   │   ├── route.ts        # GET (search) / POST (create)
│   │   │   ├── [id]/route.ts   # GET (detail) / PUT (update) / DELETE
│   │   │   └── search/route.ts # Advanced search
│   │   ├── applications/       # Application endpoints
│   │   │   ├── route.ts        # GET / POST (new application)
│   │   │   ├── [id]/route.ts   # GET (detail) / PUT (respond)
│   │   │   └── my-applications/route.ts
│   │   ├── chat/               # Chat/messaging endpoints
│   │   │   ├── rooms/
│   │   │   │   ├── route.ts    # GET chat rooms
│   │   │   │   └── [id]/route.ts
│   │   │   └── messages/
│   │   │       ├── route.ts    # POST message / GET messages
│   │   │       └── [id]/route.ts # PUT (edit) / DELETE
│   │   ├── reviews/            # Review endpoints
│   │   │   ├── route.ts        # GET / POST review
│   │   │   └── [id]/route.ts   # GET / PUT review
│   │   ├── master/             # Master data endpoints
│   │   │   ├── regions/route.ts
│   │   │   ├── instruments/route.ts
│   │   │   ├── composers/route.ts
│   │   │   └── categories/route.ts
│   │   ├── upload/             # File upload endpoint
│   │   │   └── route.ts        # POST multipart file
│   │   ├── search/             # Global search
│   │   │   └── route.ts        # GET (search query)
│   │   └── health/
│   │       └── route.ts        # Health check / status
│   │
│   └── middleware.ts           # Middleware for auth, redirects, etc.
│
├── components/                 # Reusable React components
│   ├── layout/                 # Layout components
│   │   ├── header-nav.tsx      # Main navigation
│   │   ├── sidebar.tsx         # Dashboard sidebar
│   │   ├── footer.tsx          # Footer
│   │   └── breadcrumb.tsx      # Breadcrumb navigation
│   ├── auth/                   # Authentication components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── password-reset-form.tsx
│   ├── profile/                # Profile components
│   │   ├── profile-header.tsx
│   │   ├── profile-card.tsx
│   │   ├── profile-edit-form.tsx
│   │   ├── repertoire-list.tsx
│   │   ├── repertoire-form.tsx
│   │   └── skill-badge.tsx
│   ├── listings/               # Listing components
│   │   ├── listing-card.tsx    # Card display
│   │   ├── listing-grid.tsx    # Grid layout
│   │   ├── listing-detail.tsx  # Detail view
│   │   ├── listing-form.tsx    # Create/edit form
│   │   ├── listing-filter.tsx  # Search/filter UI
│   │   └── listing-status-badge.tsx
│   ├── applications/           # Application components
│   │   ├── application-card.tsx
│   │   ├── application-list.tsx
│   │   ├── application-review-form.tsx
│   │   └── application-status-badge.tsx
│   ├── chat/                   # Chat/messaging components
│   │   ├── chat-room-list.tsx
│   │   ├── message-list.tsx
│   │   ├── message-input.tsx
│   │   ├── message-bubble.tsx
│   │   └── chat-header.tsx
│   ├── reviews/                # Review components
│   │   ├── review-form.tsx     # Submit review
│   │   ├── review-card.tsx     # Display review
│   │   ├── review-stats.tsx    # Aggregated stats
│   │   └── review-rating-input.tsx
│   ├── ui/                     # shadcn/ui reusable components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── tabs.tsx
│   │   ├── accordion.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── label.tsx
│   │   ├── toast.tsx
│   │   ├── modal.tsx
│   │   ├── pagination.tsx
│   │   ├── skeleton.tsx
│   │   └── spinner.tsx
│   ├── common/                 # Common utility components
│   │   ├── loading-spinner.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-boundary.tsx
│   │   ├── error-message.tsx
│   │   └── confirm-dialog.tsx
│   └── index.ts               # Export barrel file
│
├── lib/                        # Utility functions & helpers
│   ├── api.ts                 # API client configuration
│   ├── auth.ts                # Authentication helpers
│   ├── supabase.ts            # Supabase client & utilities
│   ├── prisma.ts              # Prisma client singleton
│   ├── validation.ts          # Zod schemas & validators
│   ├── constants.ts           # Application constants
│   ├── types.ts               # Internal type definitions
│   ├── utils.ts               # General utility functions
│   ├── cn.ts                  # Class name utility (Tailwind)
│   ├── date-utils.ts          # Date/time formatting
│   ├── string-utils.ts        # String manipulation
│   ├── file-utils.ts          # File upload/processing
│   ├── error-handler.ts       # Error handling utilities
│   ├── logger.ts              # Logging utility
│   └── cache.ts               # Caching utilities
│
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts            # Authentication hook
│   ├── use-user.ts            # Current user data
│   ├── use-profile.ts         # User profile data
│   ├── use-listings.ts        # Listings query/mutation
│   ├── use-applications.ts    # Applications query/mutation
│   ├── use-chat.ts            # Chat room & messages
│   ├── use-reviews.ts         # Reviews functionality
│   ├── use-pagination.ts      # Pagination state
│   ├── use-search-filters.ts  # Search/filter state
│   ├── use-modal.ts           # Modal state management
│   ├── use-notification.ts    # Toast notifications
│   ├── use-debounce.ts        # Debounce hook
│   ├── use-local-storage.ts   # Local storage hook
│   ├── use-infinite-scroll.ts # Infinite scroll
│   └── use-realtime.ts        # Supabase realtime subscriptions
│
├── public/                     # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   └── placeholders/
│   ├── icons/
│   ├── fonts/
│   └── manifest.json
│
├── styles/                     # Global styles
│   ├── globals.css            # Global Tailwind styles
│   └── animations.css         # Custom animations
│
├── types/                      # TypeScript type definitions
│   └── index.ts              # All types (database + API) - 1000+ lines
│
├── prisma/                     # ORM configuration
│   ├── schema.prisma          # Database schema (Prisma format)
│   └── migrations/            # Database migrations
│
├── tests/                      # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   ├── e2e/                   # End-to-end tests
│   └── setup.ts              # Test configuration
│
├── .env.local.example         # Environment variables example
├── .env.local                 # Environment variables (local, not committed)
├── .env.production            # Production environment variables
│
├── .eslintrc.json            # ESLint configuration
├── .prettierrc.json          # Prettier configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.js            # Next.js configuration
├── jest.config.js            # Jest testing configuration
│
├── package.json              # Dependencies & scripts
├── package-lock.json         # Locked dependency versions
├── pnpm-lock.yaml            # PNPM lock file (if using pnpm)
│
├── README.md                 # Project documentation
├── CONTRIBUTING.md           # Contribution guidelines
├── TECH-CONVENTIONS.md       # This file
├── db-schema.sql             # Original database schema (reference)
│
└── docker-compose.yml        # Docker setup for local development
```

---

## Naming Conventions

### Files & Folders

**Rule: Use `kebab-case` for all file and folder names**

```typescript
// ✅ CORRECT
components/header-nav.tsx
components/profile-edit-form.tsx
utils/date-utils.ts
hooks/use-auth.ts
lib/api-client.ts

// ❌ WRONG
components/HeaderNav.tsx
components/profileEditForm.tsx
utils/dateUtils.ts
hooks/useAuth.ts
lib/apiClient.ts
```

**Special Rules:**
- API routes use folder name as path: `api/auth/register/route.ts` → `/api/auth/register`
- Dynamic routes: `[id]`, `[userId]` (kebab-case inside brackets)
- Dynamic folders: `(dashboard)`, `(auth)` for route groups (parentheses)

### Components

**Rule: Use `PascalCase` for React component names**

```typescript
// ✅ CORRECT
export function HeaderNav() { }
export const ProfileEditForm: React.FC = () => { }
export default function ListingDetail() { }

// Component file names match component names
// profile-edit-form.tsx exports ProfileEditForm

// ❌ WRONG
export function headerNav() { }
export const profile_edit_form = () => { }
```

### Functions

**Rule: Use `camelCase` for function names (including hooks)**

```typescript
// ✅ CORRECT
export function getUserProfile(userId: string) { }
export const fetchListings = async () => { }
export function useAuth() { }
export const formatDate = (date: Date) => { }

// ❌ WRONG
export function GetUserProfile(userId: string) { }
export const Fetch_Listings = async () => { }
export function UseAuth() { }
export const FormatDate = (date: Date) => { }
```

### Variables & Constants

**Rule: Use `camelCase` for variables**

```typescript
// ✅ CORRECT
let currentUser: User;
const isLoading = true;
const userProfiles = [];

// ❌ WRONG
let CurrentUser: User;
const IsLoading = true;
const user_profiles = [];
```

**Rule: Use `SCREAMING_SNAKE_CASE` for constants**

```typescript
// ✅ CORRECT
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_PAGE_SIZE = 20;
const API_TIMEOUT_MS = 30000;
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];
const REGIONS = {
  SEOUL: 'seoul',
  GYEONGGI: 'gyeonggi',
} as const;

// ❌ WRONG
const maxFileSize = 5 * 1024 * 1024;
const defaultPageSize = 20;
const api_timeout_ms = 30000;
```

### Enums

**Rule: Use `PascalCase` for enum names and values**

```typescript
// ✅ CORRECT
enum UserType {
  INDIVIDUAL = 'individual',
  ORGANIZATION = 'organization',
}

enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

// ❌ WRONG
enum userType {
  individual = 'individual',
}
enum skill_level {
  BEGINNER = 'beginner',
}
```

### Database Names

**Rule: Use `snake_case` for all database objects**

```sql
-- ✅ CORRECT
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_type VARCHAR(20),
  created_at TIMESTAMP
);

CREATE TABLE individual_profiles (
  primary_instrument_id UUID
);

-- ❌ WRONG
CREATE TABLE userProfiles (
  id UUID PRIMARY KEY,
  userType VARCHAR(20),
  createdAt TIMESTAMP
);
```

### Class Names (if using classes)

**Rule: Use `PascalCase` for class names**

```typescript
// ✅ CORRECT
class UserRepository { }
class ApiClient { }
class ValidationError extends Error { }

// ❌ WRONG
class user_repository { }
class apiClient { }
```

### URL/Route Names

**Rule: Use `kebab-case` for URL segments**

```typescript
// ✅ CORRECT
/api/user-profiles
/api/individual-profiles/[id]/repertoire
/dashboard/my-listings
/chat/chat-rooms/[id]

// ❌ WRONG
/api/userProfiles
/api/user_profiles
/api/individualProfiles/[id]/Repertoire
/dashboard/myListings
```

---

## Code Style & Quality

### Prettier Configuration

**`.prettierrc.json`**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "bracketSpacing": true,
  "endOfLine": "lf",
  "jsxBracketSameLine": false,
  "jsxSingleQuote": false
}
```

### ESLint Configuration

**`.eslintrc.json`**

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-types": ["warn"],
    "@typescript-eslint/no-explicit-any": ["error"],
    "react/react-in-jsx-scope": "off",
    "react/display-name": "warn",
    "react-hooks/rules-of-hooks": "error",
    "no-console": ["warn", { "allow": ["error", "warn"] }]
  }
}
```

### Editor Config

**`.editorconfig`**

```
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### TypeScript Strict Mode

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./.next",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Code Organization

**Order of imports:**
1. External libraries (React, Next.js, etc.)
2. Types
3. Utils/helpers
4. Components
5. Styles

```typescript
// ✅ CORRECT ORDER
import React from 'react';
import { useRouter } from 'next/navigation';
import type { User, Application } from '@/types';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/date-utils';
import { HeaderNav } from '@/components/layout/header-nav';
import styles from './page.module.css';
```

### Code Comments & Documentation

**JSDoc for functions (required for exported functions):**

```typescript
/**
 * Fetches user profile by ID
 * 
 * @param userId - The UUID of the user to fetch
 * @param options - Optional fetch options
 * @param options.includeStats - Include usage statistics
 * @returns Promise resolving to UserProfile or null if not found
 * @throws {ApiError} If API request fails
 * 
 * @example
 * const user = await getUserProfile('123e4567-e89b-12d3-a456-426614174000');
 */
export async function getUserProfile(
  userId: string,
  options?: { includeStats?: boolean }
): Promise<UserProfile | null> {
  // Implementation
}
```

**Inline comments (use sparingly):**

```typescript
// ✅ GOOD - Explains WHY, not WHAT
// We use Math.floor here because API expects integer, not float
const days = Math.floor(diffInMs / MS_PER_DAY);

// ❌ POOR - Obvious from code
// Set x to 1
const x = 1;
```

### Line Length & Formatting

- **Maximum line length:** 100 characters (configured in Prettier)
- **Long function signatures:**

```typescript
// Break long signatures
export async function searchListings(
  query: SearchListingsRequest,
  pagination: PaginationParams,
  filters: AdvancedSearchQuery,
): Promise<SearchResults<Listing>> {
  // Implementation
}
```

---

## TypeScript Standards

### Type Definitions

**Export all types from `types/index.ts`:**

```typescript
// ✅ CORRECT - In types/index.ts
export interface User {
  id: string;
  email: string;
  user_type: UserType;
  created_at: string;
}

export enum UserType {
  INDIVIDUAL = 'individual',
  ORGANIZATION = 'organization',
}

// In other files, import:
import type { User, UserType } from '@/types';
```

**Never use `any` type:**

```typescript
// ✅ CORRECT
function processData(data: unknown): string {
  if (typeof data === 'string') return data.toUpperCase();
  throw new Error('Invalid data type');
}

function handleError(error: Error | unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ WRONG
function processData(data: any): string { }
function handleError(error: any): void { }
```

### Union & Discriminated Unions

```typescript
// ✅ GOOD - Discriminated union
type ApiResponse<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

type ApplicationResult =
  | { status: 'accepted'; chatRoom: ChatRoom }
  | { status: 'rejected'; reason: RejectionReason };

// ❌ POOR - Just union
type ApiResponse = User | Error | string;
```

### Generics

```typescript
// ✅ CORRECT - Generic utility types
export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  limit: number;
}

export async function fetchPaginated<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<PaginatedResponse<T>> {
  // Implementation
}

// Usage:
const result = await fetchPaginated<Listing>('/api/listings');
```

### Const Assertions

```typescript
// ✅ CORRECT - Type-safe constants
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
type SkillLevel = typeof SKILL_LEVELS[number];

const STATUS_MAP = {
  ACTIVE: 'active',
  PENDING: 'pending',
  CLOSED: 'closed',
} as const;
type Status = typeof STATUS_MAP[keyof typeof STATUS_MAP];
```

### Utility Types

```typescript
// ✅ USE THESE
type Partial<T> = { [K in keyof T]?: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Record<K, T> = { [P in K]: T };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

---

## Component Architecture

### Functional Components (Required)

All components must be functional (not class-based):

```typescript
// ✅ CORRECT
import type { FC } from 'react';

export const ProfileCard: FC<{ userId: string }> = ({ userId }) => {
  return <div>Profile</div>;
};

// Alternative
export function ProfileCard({ userId }: { userId: string }) {
  return <div>Profile</div>;
}
```

### Component Prop Types

```typescript
// ✅ CORRECT - Define props interface
interface ProfileCardProps {
  /** User ID to display */
  userId: string;
  /** Optional callback on click */
  onClick?: (userId: string) => void;
  /** Additional CSS class */
  className?: string;
}

export function ProfileCard({
  userId,
  onClick,
  className,
}: ProfileCardProps) {
  return (
    <div className={className} onClick={() => onClick?.(userId)}>
      {userId}
    </div>
  );
}
```

### Server vs Client Components

```typescript
// app/dashboard/page.tsx - SERVER COMPONENT (default)
import { ListingsGrid } from '@/components/listings/listings-grid';

export default async function DashboardPage() {
  const listings = await db.listings.findMany(); // Database access OK
  return <ListingsGrid initialListings={listings} />;
}

// components/listings/listings-grid.tsx - CLIENT COMPONENT
'use client';

import { useState } from 'react';
import type { Listing } from '@/types';

interface ListingsGridProps {
  initialListings: Listing[];
}

export function ListingsGrid({ initialListings }: ListingsGridProps) {
  const [listings] = useState(initialListings);
  return <div>{listings.map(l => <div key={l.id}>{l.title}</div>)}</div>;
}
```

### Component Organization

```typescript
// ✅ CORRECT STRUCTURE
'use client';

import { useCallback } from 'react';
import type { User } from '@/types';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import styles from './profile-card.module.css';

interface ProfileCardProps {
  user: User;
  onEdit?: (userId: string) => void;
  className?: string;
}

/**
 * Displays user profile in card format
 */
export function ProfileCard({
  user,
  onEdit,
  className,
}: ProfileCardProps) {
  const handleClick = useCallback(() => {
    onEdit?.(user.id);
  }, [user.id, onEdit]);

  return (
    <div className={cn(styles.card, className)}>
      <h2>{user.email}</h2>
      <Button onClick={handleClick}>Edit</Button>
    </div>
  );
}
```

---

## API & Data Fetching

### API Client Setup

**`lib/api.ts`**

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * Centralized API request handler with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_TIMEOUT,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.message || `HTTP ${response.status}`,
        response.status,
        error,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      500,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### API Routes (Backend)

```typescript
// app/api/listings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@/lib/auth';

/**
 * GET /api/listings - Search/list listings
 * Query params: page, limit, region_id, listing_type, skill_level
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const listings = await prisma.listings.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    const total = await prisma.listings.count();

    return NextResponse.json({
      listings,
      total_count: total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/listings - Create new listing
 * Body: CreateListingRequest
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const data = await request.json();
    const listing = await prisma.listings.create({
      data: {
        ...data,
        created_by_user_id: user.id,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 },
    );
  }
}
```

### Data Fetching in Components

```typescript
// ✅ CORRECT - Using TanStack Query (recommended)
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Listing } from '@/types';

export function ListingsPage() {
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['listings'],
    queryFn: () => apiRequest<Listing[]>('/api/listings'),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {listings?.map((listing) => (
        <div key={listing.id}>{listing.title}</div>
      ))}
    </div>
  );
}

// ✅ ACCEPTABLE - Fetch directly in Server Component
// app/listings/page.tsx
export default async function ListingsPage() {
  const listings = await fetch('http://localhost:3000/api/listings')
    .then((r) => r.json())
    .catch((e) => {
      console.error(e);
      return [];
    });

  return (
    <div>
      {listings.map((listing) => (
        <div key={listing.id}>{listing.title}</div>
      ))}
    </div>
  );
}
```

---

## Environment Variables

### `.env.local.example` - Local Development

```bash
# ============================================================================
# NEXT.JS CONFIGURATION
# ============================================================================
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================
# Get these from Supabase dashboard: Settings > API

# Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase anonymous API key (safe to expose to client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase service role key (NEVER expose to client - server only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# AUTHENTICATION & OAUTH
# ============================================================================

# Kakao OAuth (for future implementation)
NEXT_PUBLIC_KAKAO_CLIENT_ID=1234567890abcdefghij

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ============================================================================
# DATABASE
# ============================================================================

# Prisma database URL (can be same as Supabase)
DATABASE_URL=postgresql://postgres:password@localhost:5432/tutti

# ============================================================================
# STORAGE
# ============================================================================

# Supabase Storage bucket for profile photos
NEXT_PUBLIC_STORAGE_BUCKET=profiles

# Supabase Storage bucket for organization logos
NEXT_PUBLIC_STORAGE_BUCKET_LOGOS=logos

# ============================================================================
# REDIS (Optional - for caching/sessions)
# ============================================================================

REDIS_URL=redis://localhost:6379

# ============================================================================
# LOGGING & MONITORING
# ============================================================================

# Enable debug logging
DEBUG=true

# Sentry error tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=

# ============================================================================
# EMAIL (Optional - for notifications)
# ============================================================================

# SendGrid API key
SENDGRID_API_KEY=

# Email sender address
EMAIL_FROM=noreply@tutti.com

# ============================================================================
# EXTERNAL SERVICES
# ============================================================================

# Kakao Maps API key (for region selection)
NEXT_PUBLIC_KAKAO_MAPS_API_KEY=

# File upload limits (in bytes)
MAX_FILE_SIZE=5242880  # 5MB
MAX_FILE_SIZE_VIDEO=104857600  # 100MB

# ============================================================================
# RATE LIMITING
# ============================================================================

RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
```

### Environment Variables by Environment

```bash
# .env.development (local)
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
DEBUG=true

# .env.staging
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://staging-api.tutti.com
DEBUG=false

# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.tutti.com
DEBUG=false
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Accessing Environment Variables

```typescript
// ✅ CORRECT - Use process.env with type checking
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

// In server-only code (can access non-public vars)
const dbUrl = process.env.DATABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ✅ RECOMMENDED - Create a config file
// lib/config.ts
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  db: {
    url: process.env.DATABASE_URL || '',
  },
  isProduction: process.env.NODE_ENV === 'production',
} as const;
```

---

## Git Workflow

### Commit Message Format

Follow conventional commits: `type(scope): subject`

```bash
# ✅ CORRECT FORMATS

# Feature
git commit -m "feat(auth): implement login with email"
git commit -m "feat(listings): add search filters"
git commit -m "feat(profile): add repertoire management"

# Bug fix
git commit -m "fix(chat): fix message ordering in real-time"
git commit -m "fix(api): handle 401 errors properly"
git commit -m "fix(ui): fix button hover state on mobile"

# Documentation
git commit -m "docs(readme): update setup instructions"
git commit -m "docs(api): add endpoint documentation"

# Refactoring
git commit -m "refactor(api): simplify error handling"
git commit -m "refactor(components): extract common logic"

# Tests
git commit -m "test(auth): add login unit tests"
git commit -m "test(integration): add api endpoint tests"

# Performance
git commit -m "perf(listings): optimize search query"
git commit -m "perf(components): memoize expensive renders"

# Style/Formatting
git commit -m "style: run prettier on codebase"
git commit -m "style: fix eslint warnings"

# Dependencies
git commit -m "chore(deps): upgrade react to 19.0"
git commit -m "chore(deps): add react-query"

# ❌ WRONG FORMATS
git commit -m "Update code"
git commit -m "Fixed stuff"
git commit -m "auth: fix"
git commit -m "BREAKING CHANGE: removed feature X"
```

### Commit Message Details

```
feat(listings): implement advanced search filters

- Add region filter
- Add skill level filter
- Add instrument filter
- Add genre tags filter
- Implement search result pagination
- Add empty state message

Closes #123
```

### Branch Strategy

```
main                    # Production releases (protected)
  ├── develop          # Development integration branch
  │   ├── feature/auth-login
  │   ├── feature/profile-management
  │   ├── feature/listings-create
  │   ├── bugfix/chat-ordering
  │   └── hotfix/urgent-issue
  │
  └── release/v1.1.0   # Release candidates
```

### Branch Naming

```bash
# Features
git checkout -b feature/auth-login
git checkout -b feature/profile-management
git checkout -b feature/listings-search

# Bug fixes
git checkout -b bugfix/chat-ordering
git checkout -b bugfix/form-validation

# Hotfixes (from main)
git checkout -b hotfix/critical-bug

# Refactoring
git checkout -b refactor/api-client

# Documentation
git checkout -b docs/api-guide
```

### Pull Request Process

1. **Create branch from `develop`**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub
   ```

4. **PR Title Format**
   ```
   ✨ feat(auth): implement social login
   🐛 fix(chat): fix message ordering
   📚 docs(readme): update setup guide
   ♻️  refactor(api): simplify error handling
   ✅ test(auth): add login tests
   ```

5. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Related Issue
   Closes #123

   ## Type of Change
   - [ ] Feature
   - [ ] Bug Fix
   - [ ] Documentation
   - [ ] Refactoring

   ## Testing
   How to test these changes

   ## Checklist
   - [ ] Code follows style guide
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

### Merge Strategy

- Use **Squash & Merge** for feature branches (keeps history clean)
- Use **Merge Commit** only when merging `develop` to `main`
- Delete branch after merge

---

## Database & ORM

### Prisma Schema Structure

**`prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models mirror types/index.ts structure
model UserProfile {
  id        String   @id @default(uuid())
  user_type String   @db.Enum('individual', 'organization')
  email     String   @unique @db.Varchar(255)
  
  // Relations
  individual_profile  IndividualProfile?
  organization_profile OrganizationProfile?
  
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}

model IndividualProfile {
  id                    String  @id @default(uuid())
  user_id               String  @unique
  user_profile          UserProfile @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  nickname              String  @unique @db.Varchar(100)
  primary_instrument_id String
  skill_level           String  @db.Enum('beginner', 'elementary', 'intermediate', 'advanced', 'professional')
  region_id             String
  region                Region  @relation(fields: [region_id], references: [id])
  
  manner_temperature    Float   @default(36.5)
  
  repertoires           Repertoire[]
  
  @@index([user_id])
  @@index([region_id])
  @@index([skill_level])
}

// ... more models
```

### Prisma Usage in API Routes

```typescript
// lib/prisma.ts - Singleton for PrismaClient
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Usage in API route
import { prisma } from '@/lib/prisma';

export async function GET() {
  const listings = await prisma.listings.findMany({
    where: { status: 'active' },
    include: { region: true },
    orderBy: { created_at: 'desc' },
    take: 20,
  });

  return NextResponse.json(listings);
}
```

### Database Migrations

```bash
# Create migration after schema changes
npx prisma migrate dev --name add_user_profiles

# Apply pending migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed

# View database with Prisma Studio
npx prisma studio
```

---

## Authentication & Authorization

### Supabase Auth Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Server-side Supabase client (with service key)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
```

### Auth Hook

```typescript
// hooks/use-auth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('user_profiles')
            .select()
            .eq('id', session.user.id)
            .single();
          setUser(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Auth check failed'));
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, error, login, logout };
}
```

### Protected Routes

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get('supabase-auth-token')?.value;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

---

## Error Handling

### Error Types

```typescript
// lib/error-handler.ts

/**
 * Custom error classes for different scenarios
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

### Error Response Format

```typescript
// app/api/listings/route.ts

export async function POST(request: NextRequest) {
  try {
    // Validation
    const data = await request.json();
    if (!data.title) {
      return NextResponse.json(
        {
          error_code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          errors: [{ field: 'title', message: 'Title is required' }],
        },
        { status: 400 },
      );
    }

    // Create listing
    const listing = await prisma.listings.create({ data });
    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      {
        error_code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create listing',
      },
      { status: 500 },
    );
  }
}
```

### Client-Side Error Handling

```typescript
// ✅ CORRECT

try {
  const data = await apiRequest('/api/listings', {
    method: 'POST',
    body: listingData,
  });
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Redirect to login
      router.push('/login');
    } else if (error.status === 400) {
      // Show validation errors
      showToast('Validation error', 'error');
    } else {
      // Show generic error
      showToast(error.message, 'error');
    }
  } else {
    showToast('Unknown error occurred', 'error');
  }
}
```

---

## Testing Strategy

### Test Structure

```
tests/
├── unit/
│   ├── lib/
│   │   ├── date-utils.test.ts
│   │   ├── validation.test.ts
│   │   └── string-utils.test.ts
│   └── hooks/
│       └── use-auth.test.ts
├── integration/
│   ├── api/
│   │   ├── listings.test.ts
│   │   ├── auth.test.ts
│   │   └── applications.test.ts
│   └── components/
│       └── login-form.test.ts
└── setup.ts
```

### Jest Configuration

**`jest.config.js`**

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

module.exports = createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
});
```

### Example Unit Test

```typescript
// lib/date-utils.ts
export function formatDate(date: Date, locale: string = 'en'): string {
  return date.toLocaleDateString(locale);
}

// tests/unit/lib/date-utils.test.ts
import { formatDate } from '@/lib/date-utils';

describe('formatDate', () => {
  it('formats date with default locale', () => {
    const date = new Date('2026-02-14');
    const result = formatDate(date);
    expect(result).toBe('2/14/2026');
  });

  it('formats date with korean locale', () => {
    const date = new Date('2026-02-14');
    const result = formatDate(date, 'ko');
    expect(result).toContain('2026');
    expect(result).toContain('2');
    expect(result).toContain('14');
  });

  it('throws error for invalid date', () => {
    const invalidDate = new Date('invalid');
    expect(() => {
      formatDate(invalidDate);
    }).not.toThrow(); // toLocaleDateString doesn't throw
  });
});
```

### Example Component Test

```typescript
// components/profile-card.tsx
export function ProfileCard({ user, onEdit }: ProfileCardProps) {
  return (
    <div data-testid="profile-card">
      <h2>{user.email}</h2>
      <button onClick={() => onEdit?.(user.id)}>Edit</button>
    </div>
  );
}

// tests/integration/components/profile-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileCard } from '@/components/profile-card';
import type { User } from '@/types';

describe('ProfileCard', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    user_type: 'individual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('renders user email', () => {
    render(<ProfileCard user={mockUser} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when button clicked', () => {
    const mockEdit = jest.fn();
    render(<ProfileCard user={mockUser} onEdit={mockEdit} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(mockEdit).toHaveBeenCalledWith('123');
  });
});
```

---

## Performance & Optimization

### Image Optimization

```typescript
// ✅ CORRECT - Use Next.js Image component
import Image from 'next/image';

export function ProfilePhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={200}
      priority={false}
      quality={80}
    />
  );
}

// ❌ WRONG - Plain <img> tag
export function ProfilePhoto({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} />;
}
```

### Code Splitting

```typescript
// ✅ CORRECT - Dynamic import for large components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Disable SSR if needed
});

export function Dashboard() {
  return (
    <div>
      <HeavyChart />
    </div>
  );
}
```

### Memoization

```typescript
// ✅ USE memo() for expensive renders
import { memo, useMemo, useCallback } from 'react';

interface ListItemProps {
  item: Listing;
  onClick: (id: string) => void;
}

export const ListItem = memo(function ListItem({
  item,
  onClick,
}: ListItemProps) {
  return (
    <div onClick={() => onClick(item.id)}>
      {item.title}
    </div>
  );
});

// ✅ USE useMemo() for expensive calculations
export function ListingsList({ listings }: { listings: Listing[] }) {
  const sortedListings = useMemo(
    () => [...listings].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [listings],
  );

  return (
    <div>
      {sortedListings.map((listing) => (
        <ListItem key={listing.id} item={listing} />
      ))}
    </div>
  );
}

// ✅ USE useCallback() for stable function references
export function SearchForm() {
  const handleSearch = useCallback((query: string) => {
    // Expensive search operation
    console.log('Searching:', query);
  }, []);

  return <SearchInput onSearch={handleSearch} />;
}
```

### Database Query Optimization

```typescript
// ✅ GOOD - Select only needed fields
const listings = await prisma.listings.findMany({
  select: {
    id: true,
    title: true,
    description: true,
    region: { select: { name: true } },
  },
  where: { status: 'active' },
});

// ❌ POOR - Fetch entire objects when not needed
const listings = await prisma.listings.findMany({
  include: { region: true, user: true, applications: true },
});
```

### Pagination

```typescript
// Always paginate large datasets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

  const listings = await prisma.listings.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.listings.count();

  return NextResponse.json({
    listings,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  });
}
```

---

## Deployment

### Environment Setup for Production

1. **Set environment variables on hosting (Vercel/Railway/etc)**
   - All from `.env.local.example`
   - `NEXT_PUBLIC_API_URL` → production domain
   - Remove `DEBUG=true`

2. **Database migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Build verification**
   ```bash
   npm run build
   npm run lint
   npm run test
   ```

### Vercel Deployment

**`vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "DATABASE_URL": "@database_url",
    "SUPABASE_SERVICE_ROLE_KEY": "@service_role_key"
  }
}
```

### GitHub Actions CI/CD

**`.github/workflows/deploy.yml`**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run tests
        run: npm run test

      - name: Run lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server on :3000
npm run lint            # Run ESLint
npm run format          # Run Prettier
npm run type-check      # Run TypeScript compiler
npm run test            # Run Jest tests
npm run test:watch      # Run tests in watch mode

# Database
npx prisma migrate dev  # Create and apply migration
npx prisma generate    # Generate Prisma Client
npx prisma studio     # Open Prisma Studio UI
npx prisma db seed    # Seed database

# Build & Deploy
npm run build          # Build for production
npm run start          # Start production server
npm run export         # Static export (if needed)
```

### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

## Summary

TUTTI is built with modern, type-safe technologies prioritizing:

1. **Type Safety**: Strict TypeScript, detailed type definitions
2. **Code Quality**: ESLint, Prettier, comprehensive tests
3. **Developer Experience**: Clear conventions, good documentation
4. **Performance**: Image optimization, code splitting, memoization
5. **Maintainability**: Organized folder structure, consistent naming

Follow these conventions to ensure code quality, consistency, and smooth collaboration with the team.

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-14  
**Maintainers:** TUTTI Development Team
