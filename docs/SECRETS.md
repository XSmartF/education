# Secrets

## GitHub Actions
Required secrets used by workflows:
- `NETLIFY_AUTH_TOKEN` (Netlify deploy)
- `NETLIFY_SITE_ID` (Netlify deploy)
- `WEBSITE_NAME` (MonsterASP msdeploy site name)
- `SERVER_COMPUTER_NAME` (MonsterASP publish URL, e.g. `siteXXXX.siteasp.net`)
- `SERVER_USERNAME` (MonsterASP deploy username)
- `SERVER_PASSWORD` (MonsterASP deploy password)
- `ConnectionStrings__Default` (API runtime connection string)
- `Jwt__Key` (API runtime JWT signing key)
- `EXPO_TOKEN` (EAS build)
- `FIREBASE_APP_ID_ANDROID` (Firebase App Distribution)
- `FIREBASE_SERVICE_ACCOUNT_JSON` (Firebase service account JSON)
- `ANDROID_KEYSTORE_BASE64` (base64 of Android keystore file)
- `ANDROID_KEYSTORE_PASSWORD` (Android keystore password)
- `ANDROID_KEY_PASSWORD` (Android key password)
- `ANDROID_KEY_ALIAS` (Android key alias)

Optional:
- `FIREBASE_TESTERS` (comma-separated emails)
- `FIREBASE_GROUPS` (comma-separated groups)
- `Email__SmtpUser` (SMTP username)
- `Email__SmtpPass` (SMTP password)
- `Email__FromEmail` (override sender email)

## GitHub Actions variables
Optional variables used by workflows:
- `VITE_API_BASE` (frontend API base URL, e.g. `https://learnsys.runasp.net/api`)
- `DIAGNOSTICS_INCLUDE_EXCEPTION_DETAILS` (set `true` to include exception details in 500 responses)

## Backend runtime secrets
Use environment variables or secret manager (do not commit to repo):
- `ConnectionStrings__Default`
- `Jwt__Key`
- `Email__SmtpUser`
- `Email__SmtpPass`
- `Email__FromEmail`

## Local development
- For .NET, prefer `dotnet user-secrets` for local secrets.
