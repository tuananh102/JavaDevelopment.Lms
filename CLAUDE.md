# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a monorepo for an LMS (Learning Management System) with two independently deployed apps:

- `backend/` — Spring Boot 4.1 / Java 25 REST API (Maven). Deployed as a JAR to Azure Web App `hcmute-lms`.
- `frontend/` — React 19 + Vite SPA (TypeScript). Deployed to GitHub Pages.
- `docker-compose.yml` — PostgreSQL 18 for local backend development.

The only apps are `backend/` and `frontend/`. (A leftover Google AI Studio / Gemini Vite scaffold that used to sit at the repo root — `package.json`, `vite.config.ts`, `tsconfig.json`, `metadata.json`, `assets/` — has been removed.)

> Note: `README.md` is partly stale — it says the frontend lives in `/src` and runs from the repo root. The actual working frontend is in `frontend/`. Trust this file and the code over the README on directory layout.

## Commands

### Frontend (`cd frontend`)
- `npm run dev` — starts an **Express server** (`server.ts`) on port 3000 via `tsx`. This server both serves the Vite app (middleware mode) AND provides a **mock `/api/v1/*` API** (see `server.ts`), so the frontend runs standalone without the backend.
- `npm run build` — `vite build` + bundles `server.ts` to `dist/server.cjs` with esbuild.
- `npm run lint` — `tsc --noEmit` (type-check only; this is the only "test" gate).
- `npm run preview` / `npm start` — run the production `dist/server.cjs`.

### Backend (`cd backend`)
- `docker-compose up -d` (from repo root) — start PostgreSQL first (`localhost:5432`, db `lms_db`, user `lms_user` / `lms_password`).
- `mvn spring-boot:run` — run the API on `http://localhost:8080`. Flyway auto-applies `src/main/resources/db/migration/V*.sql` on startup.
- `mvn clean install` — full build (this is what CI runs).
- `mvn test` — run tests; `mvn test -Dtest=ClassName#method` for a single test. (No test classes exist yet.)
- Swagger UI: `http://localhost:8080/swagger-ui.html`.

Seed accounts (from `V2__seed_data.sql`), password is `password` for all: `admin@lms.com`, `instructor@lms.com`, `student@lms.com`.

## Backend architecture

- **Feature-based packages** under `com.lms.*` (`auth`, `course`, `enrollment`, `progress`, `user`, `security`, `common`) — NOT layered by `controller`/`service`/`repository`. When adding a feature, create a new package and keep its controller, service, entities, repository, and `dto/` together.
- **Stateless JWT security** (`security/`): `AuthTokenFilter` validates the `Authorization: Bearer` header on each request; `WebSecurityConfig` permits `/api/v1/auth/**`, `/api/v1/courses/**`, and Swagger paths, and requires auth for everything else. `SessionCreationPolicy.STATELESS`.
- **Authorization is two-layered**: coarse method security via `@PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")` on controllers, plus **explicit ownership checks in the service layer** (e.g. `CourseService.updateCourseStatus` verifies the instructor owns the course). Follow this pattern — don't rely on `@PreAuthorize` alone for resource ownership.
- Controllers inject the authenticated user via `@AuthenticationPrincipal UserDetailsImpl userDetails` and call `userDetails.getId()`. Never trust an ID from the request body for the current user.
- **DTO mapping is currently hand-written** in services (see `CourseService.mapToDto`/`mapToDetailDto`), even though MapStruct + Lombok are on the classpath. Match the surrounding style.
- Entities use `UUID` primary keys. `ddl-auto: validate` — schema changes go through a **new Flyway migration file**, never by editing entities alone or changing an already-applied `V*.sql`.
- Errors: services throw `IllegalArgumentException`; `common/exception/GlobalExceptionHandler` translates exceptions to HTTP responses.

## Frontend architecture

