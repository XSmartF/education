# Security

## Auth
- JWT access token stored in HttpOnly cookie.
- Refresh token rotation enabled.
- CSRF protection enforced for unsafe methods using `X-CSRF-Token`.

## Password policy
- Minimum length 10
- Requires digit, lowercase, uppercase, non-alphanumeric
- Lockout: 5 failed attempts, 10 minutes

## Rate limits
- Auth endpoints: 10 requests/minute
- Global: 120 requests/minute

## Headers
- Backend sets security headers in middleware.
- Netlify `_headers` adds HSTS, CSP, etc.
