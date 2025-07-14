"use client";
import { useState, useEffect } from 'react';

export default function ProcessingStatus({ id, onComplete }) {
  const [status, setStatus] = useState({});

  useEffect(() => {
    let interval;
    const fetchStatus = () => {
      fetch(`/api/status/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setStatus(data);
          if (data.status === 'done') {
            clearInterval(interval);
            onComplete(id);
          }
          if (data.status === 'error') {
            clearInterval(interval);
          }
        })
        .catch(() => clearInterval(interval));
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [id, onComplete]);

  return (
    <div className="mb-4">
      <div>Status: {status.status}</div>
      {status.step && <div>Step: {status.step}</div>}
      {status.message && <div>Message: {status.message}</div>}
      {typeof status.progress === 'number' && (
        <div className="w-full bg-gray-200 h-2 mt-1">
          <div
            className="bg-blue-500 h-2"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}