- **Entry** `src/main.tsx`: wraps `App` in `QueryClientProvider` (TanStack Query) + **`HashRouter`** (React Router v8). HashRouter is deliberate — it makes the SPA work on GitHub Pages without server rewrites. Keep it.
- **Routing** in `src/App.tsx`: public `/login` `/register`; `MainLayout`-wrapped `/`, `/courses/:slug`, `/dashboard`, `/instructor`, `/instructor/course/:id`; standalone `/learn/:courseId/lesson/:lessonId`.
- **API client** `src/lib/api.ts`: single axios instance, `baseURL: "/api/v1"`. Request interceptor attaches the JWT from `localStorage`; response interceptor logs out and redirects to `/login` on 401. Use this instance for all API calls.
- **Auth state** `src/store/authStore.ts`: Zustand store; the token lives in `localStorage` (interceptor reads it there directly).
- **Server state** should go through TanStack Query; **client/UI state** through Zustand.
- Styling: **Tailwind CSS v4** via `@tailwindcss/vite` (CSS-first, `@import "tailwindcss"` in `src/index.css` — no `tailwind.config.js`). Icons via `lucide-react`.

### Design system (follow when building any UI)

All color tokens are defined once in `src/index.css` (`@theme inline`). **Use semantic tokens, never raw palette names** (`indigo-*`, `red-*`, `emerald-*`, `amber-*`, `purple-*`, `blue-*` are forbidden in components — rebranding must only require editing `index.css`):

- `primary-*` — brand & all interactive elements (links, buttons, active states, focus rings). Currently aliases indigo.
- `success-*` — positive states (completed, published, free). `danger-*` — errors & destructive actions. `warning-*` — pending/caution (drafts). `admin-*` — admin-only accents.
- Neutrals stay on **`slate-*`**: page bg `slate-50`, cards/nav `white`, borders `slate-200` (inputs `slate-300`), headings `slate-900`, body `slate-600`, muted `slate-500`. Dark surfaces (learn-page header, footer) are `slate-900` with `slate-300/400` text and `primary-400` accents.

Recurring component recipes (copy these, don't invent variants):

- **Page container**: provided by `MainLayout` (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) — pages don't re-add it.
- **Card**: `bg-white rounded-xl border border-slate-200` (+ `hover:shadow-lg transition-shadow` if clickable).
- **Primary button**: `bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg px-4 py-2`. **Secondary**: `bg-white border border-slate-300 text-slate-700 hover:bg-slate-50`. Disabled: `disabled:opacity-60`.
- **Input/select**: `border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500`.
- **Filter chip**: pill `rounded-full px-4 py-1.5 text-sm font-medium`; active = `bg-primary-600 text-white`, inactive = secondary-button colors.
- **Status badge**: `text-xs font-semibold px-2 py-1 rounded-md` with `{color}-50` bg + `{color}-600/700` text (e.g. `bg-success-50 text-success-700`).
- **Current state of pages**: several pages (`CatalogPage`, `CourseEditorPage`, etc.) still render **hardcoded MOCK data** and stubbed handlers rather than calling the API. When implementing real behavior, wire them to `api.ts` + TanStack Query; the mock endpoints in `frontend/server.ts` define the expected request/response shapes.

## API surface (backend ↔ frontend contract)

Base path `/api/v1`. Frontend field names are **camelCase**; the mock server in `frontend/server.ts` mirrors the real backend DTOs — keep the two in sync when changing shapes.

- `auth`: `POST /auth/login`, `POST /auth/register`
- `courses`: `GET /courses` (paged: `?page&size&sort=field,dir&categoryId`), `GET /courses/{slug}`, `POST /courses` (instructor/admin), `PATCH /courses/{id}/status`
- `enrollments`: `POST /enrollments/courses/{courseId}`, `GET /enrollments`, `GET /enrollments/courses/{courseId}/check`
- `progress`: `POST /progress/courses/{courseId}/lessons/{lessonId}/complete`, `PUT /.../position`, `GET /progress/courses/{courseId}/completed`

## Deployment (`.github/workflows/`)

- `main_hcmute-lms.yml` — on push to `main`: `mvn clean install` in `backend/`, deploys the JAR to Azure Web App `hcmute-lms`.
- `main.yml` — on push to `main`/`master`: `npm run build` in `frontend/`, deploys `frontend/dist` to GitHub Pages. `frontend/vite.config.ts` `base: './'` is required for Pages relative-path serving.

Both fire on the same `main` push. Config values in `application.yml` (`jwt.secret`, datasource) and CORS `allowedOrigins("*")` are dev defaults — override for production.
