import type { Config } from "@netlify/functions";

export default async function handler(req: Request) {
  return new Response(JSON.stringify({ error: 'Not implemented' }), { status: 501, headers: { 'content-type': 'application/json' } });
}

export const config: Config = {
  path: "/api/create-github-pr"
};