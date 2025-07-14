import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.md'));
}

export function getPostBySlug(slug) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = parseFrontMatter(fileContents);
  return {
    slug: realSlug,
    meta: data,
    content,
  };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs.map((file) => getPostBySlug(file));
  return posts.sort((post1, post2) =>
    post1.meta.date > post2.meta.date ? -1 : 1
  );
}

// Simple front-matter parser: extracts YAML-like key: value pairs between --- delimiters
function parseFrontMatter(fileContent) {
  const match = /^---\n([\s\S]*?)\n---/.exec(fileContent);
  if (match) {
    const raw = match[1];
    const content = fileContent.slice(match[0].length).trim();
    const data = raw.split('\n').reduce((acc, line) => {
      const [key, ...rest] = line.split(':');
      acc[key.trim()] = rest.join(':').trim().replace(/^"(.*)"$/, '$1');
      return acc;
    }, {});
    return { data, content };
  }
  return { data: {}, content: fileContent };
}
