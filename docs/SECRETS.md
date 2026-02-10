# Secrets

## GitHub Actions
Required secrets used by workflows:
- `NETLIFY_AUTH_TOKEN` (Netlify deploy)
- `NETLIFY_SITE_ID` (Netlify deploy)
- `MONSTER_PUBLISH_SETTINGS` (MonsterASP publishsettings XML)
- `EXPO_TOKEN` (EAS build)
- `FIREBASE_APP_ID_ANDROID` (Firebase App Distribution)
- `FIREBASE_SERVICE_ACCOUNT_JSON` (Firebase service account JSON)

Optional:
- `FIREBASE_TESTERS` (comma-separated emails)
- `FIREBASE_GROUPS` (comma-separated groups)

## Backend runtime secrets
Use environment variables or secret manager (do not commit to repo):
- `ConnectionStrings__Default`
- `Jwt__Key`
- `Email__SmtpUser`
- `Email__SmtpPass`
- `Email__FromEmail`

## Local development
- For .NET, prefer `dotnet user-secrets` for local secrets.
