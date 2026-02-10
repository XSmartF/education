# Conventions

## Naming

### C# (.NET)
- File name = type name in `PascalCase`.
- Types, public members: `PascalCase`.
- Private fields: `_camelCase`.
- Interfaces: `I` prefix (e.g. `IFileService`).

### Frontend + Mobile (TypeScript)
- **Components / Pages / Screens / Providers**: file name in `PascalCase`.
  - Examples: `DashboardLayout.tsx`, `TodoDetailPage.tsx`, `LoginScreen.tsx`, `AppProviders.tsx`.
- **Non-component modules**: file name in `kebab-case`.
  - Examples: `http-client.ts`, `auth-slice.ts`, `use-auth.ts`, `query-client.ts`.
- **Hooks**: function `useXxx`, file name `use-xxx.ts`.

## Structure

### Frontend (`frontend/src`)
- `app/`
  - `layout/` -> app layouts (e.g. `RootLayout`, `DashboardLayout`, `SimpleLayout`)
  - `providers/` -> React providers
  - `routes/` -> router config
  - `query/` -> query client
  - `store/` -> redux store + hooks
  - `pages/` -> top-level pages
- `domains/<feature>/`
  - `api/` -> API clients (e.g. `auth-api.ts`)
  - `model/` -> types, storage
  - `hooks/` -> hooks (e.g. `use-auth.ts`)
  - `store/` -> redux slices (if any)
  - `ui/` -> feature UI components
  - `pages/` -> routed pages
- `shared/`
  - `api/` -> http client + cross-cutting
  - `ui/` -> shared UI components
  - `utils/` -> pure helpers
- `styles/` -> global styles

### Mobile (`mobile/src`)
- `app/` -> navigation + shared app UI
- `domains/<feature>/`
  - `api/` -> API clients
  - `model/` -> types
  - `hooks/` -> hooks
  - `ui/` -> feature UI components
  - `screens/` -> screens
- `shared/`
  - `api/` -> http client
  - `ui/` -> shared styles/components

### Backend (`backend/src`)
- `Api/` -> controllers + middleware + extensions
- `Application/`
  - `Abstractions/` -> cross-cutting abstractions
  - `Features/<Feature>/Abstractions|Dtos|Services`
- `Domain/` -> entities + interfaces
- `Infrastructure/` -> data access, identity, storage

## i18n
- Backend resources: `backend/src/Api/Resources` (Accept-Language: `vi-VN`, `en-US`).
- Frontend/Mobile resources: `shared/i18n/locales/<lang>/*.json` (namespaces per domain, e.g. `auth.json`, `todos.json`).

## Types
- Do not use `any`.
- Public hooks and exported functions should define explicit return types.
- Prefer defined types/records for API payloads and responses over inline object shapes.

## Imports
- Prefer path alias `@/` for app code.
- Avoid cross-domain imports except via `shared/`.

## Linting
- Frontend: `npm run lint` (eslint)
- Mobile: `npm run lint` (eslint)

## Formatting
- EditorConfig governs line endings and indentation.
- Use `dotnet format` optionally for backend if desired.
