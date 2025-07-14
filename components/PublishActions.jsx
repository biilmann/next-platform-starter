"use client";
import { useState } from 'react';

export default function PublishActions({ id, draft }) {
  const [result, setResult] = useState(null);

  const handlePublish = async () => {
    const res = await fetch('/api/publish-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, meta: draft.meta, markdown: draft.markdown })
    });
    const data = await res.json();
    setResult(data);
  };

  const handleCreatePR = async () => {
    const res = await fetch('/api/create-github-pr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={handlePublish} style={{ marginRight: '0.5rem' }}>Publish Direct</button>
      <button onClick={handleCreatePR}>Create PR</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}