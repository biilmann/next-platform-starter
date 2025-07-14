export default function LoginPage({ searchParams }) {
  const error = searchParams?.error;
  return (
    <main style={{ padding: '1rem' }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <p>
        <a href="/api/auth/login">Login with GitHub</a>
      </p>
    </main>
  );
}