import OpenAI from "openai";
import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import { processNotionImages, processMarkdownImages } from '../lib/image-utils.mts';

type DocumentType = "google" | "notion";

async function convertToMetadataAndMarkdown(openai: any, type: DocumentType, doc: string, docId: string) {
  const currentDate = new Date().toISOString().split("T")[0];
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Convert this ${type === 'google' ? 'Google Doc' : 'Notion page'} JSON to a blog post with metadata and markdown content.

IMPORTANT: Today's date is ${currentDate}. ALWAYS use this as the publishDate for the blog post - do NOT use any date from the original document. The publishDate should always be today's date (${currentDate}).

Study these example articles to understand the style and format:

EXAMPLE 1:
---
title: "I built a blog"
author: Mathias Biilmann
publishDate: "2025-01-22"
description: "Introducing a new blog from Matt Biilmann, built with bolt.new and Astro, celebrating the openness of the web."
---

It's been a long time since I've had an active personal blog. Like so many others, I've mainly relied on various forms of social media and managed services. But given the way social networks seem to be breaking apart and the communities I typically interact with are scattering, it feels like it's time to return to owning my own little corner of the web.

The web is unique in this regard: anyone can register a domain and be an owner, rather than a tenant.

[Tobi from Shopify](https://linkpop.com/tobi) made a great point at a recent event. Roughly paraphrasing, he said: "If the browser were released today as a new app, it would never get accepted into any of the app stores. It's simply too powerful."

EXAMPLE 2:
---
title: "I Built a Personal MCP and Got Agents to Give Me Feedback"
author: Mathias Biilmann
publishDate: "2025-04-28"
description: "How I built a personal Model Context Protocol server with Windsurf and added an Agent Net Promoter Score tool to gather LLM feedback."
---

On Friday morning, the team at Netlify launched our first guide on [building MCP servers with Netlify](https://developers.netlify.com/guides/write-mcps-on-netlify/). I decided building my own MCP server would make for a perfect weekend project.

The same morning, I came across Alana Goyal's tweet about [personal MCP servers](https://x.com/alanaagoyal/status/1915810920573382711). Inspired by this, I felt Biilmann Blog should have one too, to [enhance the Agent Experience (AX)](https://agentexperience.ax) of my little corner of the web.

## Introducing Agent Net Promoter Score (ANPS)

Listing and retrieving articles seemed like core functionalities, but what about enabling agents to share feedback on their needs?

![Windsurf session showing functioning tool use](/images/windsurf-mcp-session-1.png)

COPY EDITOR GUIDELINES:
You are acting as a copy editor preparing this document for publication. Your role is STRICTLY LIMITED to:

FORMATTING ONLY:
- Extract metadata (title, description, author, publishDate) and convert document to markdown
- Don't include the main title in markdown (it's in metadata)
- Convert ONLY actual headings to markdown levels (start with ##) - DO NOT turn paragraphs into headings
- For images: use markdown image syntax ![alt](url)
- For videos (files ending in .mov, .mp4, .webm, etc.): use HTML video tags <video controls><source src="url" type="video/..."></video>
- Clean up collaborative editing artifacts (comments, suggestions, etc.)

MINIMAL CORRECTIONS ONLY:
- Fix obvious typos and spelling errors
- Correct clear grammatical errors
- Author should default to "Mathias Biilmann" unless specified
- publishDate MUST be today's date (${currentDate}) in YYYY-MM-DD format - NEVER use dates from the original document
- Description should be compelling and 150-160 characters
- heroImage is optional, only include if there's a clear main image

STRICTLY PRESERVE:
- Author's voice, tone, and writing style
- All original wording and phrasing
- Paragraph structure and organization - keep paragraphs as paragraphs
- Content structure and flow - do not restructure the document
- All technical details and explanations

CRITICAL: DO NOT turn paragraphs into headings. Only convert text that was already formatted as headings in the original document.

DO NOT change, rewrite, or "improve" the content in any way beyond basic copy editing.

Return JSON with:
{
  "meta": {
    "title": "Blog post title",
    "author": "Mathias Biilmann",
    "publishDate": "YYYY-MM-DD",
    "description": "Meta description 150-160 chars",
    "heroImage": "URL if present (optional)",
    "notionId": "${docId}"
  },
  "markdown": "Full markdown content without the main title"
}
        },
      { role: "user", content: doc }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const openai = new OpenAI({
    apiKey: Netlify.env.get('OPENAI_API_KEY')
  });

  const { id, doc, type } = await req.json();

  console.log(`Processing ${type} document: ${id}`);

  const drafts = getStore("drafts");

  try {
    await drafts.set(`${id}-status`, JSON.stringify({
      status: 'processing',
      step: 'initializing',
      message: 'Starting document conversion...',
      progress: 10,
      timestamp: new Date().toISOString()
    }));

    let imageMapping = {};
    if (type === 'notion') {
      await drafts.set(`${id}-status`, JSON.stringify({
        status: 'processing',
        step: 'processing_images',
        message: 'Downloading and processing images...',
        progress: 30,
        timestamp: new Date().toISOString()
      }));

      try {
        const docData = JSON.parse(doc);
        if (docData.children && docData.children.results) {
          const title = docData.properties?.title?.title?.[0]?.text?.content ||
                       docData.properties?.Title?.title?.[0]?.text?.content ||
                       docData.properties?.Name?.title?.[0]?.text?.content ||
                       'untitled';

          console.log(`Processing images for document: ${title}`);
          imageMapping = await processNotionImages(docData.children.results, title);
          console.log(`Downloaded ${Object.keys(imageMapping).length} images`);
        }
      } catch (imageError) {
        console.error('Image processing failed, continuing without images:', imageError);
      }
    }

    await drafts.set(`${id}-status`, JSON.stringify({
      status: 'processing',
      step: 'ai_conversion',
      message: 'Converting content with AI...',
      progress: 60,
      timestamp: new Date().toISOString()
    }));

    const result = await convertToMetadataAndMarkdown(openai, type, doc, id);

    await drafts.set(`${id}-status`, JSON.stringify({
      status: 'processing',
      step: 'finalizing',
      message: 'Finalizing content and saving...',
      progress: 90,
      timestamp: new Date().toISOString()
    }));

    const finalMarkdown = Object.keys(imageMapping).length > 0
      ? processMarkdownImages(result.markdown, imageMapping)
      : result.markdown;

    await drafts.set(id, JSON.stringify({
      meta: result.meta,
      markdown: finalMarkdown
    }));

    await drafts.set(`${id}-status`, JSON.stringify({
      status: 'done',
      step: 'complete',
      message: 'Document processing complete!',
      progress: 100,
      timestamp: new Date().toISOString()
    }));

    console.log(`Successfully processed ${type} document: ${id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Processing error:', error);

    await drafts.set(`${id}-status`, JSON.stringify({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }));

    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export const config: Config = {
  path: '/api/process-document-background'
};