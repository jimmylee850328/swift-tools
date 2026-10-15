# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swift Tools is a Next.js 15 web application providing utility tools for developers. The application is a collection of standalone tools, each implemented as a separate page under `/tools/*`. The project uses React 19, TypeScript, and Tailwind CSS v4 with a modern client-side architecture.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

The dev server runs on `http://localhost:3000` by default.

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout with Geist fonts
│   ├── page.tsx          # Home page with tool cards
│   ├── globals.css       # Global Tailwind CSS and theme variables
│   └── tools/
│       ├── jwt-decoder/      # JWT decoding tool
│       ├── string-converter/ # String array converter
│       ├── array-merger/     # Array merging tool
│       ├── array-diff/       # Array difference comparison
│       └── url-processor/    # URL parameter extraction
```

### Application Pattern

**Tool Page Pattern**: Each tool follows a consistent structure:
- Client-side component (`"use client"`)
- Monaco Editor integration for code input/output
- Real-time processing with `useEffect` hooks
- Back navigation with `ArrowLeft` icon from lucide-react
- Error handling and user feedback states
- Copy-to-clipboard and download functionality

**Home Page Pattern**: The home page (`src/app/page.tsx`) acts as a tool directory:
- Grid layout of `ToolCard` components (3 columns on large screens)
- Each card links to a tool under `/tools/*`
- Uses lucide-react icons for visual identification
- Bilingual content (Chinese descriptions, English code)

**Styling Pattern**:
- Tailwind CSS v4 with `@theme inline` directive in `globals.css`
- Dark mode support via `prefers-color-scheme`
- Cyan accent color for interactive elements (`cyan-400`/`cyan-500`)
- Consistent hover states and transitions
- Custom CSS variables defined in `:root` for theming

### Key Dependencies

- **@monaco-editor/react**: Code editor component for input/output interfaces
- **lucide-react**: Icon library for UI elements
- **next**: v15.2.1 with App Router
- **react**: v19 (latest)
- **tailwindcss**: v4 with PostCSS integration

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Target: ES2017
- Module resolution: bundler

## Adding New Tools

When creating a new tool:

1. Create directory: `src/app/tools/[tool-name]/`
2. Add `page.tsx` with client component
3. Follow the established tool pattern:
   - Import Monaco Editor and lucide-react icons
   - Implement state management with useState
   - Add real-time processing with useEffect
   - Include error handling and user feedback
   - Provide ArrowLeft navigation back to home
4. Update home page (`src/app/page.tsx`):
   - Add new `ToolCard` component
   - Import appropriate icon from lucide-react
   - Use consistent card styling
5. Update layout metadata in `layout.tsx` if needed

## Code Conventions

- **Component Style**: Functional components with hooks, no class components
- **Type Safety**: Define interfaces for complex data structures (e.g., `JWTHeader`, `JWTPayload`)
- **Client-Side Focus**: All tool pages are client components for interactivity
- **Bilingual**: Chinese UI text, English code and comments
- **Accessibility**: Include ARIA labels, keyboard navigation support, and semantic HTML
- **No Server Components in Tools**: Tools require client-side interactivity, use `"use client"` directive

## Styling Guidelines

- Use Tailwind utility classes, avoid custom CSS except in `globals.css`
- Dark mode classes: `dark:` prefix for all color/background utilities
- Responsive breakpoints: `md:` (768px), `lg:` (1024px)
- Consistent spacing: `gap-6` for grids, `p-6` for cards, `mb-8` for sections
- Color palette: Gray scale with cyan accents, following existing theme

## Browser Support

Modern browsers with ES2017+ support. No IE11 compatibility required.
