# Rules

## Naming and structure
- See `docs/CONVENTIONS.md` for naming rules and folder structure.

## API response
- All API responses use `ApiResponse<T>` with `{ success, data, error }`.
- Validation errors return `ApiErrorCodes.ValidationError` and a field error map.

## Roles and policies
- Roles: `Admin`, `Student`, `Teacher`, `Organize`.
- Policies: `AdminOnly`, `StudentOnly`, `TeacherOnly`, `OrganizeOnly`, `AppAccess`.
- Write operations on Todos/Files are restricted to `Admin`, `Teacher`, `Organize`.

## i18n
- Backend resources: `backend/src/Api/Resources`.
- Frontend/Mobile resources: `shared/i18n/locales/<lang>/*.json`.

## Types
- No `any`.
- Exported hooks and public APIs must declare explicit return types.
