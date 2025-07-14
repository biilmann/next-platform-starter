import Link from 'next/link';
import { getAllPosts } from '../lib/posts';

export default function Page() {
  const posts = getAllPosts();
  return (
    <div className="flex flex-col gap-4 py-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      <ul className="list-disc list-inside">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`} className="text-blue-400 hover:underline">
              {post.meta.title}{' '}
              {post.meta.date && (
                <time dateTime={post.meta.date} className="text-gray-400">
                  ({post.meta.date})
                </time>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
