import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  try {
    const { id } = await req.json();
    const drafts = getStore("drafts");
    const draftData = await drafts.get(id, { type: 'json' });
    if (!draftData) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify(draftData), { headers: { 'content-type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve draft' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export const config: Config = {
  path: "/api/get-draft"
};