"use client";
import { useEffect, useState } from 'react';
import Markdown from 'markdown-to-jsx';

export default function ContentPreview({ id }) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch('/api/auth/check') // ensure auth cookie sent
      .then(() =>
        fetch('/api/get-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })
      )
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch draft');
        return res.json();
      })
      .then(data => setDraft(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading preview...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!draft) return null;

  return (
    <div>
      <h2>{draft.meta.title}</h2>
      <Markdown>{draft.markdown}</Markdown>
    </div>
  );
}