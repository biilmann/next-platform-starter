import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '../../../lib/posts';
import { Markdown } from '../../../components/markdown';

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default function Page({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post?.slug) {
    notFound();
  }

  const { meta, content } = post;

  return (
    <article className="prose lg:prose-xl py-8">
      <h1>{meta.title}</h1>
      {meta.date && (
        <time dateTime={meta.date} className="block mb-4 text-gray-500">
          {meta.date}
        </time>
      )}
      <Markdown content={content} />
    </article>
  );
}
