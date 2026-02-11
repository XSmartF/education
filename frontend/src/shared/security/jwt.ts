const ROLE_CLAIM_KEYS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
];

const STAFF_ROLES = new Set(['Admin', 'Teacher', 'Organize']);

type JwtPayload = Record<string, unknown>;

const decodeBase64Url = (input: string): string => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  if (typeof atob === 'undefined') {
    return '';
  }
  const decoded = atob(padded);
  try {
    return decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
  } catch {
    return decoded;
  }
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  const payload = decodeBase64Url(parts[1]);
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload) as JwtPayload;
  } catch {
    return null;
  }
};

const normalizeRoles = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  return [];
};

export const getTokenRoles = (token: string): string[] => {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return [];
  }

  for (const key of ROLE_CLAIM_KEYS) {
    if (key in payload) {
      return normalizeRoles(payload[key]);
    }
  }

  return [];
};

export const isStaffRole = (role: string): boolean => STAFF_ROLES.has(role);
