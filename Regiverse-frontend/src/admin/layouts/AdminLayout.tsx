import { Outlet, Link } from "react-router-dom";
import { useState } from "react";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Desktop + Tablet Navbar */}
      <header className="hidden lg:flex h-16 bg-slate-900 text-white items-center justify-between px-8 shadow">
        <h1 className="font-bold text-xl">
          REGIVERSE ADMIN
        </h1>

        <nav className="flex gap-8">
          <Link to="/admin/conferences">
            Conferences
          </Link>
        </nav>
      </header>

      {/* Mobile Navbar */}
      <header className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between">
        <h1 className="font-bold">
          REGIVERSE ADMIN
        </h1>

        <button
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          className="text-2xl"
        >
          ☰
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-slate-800 text-white p-4">
          <Link
            to="/admin/conferences"
            className="block py-2"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Conferences
          </Link>
        </div>
      )}

      <main className="w-full p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}