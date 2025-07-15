import type { Config } from "@netlify/functions";

export default async function handler(req: Request) {
  const headers = new Headers();
  
  // Clear the auth cookie
  headers.set('Set-Cookie', 'auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
  headers.set('Location', '/admin/login');
  
  return new Response('Logged out successfully', {
    status: 302,
    headers,
  });
}

export const config: Config = {
  path: "/api/auth/logout"
};