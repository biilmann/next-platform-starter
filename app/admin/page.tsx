export default function AdminPage() {
  // Placeholder admin interface, implement search and processing UI here.
  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Interface</h1>
      <p>
        <a href="/api/auth/login" className="text-blue-500 hover:underline">
          Login with GitHub
        </a>
      </p>
    </div>
  );
}