"use client";
import { useState, useEffect } from 'react';

export default function DocumentSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query) {
        setLoading(true);
        setError(null);
        fetch(`/api/notion?s=${encodeURIComponent(query)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.error) throw new Error(data.error);
            setResults(data);
          })
          .catch((e) => setError(e.message))
          .finally(() => setLoading(false));
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search Notion..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      {error && <div className="text-red-500">Error: {error}</div>}
      {loading && <div>Searching...</div>}
      <ul className="list-disc list-inside">
        {results.map((page) => (
          <li key={page.id}>
            <button onClick={() => onSelect(page)} className="text-blue-400 hover:underline">
              {page.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}