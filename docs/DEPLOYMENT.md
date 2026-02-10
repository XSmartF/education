# Deployment

## GitHub Actions
- `ci.yml`: build + test for backend, frontend, mobile.
- `deploy-netlify.yml`: deploys frontend artifact to Netlify.
- `deploy-monsterasp.yml`: deploys backend to MonsterASP.
- `deploy-firebase-app-distribution.yml`: uploads mobile build to Firebase App Distribution.

## Netlify
- SPA redirect: `frontend/public/_redirects`
- Security + cache headers: `frontend/public/_headers`

## Backend
- Publish profile is not stored in repo. Configure MonsterASP deploy secrets in GitHub Actions.
- Deploy workflow generates `appsettings.Production.json` from GitHub Secrets before WebDeploy.
