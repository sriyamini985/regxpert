import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans text-slate-800">
      {/* Desktop + Tablet Navbar */}
      <header className="hidden lg:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-10 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
            R
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-slate-900">
            REGXPERT
          </h1>
        </div>

        <nav className="flex gap-8 font-bold text-sm">
          <Link 
            to="/admin/conferences" 
            className={`transition-colors ${location.pathname.includes('/conferences') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Event Workspaces
          </Link>
        </nav>
      </header>

      {/* Mobile Navbar */}
      <header className="lg:hidden bg-white border-b border-slate-200 p-5 flex items-center justify-between sticky top-0 z-50">
        <h1 className="font-extrabold text-xl text-slate-900">REGXPERT</h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl text-slate-900 p-2 bg-slate-50 rounded-xl active:scale-95 transition-all"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 absolute w-full z-40 shadow-lg flex flex-col gap-2">
          <Link
            to="/admin/conferences"
            className="block py-3 px-4 bg-slate-50 rounded-xl font-bold text-slate-700"
            onClick={() => setMenuOpen(false)}
          >
            Event Workspaces
          </Link>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}