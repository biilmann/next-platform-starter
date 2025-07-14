import type { Config } from "@netlify/functions";
import { requireAuth } from '../lib/auth.mts';

export default function handler(req: Request) {
  const auth = requireAuth(req);
  return new Response(JSON.stringify({ authenticated: !!auth, user: auth?.user || null }), {
    headers: { 'content-type': 'application/json' }
  });
}

export const config: Config = {
  path: "/api/auth/check"
};