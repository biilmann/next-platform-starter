import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async function handler(_: Request, context: Context) {
  const drafts = getStore("drafts");
  const id = context.params.id;
  
  try {
    const data = await drafts.get(id, { type: "json" });
    if (!data) {
      return new Response('Draft not found', { status: 404 });
    }

    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" }
    });
  } catch (error) {
    console.error('Get draft error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get draft' }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}

export const config: Config = {
  path: "/api/drafts/:id"
};