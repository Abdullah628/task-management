<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AGENT_GUIDELINES.md - Next.js Pro Implementation Rules

## Mindset First (Before Writing Code)

- Always analyze the requirement first.
- Choose the simplest scalable approach.
- Avoid premature optimization, but design for growth.
- Prefer built-in Next.js features over custom solutions.
- Keep code readable over clever.

## Architecture Rules

- Use App Router (`/app`) by default unless legacy migration requires otherwise.
- Follow a feature-based structure, not type-based organization.
- Separate concerns clearly:
	- UI in `components`
	- logic in `hooks` and `services`
	- shared contracts in `types`

Example layout:

```text
/app
	/feature-name
		/components
		/hooks
		/services
		/types
		page.tsx
```

## Rendering Strategy (Decide Before Coding)

- Use SSR when SEO is important or data changes frequently.
- Use SSG when data changes rarely, such as marketing pages.
- Use ISR for mostly static pages that still need periodic refresh.
- Use CSR for highly interactive or user-specific views.
- Default to Server Components.
- Only use `"use client"` when browser APIs, event handlers, or client-only hooks are required.

## Data Fetching Rules

- Prefer server-side fetching whenever possible.
- Choose cache strategy intentionally per route:
	- `force-cache` for static content
	- `no-store` for always-fresh content
- Avoid duplicate fetching of the same data.
- Avoid deep nested fetches that can be lifted to parent server components.

Example:

```ts
const data = await fetch(url, { cache: "no-store" });
```

## Component Design

- Keep components small, reusable, and focused.
- Split smart components (data and orchestration) from dumb components (presentation).
- Avoid monolithic components larger than roughly 300 lines unless unavoidable.

## Performance Rules

- Use dynamic imports for heavy or rarely needed UI.
- Minimize unnecessary re-renders.
- Use `React.memo`, `useMemo`, and `useCallback` only where measurable benefit exists.
- Prefer streaming and partial rendering with server components where applicable.

Example:

```ts
const HeavyComponent = dynamic(() => import("./HeavyComponent"));
```

## Image Optimization

- Always use `next/image` for images unless a specific limitation forces otherwise.
- Provide explicit `width`, `height`, and meaningful `alt` text.
- Use `priority` for above-the-fold images.
- Use placeholders (`placeholder="blur"`) when it improves perceived load.

## SEO Optimization

- Use built-in `metadata` exports per route.
- Provide meaningful page titles and descriptions.
- Maintain semantic heading hierarchy (`h1` to `h2` to `h3`).
- Include Open Graph and Twitter metadata for shareable pages.
- Ensure sitemap and robots configuration remain accurate.

Example:

```ts
export const metadata = {
	title: "Page Title",
	description: "Description",
};
```

## Security Rules

- Never expose secrets in client code.
- Store secrets in environment files such as `.env.local`.
- Validate and sanitize user input at API boundaries.
- Enforce authorization checks on server actions and API routes.

## State Management

- Server state: fetch on the server first.
- Local UI state: `useState` by default.
- Global state: introduce only when justified.
- Prefer Zustand for app-level client state when needed.
- Use Context for lightweight cross-tree concerns.
- Avoid Redux for simple requirements.

## API Design

- Use route handlers in `/app/api`.
- Keep handlers thin and delegate business logic to services.
- Keep validation, data access, and transformation outside transport layer code.

## Testing (Recommended)

- Unit test core business logic and utilities.
- Use React Testing Library for component behavior.
- Use Jest or Vitest based on project tooling and speed needs.

## Code Quality

- Keep ESLint enabled and fix actionable warnings.
- Keep formatting consistent with Prettier.
- Use clear names and maintain predictable folder structure.
- Prefer strict TypeScript types over `any`.

## Common Mistakes to Avoid

- Overusing `"use client"`.
- Fetching on the client when server fetching is viable.
- Building large monolithic components.
- Ignoring route-level cache strategy.
- Skipping `next/image` and metadata.
- Missing SEO and accessibility basics.

## Decision Checklist (Before Coding)

- Is this a server component or client component?
- Which rendering strategy fits best: SSR, SSG, ISR, or CSR?
- Can existing components or services be reused?
- Is this optimized for SEO, performance, and accessibility?
- Am I using Next.js native features before custom code?

## Final Rule

- If Next.js provides a native approach, prefer it over custom hacks.
<!-- END:nextjs-agent-rules -->
