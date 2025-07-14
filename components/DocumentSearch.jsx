"use client";
import { useState } from 'react';

export default function DocumentSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notion?s=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Notion..." />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Searching...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <ul>
        {results.map((page) => (
          <li key={page.id}>
            <button onClick={() => onSelect(page)}>{page.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}