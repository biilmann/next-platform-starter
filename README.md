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

