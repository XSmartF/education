# Architecture

## Backend (Clean Architecture)
- `Api/` controllers, middleware, extensions.
- `Application/` use-cases, DTOs, abstractions.
- `Domain/` entities, interfaces, domain events.
- `Infrastructure/` data access, identity, email, storage.

## Frontend
- `app/` router, layouts, providers, store, query client.
- `domains/<feature>/` feature boundaries (api, model, hooks, ui, pages).
- `shared/` cross-cutting (api, ui, utils, styles).

## Mobile
- `app/` navigation + shell.
- `domains/<feature>/` feature boundaries (api, model, hooks, ui, screens).
- `shared/` cross-cutting (api, ui, i18n).
