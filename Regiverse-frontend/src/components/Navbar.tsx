import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

import Icon from "./AppIcon";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

const navItems = [
  {
    id: 1,
    path: "/admin-dashboard",
    label: <b>Dashboard</b>,
    icon: "LayoutDashboard",
  },
  
  {
    id: 2,
    path: "/conferences",
    label: <b>Conferences</b>,
    icon: "Building2",
  },

];

const Navbar = () => {
  const { logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [isMobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const isActive = (path: string) =>
    location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">

        <div className="max-w-[1400px] mx-auto px-3">

          <div className="flex items-center justify-between h-14">

            <div
              className="flex items-center gap-2 cursor-pointer shrink-0"
              onClick={() =>
                navigate("/admin-dashboard")
              }
            >
              <img
                src="/assets/images/regiverse-logo-new.png"
                alt="RegiVerse"
                className="h-8"
              />

              <span className="font-bold text-base hidden sm:block">
                RegiVerse
              </span>
            </div>

            <div className="hidden lg:flex gap-2 flex-1 ml-6">

              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(item.path)
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={15}
                  />

                  {item.label}
                </NavLink>
              ))}

            </div>

            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
            >
              <Icon
                name="LogOut"
                size={15}
              />

              Logout
            </button>

          </div>

        </div>

      </nav>
    </>
  );
};

export default Navbar;