# Email

## Templates
- Location: `backend/src/Api/EmailTemplates`
- Templates in use:
  - `reset-password.html`
  - `welcome.html`

## Tokens
- Common tokens:
  - `{{AppName}}`
  - `{{DisplayName}}`
  - `{{SupportEmail}}`
- Reset password:
  - `{{ResetUrl}}`
  - `{{ExpiresMinutes}}`
- Welcome:
  - `{{LoginUrl}}`

## Sending
- SMTP is configured via `Email:*` settings.
- When disabled, email is logged and not sent.
