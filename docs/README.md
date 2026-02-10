# Education Starter (.NET 10 + Vite + Mobile)

## Yeu cau
- .NET SDK 10
- Node.js 20+
- SQL Server (hoac LocalDB)

## Backend
- Chinh sua chuoi ket noi va JWT key trong `backend/src/Api/appsettings.json`
- Chay API:
  - `dotnet run --project backend/src/Api/Api.csproj`
- Tao migration + update DB (EF Core):
  - `dotnet ef migrations add InitialCreate -p backend/src/Infrastructure/Infrastructure.csproj -s backend/src/Api/Api.csproj`
  - `dotnet ef database update -p backend/src/Infrastructure/Infrastructure.csproj -s backend/src/Api/Api.csproj`

## Frontend (Vite + TS)
- `cd frontend`
- `npm install`
- Dev (proxy -> API): `npm run dev`
- Build prod (output vao dist): `npm run build`
- Lint: `npm run lint`

## Mobile (Expo + TS)
- `cd mobile`
- `npm install`
- Thiet lap API base (tuy thiet bi):
  - Android emulator: `EXPO_PUBLIC_API_BASE=http://10.0.2.2:5000/api`
  - iOS simulator: `EXPO_PUBLIC_API_BASE=http://localhost:5000/api`
- Thiet bi that: `EXPO_PUBLIC_API_BASE=http://<LAN_IP>:5000/api`
- Chay: `npm run start`
- Lint: `npm run lint`

## CI
- GitHub Actions: `.github/workflows/ci.yml`
- Deploy frontend (Netlify): `.github/workflows/deploy-netlify.yml` (can thiet lap `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`)

## Secrets
- Chi tiet secret: `docs/SECRETS.md`

## Conventions
- Quy uoc dat ten va code style: `docs/CONVENTIONS.md`

## Firebase App Distribution (Mobile)
- Yeu cau EAS: chay `eas init` trong `mobile/` de tao project va cap nhat `app.json` (projectId).
- Secrets can co trong GitHub Actions:
  - `EXPO_TOKEN`
  - `FIREBASE_APP_ID_ANDROID`
  - `FIREBASE_SERVICE_ACCOUNT_JSON`
  - (tuy chon) `FIREBASE_TESTERS`, `FIREBASE_GROUPS`
- Workflow: `.github/workflows/deploy-firebase-app-distribution.yml`

## Docs
This folder captures project rules, configuration, security, and operations.

## Index
- `docs/ARCHITECTURE.md`
- `docs/CONFIGURATION.md`
- `docs/DEPLOYMENT.md`
- `docs/EMAIL.md`
- `docs/I18N.md`
- `docs/RULES.md`
- `docs/SECURITY.md`
- `docs/SECRETS.md`
- `docs/TESTING.md`

## Canonical rules
- Naming/structure conventions live in `docs/CONVENTIONS.md`.
