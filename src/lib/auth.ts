import { createHash } from 'crypto';
import { cookies } from 'next/headers';

export const AUTH_COOKIE = 'crm_auth';

export function authToken(): string | null {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return null;
  return createHash('sha256').update(`10k-crm:${pass}`).digest('hex');
}

export async function isAuthed(): Promise<boolean> {
  const token = authToken();
  if (!token) return false;
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value === token;
}
