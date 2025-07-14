# Next.js Markdown Blog Starter

A simple blog built with Next.js App Router and Tailwind CSS, powered by markdown files with YAML front-matter.

## Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to view the blog.

## Adding Posts

Create markdown files in the `posts` directory with the following structure:

```markdown
---
title: "My First Post"
date: "2023-09-10"
---

This is the content of my first post. Use standard markdown syntax to write your content.
```

## Project Structure

- `app/page.jsx`: Homepage listing all posts
- `app/posts/[slug]/page.jsx`: Dynamic route for individual posts
- `posts/`: Markdown files for blog posts
- `lib/posts.js`: Utility functions to fetch and parse posts
- `components/markdown.jsx`: React component to render markdown content

## Notion Publishing Feature

This project includes an admin interface and serverless functions to publish directly from Notion pages.

### Setup

1. **GitHub OAuth App**
   - Create an OAuth App on GitHub.
   - Set the callback URL to `https://<your-site-domain>/api/auth/callback`.
2. **Environment Variables**
   - In Netlify dashboard or local `.env.local`, configure:
     - `NOTION_API_KEY`
     - `OPENAI_API_KEY`
     - `GITHUB_CLIENT_ID`
     - `GITHUB_CLIENT_SECRET`
     - `JWT_SECRET`
     - `URL` (e.g., `https://<your-site-domain>` or `http://localhost:8888`)
3. **Configure GitHub Settings**
   - Update `netlify/lib/config.mts` with your GitHub `owner`, `repo`, and authorized users.
4. **Deploy**
   - Deploy to Netlify. The admin interface will be available at `/admin`.

### Local Development

Create a `.env.local` file in the project root:
```bash
NOTION_API_KEY=your_notion_api_key
OPENAI_API_KEY=your_openai_api_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_jwt_secret
URL=http://localhost:8888
```

