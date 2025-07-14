"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(() => setChecking(false))
      .catch(() => router.push('/admin/login'));
  }, [router]);

  if (checking) {
    return <div>Loading...</div>;
  }
  return <>{children}</>;
}