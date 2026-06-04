import { Outlet, Link } from "react-router-dom";
import { useState } from "react";

export default function ClientLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Desktop + Tablet */}
      <header className="hidden lg:flex h-16 bg-blue-900 text-white items-center justify-between px-8 shadow">
        <h1 className="font-bold text-xl">
          CLIENT PANEL
        </h1>

        <nav className="flex gap-8">
          <Link to="/client/dashboard">
            Dashboard
          </Link>

          <Link to="/client/add-delegate">
            Add Delegate
          </Link>

          <Link to="/client/registered-list">
            Registered List
          </Link>
        </nav>
      </header>

      {/* Mobile */}
      <header className="lg:hidden bg-blue-900 text-white p-4 flex justify-between">
        <h1 className="font-bold">
          CLIENT PANEL
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

      {menuOpen && (
        <div className="lg:hidden bg-blue-800 text-white p-4">
          <Link
            to="/client/dashboard"
            className="block py-2"
          >
            Dashboard
          </Link>

          <Link
            to="/client/add-delegate"
            className="block py-2"
          >
            Add Delegate
          </Link>

          <Link
            to="/client/registered-list"
            className="block py-2"
          >
            Registered List
          </Link>
        </div>
      )}

      <main className="w-full p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}