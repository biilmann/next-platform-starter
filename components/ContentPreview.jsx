"use client";
import MarkdownToJsx from 'markdown-to-jsx';

export default function ContentPreview({ content }) {
  return (
    <div className="prose lg:prose-xl py-4">
      <MarkdownToJsx>{content}</MarkdownToJsx>
    </div>
  );
}