"use client";
import { useState } from 'react';

export default function PublishActions({ id, meta, markdown }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const publish = async (endpoint) => {
    setLoading(true);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, meta, markdown }),
    });
    const data = await res.json();
    setResult({ endpoint, data });
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4">
        <button
          onClick={() => publish('/api/publish-post')}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Publish Direct
        </button>
        <button
          onClick={() => publish('/api/create-github-pr')}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create PR
        </button>
      </div>
      {loading && <span>Processing...</span>}
      {result && (
        <div className="mt-2">
          <pre className="bg-gray-800 p-2 rounded">{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}