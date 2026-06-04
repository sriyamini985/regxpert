import { Outlet, Link, useParams } from "react-router-dom";
import { useState } from "react";

export default function UserLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { conferenceSlug } = useParams();

  const base = `/u/${conferenceSlug}`;

  return (
    <div className="min-h-screen bg-slate-100">

      <header className="hidden lg:flex h-16 bg-green-900 text-white items-center justify-between px-8 shadow">
        <h1 className="font-bold text-xl">
          USER OPERATIONS
        </h1>

        <nav className="flex flex-wrap gap-6 text-sm">
          <Link to={`${base}/checkin`}>Check-In</Link>
          <Link to={`${base}/food-scan`}>Food Scan</Link>
          <Link to={`${base}/hall-scan`}>Hall Scan</Link>
          <Link to={`${base}/mono-scan`}>Mono Scan</Link>
          <Link to={`${base}/certificate-scan`}>
            Certificate
          </Link>
          <Link to={`${base}/workshop-scan`}>
            Workshop
          </Link>
          <Link to={`${base}/qr-print`}>
            QR Print
          </Link>
        </nav>
      </header>

      <header className="lg:hidden bg-green-900 text-white p-4 flex justify-between">
        <h1 className="font-bold">
          USER OPS
        </h1>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl"
        >
          ☰
        </button>
      </header>

      {menuOpen && (
        <div className="lg:hidden bg-green-800 text-white p-4">

          <Link
            to={`${base}/checkin`}
            className="block py-2"
          >
            Check-In
          </Link>

          <Link
            to={`${base}/food-scan`}
            className="block py-2"
          >
            Food Scan
          </Link>

          <Link
            to={`${base}/hall-scan`}
            className="block py-2"
          >
            Hall Scan
          </Link>

          <Link
            to={`${base}/mono-scan`}
            className="block py-2"
          >
            Mono Scan
          </Link>

          <Link
            to={`${base}/certificate-scan`}
            className="block py-2"
          >
            Certificate
          </Link>

          <Link
            to={`${base}/workshop-scan`}
            className="block py-2"
          >
            Workshop
          </Link>

          <Link
            to={`${base}/qr-print`}
            className="block py-2"
          >
            QR Print
          </Link>

        </div>
      )}

      <main className="w-full p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}