# Climb AI - Frontend Ecosystem

An intelligent, AI-driven learning and performance management platform designed to connect teams with expert-led training.

![Climb AI Overview](https://via.placeholder.com/1200x400?text=Climb+AI+Frontend) <!-- Replace with actual screenshot -->

---

## 📑 Table of Contents
1. [Overview](#overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation & Setup](#installation--setup)
6. [Authentication Flow](#authentication-flow)
7. [Theming & Styling Guidelines](#theming--styling-guidelines)
8. [Data Fetching & API Services](#data-fetching--api-services)
9. [Developer Workflows](#developer-workflows)

---

## 🎯 Overview
Climb AI's frontend is a modern, highly responsive web application that serves as the primary interface for both learners and administrators. It provides dynamic learning paths, real-time performance tracking via AI analysis, and a premium "Expert AI" aesthetic that prioritizes visual excellence and ease of use.

The application leverages Next.js 16 App Router for optimized rending (mixing Server and Client components) alongside a real-time Feathers.js WebSocket connection to the backend.

---

## 🛠 Tech Stack & Architecture

### Core Technologies
- **Framework:** [Next.js 16.2.3](https://nextjs.org/) (App Router paradigm)
- **Language:** [TypeScript](https://www.typescriptlang.org/) for strict type safety
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) combined with standard CSS variables (`globals.css`)
- **Component Library:** [shadcn/ui](https://ui.shadcn.com/) coupled with [Radix UI primitives](https://www.radix-ui.com/) for accessible, unstyled foundational components.

### Client / Server Communication
- **API Client:** [Feathers.js Client v5](https://feathersjs.com/) configured with Socket.io for bi-directional, real-time communication.
- **Data Fetching:** Axios for standard REST calls, native Next.js `fetch` for server-side operations.

### UI & UX Enhancements
- **Icons:** `lucide-react`
- **Animations:** `tw-animate-css` for declarative utility-class animations
- **Drag & Drop:** `@dnd-kit/core` for interactive list sorting and module management.
- **Notifications:** `sonner` for application-wide, consistent toast alerts.
- **Markdown Rendering:** `react-markdown` + `remark-gfm` + `@tailwindcss/typography` to safely render rich AI-generated text and lesson content.

---

## ✨ Features

- **Premium Landing Interface:** An immersive public gateway featuring a fixed video background, dynamic interactive cards, and high-contrast light mode UI that immediately communicates an "Expert AI" value proposition.
- **Role-Based Dashboards:** A comprehensive learning ecosystem with tailored views for Users (learners), Admins, and Companies. Features a scalable, collapsible Sidebar (`AppSidebar`) with active route tracking.
- **Real-Time AI Interfaces:** Specialized chat and analysis interfaces for interacting with AI models (GPT-4) natively, providing typewriter-style streaming responses.
- **Robust Authentication:** Secure JWT-based authentication flow seamlessly integrated with Next.js specific routing guards.
- **Bento-Grid Layouts:** Modern, card-based data visualization for pricing tiers and feature breakdowns.

---

## 📁 Project Structure

```text
front/
├── src/
│   ├── app/                  # Next.js 16 App Router root
│   │   ├── (dashboard)/      # Protected route group (requires auth)
│   │   │   ├── admin/        # System administrator routes
│   │   │   ├── company/      # B2B management routes
│   │   │   └── user/         # Individual learner routes
│   │   ├── login/            # Public authentication screen
│   │   ├── page.tsx          # Public Landing Page entry point
│   │   └── globals.css       # Global design tokens and Tailwind injections
│   ├── components/           # Reusable React components
│   │   ├── ui/               # Base shadcn/ui components (buttons, inputs, etc.)
│   │   ├── login-form.tsx    # Authentication component
│   │   └── app-sidebar.tsx   # Global navigation sidebar mapping
│   ├── lib/                  # Core logic and configuration
│   │   ├── feathers.ts       # Socket.io Feathers client instantiation
│   │   ├── auth-context.tsx  # React Context for global auth state
│   │   └── server-api.ts     # Server-side API helpers for Next.js
│   └── hooks/                # Custom React hooks for data management
├── public/                   # Static assets (images, videos, logos)
├── next.config.ts            # Next.js configuration and Turbopack settings
├── tailwind.config.ts        # Tailwind utility class definitions
└── package.json              # Dependency management
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- `npm` or `pnpm`
- A running instance of the [Climb AI backend application](/../back) configured to accept Socket.io connections on port 3030.

### Installation & Setup

1. **Clone and install dependencies:**
```bash
# Navigate to the frontend directory
cd front

# Install standard dependencies
npm install
```

2. **Environment Configuration:**
Ensure your local backend is running (typically `http://localhost:3030`). If a `.env.local` file is required for override URL variables, ensure it maps `NEXT_PUBLIC_API_URL`. Currently, it defaults to the local backend port.

3. **Start the Development Server:**
```bash
npm run dev
```

The application will be running on `http://localhost:3000`.

### Build & Production
To compile Turbopack and build the application for a production environment:

```bash
npm run build
npm run start
```

---

## 🔐 Authentication Flow

1. **Login Action:** The user submits credentials via the `/login` route.
2. **Feathers Negotiation:** The `login-form.tsx` dispatches a request via the Feathers client (`client.authenticate()`).
3. **Token Storage:** Upon success, Feathers automatically handles storing the JWT in local storage (or a cookie for SSR).
4. **Context Update:** The `AuthProvider` (`lib/auth-context.tsx`) updates the global state, mapping the `user` object to the application layer.
5. **Route Guarding:** The `AuthGuard` component explicitly wraps layouts. If an unauthenticated user attempts to access `/(dashboard)/*`, they are redirected safely to `/login`.

---

## 🎨 Theming & Styling Guidelines

### CSS Architecture
We rely on `oklch` syntax natively supported by Tailwind v4 for rich, predictable color spaces. 
The primary accent color for the brand is an energetic orange (`#eb6e4b`), frequently used for primary buttons and hover states.

### Forced Light Mode Concept
The project globally supports Dark Mode defined in `globals.css` with `@custom-variant dark (&:is(.dark *));`. 

However, public-facing conversion pages (like the Landing Page `/` and Login page `/login`) **must** render in Light Mode to preserve brand integrity. 
To achieve this without breaking shadcn/ui components:
- We utilize a `useEffect` hook in these specific route files to explicitly strip the `.dark` class from the `document.documentElement` (`<html>`) upon mount.
- Upon unmount (navigating back to the dashboard), the `dark` class is conditionally restored, returning the application to the user's preferred theme.

### Component Design (shadcn/ui)
When generating or modifying UI components, prioritize clean, borderless layouts where possible. Rely on subtle shadows, generous padding (`p-6` to `p-10`), and background opacity tints to handle visual hierarchy rather than harsh borders.

---

## 🔌 Data Fetching & API Services

### Feathers.js Hooks
The project primarily communicates with the backend via Feathers.js Services over WebSockets.
Use the configured singleton instance from `@/lib/feathers`.

**Example:**
```typescript
import { client } from "@/lib/feathers";

// Fetching lessons for a specific module
const fetchLessons = async () => {
    const response = await client.service("lessons").find({
        query: { trainingId: currentTraining, $sort: { order: 1 } }
    });
    return response.data;
};
```

---

## 🛠 Developer Workflows

- **Modifying Navigation:** When adding new menus to the `AppSidebar`, ensure the configuration in `navItems` uses the `exact: true` property for parent dashboard paths. This prevents simultaneous highlight collisions when a user navigates deeper into a sub-route (e.g., highlighting both `/dashboard` and `/dashboard/settings`).
- **Alerts & Notifications:** Avoid using window `.alert()` or `console.error()` for user-facing errors. Globally import `toast` from `sonner` (`import { toast } from 'sonner'`) to trigger `toast.success()` and `toast.error()` notifications.
- **Turbopack Caching:** If you experience fatal `Turbopack` panics when switching between heavily modified branches (like `dilshod` -> `master`), stop the dev server, run `rmdir /s /q .next` to purge the build cache, and restart the environment.
