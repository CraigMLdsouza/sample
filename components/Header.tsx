export default function Header() {
  return (
    <header className="navbar navbar-light bg-white shadow-sm fixed-top d-flex justify-content-between align-items-center px-3" style={{ height: 56, zIndex: 1050 }}>
      <span className="fw-bold fs-5">AI Chat</span>
      <a href="/api/auth/logout" className="btn btn-outline-danger btn-sm rounded-pill">Logout</a>
    </header>
  );
} 