const DEVICE_KEY = 'education_device_id';

export function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) {
    return existing;
  }

  const hasRandomUuid = 'crypto' in globalThis && 'randomUUID' in globalThis.crypto;
  const generated = hasRandomUuid
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(DEVICE_KEY, generated);
  return generated;
}
