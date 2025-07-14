"use client";
import { useEffect, useState } from 'react';

export default function ProcessingStatus({ id, onComplete }) {
  const [status, setStatus] = useState({ status: 'processing', progress: 0, message: '' });

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${id}`);
        const data = await res.json();
        setStatus(data);
        if (data.status === 'done' || data.status === 'error') {
          clearInterval(interval);
          if (data.status === 'done') onComplete();
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [id, onComplete]);

  return (
    <div>
      <p>{status.message}</p>
      <progress value={status.progress} max="100" />
      {status.status === 'error' && <p style={{ color: 'red' }}>Error processing document.</p>}
    </div>
  );
}