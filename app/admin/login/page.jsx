"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const router = useRouter();

  useEffect(() => {
    if (error) {
      setTimeout(() => router.replace('/admin/login'), 3000);
    }
  }, [error, router]);

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      {error && <p className="text-red-500 mb-2">Error: {error}</p>}
      <button
        onClick={() => (window.location.href = '/api/auth/login')}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Login with GitHub
      </button>
    </div>
  );
}