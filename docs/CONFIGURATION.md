# Configuration

## Backend settings
Location:
- `backend/src/Api/appsettings.json`
- `backend/src/Api/appsettings.Development.json`

Keys:
- `ConnectionStrings:Default` SQL Server connection string.
- `Jwt:Issuer`, `Jwt:Audience`, `Jwt:Key`, `Jwt:ExpMinutes`.
- `RefreshTokens:ExpDays`, `RefreshTokens:TokenSize`.
- `Cors:Origins` allowed origins.
- `Email:*` SMTP + template options.

## Email settings (summary)
- `Email:Enabled` enables SMTP sending.
- `Email:SmtpHost`, `Email:SmtpPort`, `Email:SmtpUser`, `Email:SmtpPass`, `Email:EnableSsl`.
- `Email:FromEmail`, `Email:FromName`.
- `Email:TemplatePath` relative to app content root.
- `Email:ResetPasswordUrl` and `Email:MobileResetPasswordUrl`.
- `Email:LoginUrl` for welcome template.

## Frontend
- `.env` (or CI env) should define `VITE_API_BASE` when API is not `/api`.

## Mobile
- `.env` (or EAS secrets) should define `EXPO_PUBLIC_API_BASE`.
