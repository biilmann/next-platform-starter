import type { Config } from "@netlify/functions";
import { requireAuth } from '../lib/auth.mts';
import { getStore } from "@netlify/blobs";
import { Octokit } from "@octokit/rest";

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const auth = requireAuth(req);
  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return new Response('Document ID required', { status: 400 });
    }

    const drafts = getStore("drafts");
    const draftData = await drafts.get(id, { type: "json" });
    if (!draftData) {
      return new Response('Draft not found', { status: 404 });
    }

    const { meta, markdown } = draftData;
    const octokit = new Octokit({ auth: auth.github_token });

    const { GITHUB_CONFIG } = await import('../lib/config.mts');
    const { owner, repo, branchPrefix } = GITHUB_CONFIG;

    const slug = meta.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);

    const fileContent = `---
title: "${meta.title}"
author: ${meta.author}
publishDate: "${meta.publishDate}"
description: "${meta.description}"${meta.heroImage ? `\nheroImage: "${meta.heroImage}"` : ''}${meta.notionId ? `\nnotionId: "${meta.notionId}"` : ''}
---

${markdown}`;

    const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoInfo.default_branch;

    const { data: ref } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${defaultBranch}` });
    const branchName = `${branchPrefix}${slug}-${Date.now()}`;
    await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: ref.object.sha });

    const filePath = `src/content/articles/${slug}.md`;
    await octokit.rest.repos.createOrUpdateFileContents({ owner, repo, path: filePath, message: `Add new article: ${meta.title}`, content: Buffer.from(fileContent).toString('base64'), branch: branchName });

    const { data: pr } = await octokit.rest.pulls.create({ owner, repo, title: `[Notion:${meta.notionId}] Add article: ${meta.title}`, body: `New article processed from Notion.\n\nNotion ID: ${meta.notionId}`, head: branchName, base: defaultBranch });

    await drafts.set(`${id}-pr`, JSON.stringify({ pr_number: pr.number, pr_url: pr.html_url, branch: branchName, created_at: new Date().toISOString() }));

    return new Response(JSON.stringify({ success: true, pr_url: pr.html_url, pr_number: pr.number, branch: branchName }), { headers: { 'content-type': 'application/json' } });
  } catch (error) {
    console.error('GitHub PR creation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create pull request', details: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export const config: Config = {
  path: "/api/create-github-pr"
};