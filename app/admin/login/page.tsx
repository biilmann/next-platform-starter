"use client";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => (window.location.href = '/api/auth/login')}
      >
        Login with GitHub
      </button>
    </div>
  );
}