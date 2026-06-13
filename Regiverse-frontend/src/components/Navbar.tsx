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
      <nav className="fixed top-0 left-0 w-full z-[9999] bg-white border-b shadow-md">

        <div className="max-w-[1400px] mx-auto px-4">

          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <div
              className="flex items-center gap-2 cursor-pointer shrink-0"
              onClick={() =>
                navigate("/admin-dashboard")
              }
            >
              <img
                src="/assets/images/regiverse-logo-new.png"
                alt="RegXpert"
                className="h-8 w-auto object-contain"
              />

              <span className="font-bold text-base text-black hidden sm:block">
                RegXpert
              </span>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex gap-2 flex-1 ml-6">

              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
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

            {/* DESKTOP LOGOUT */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition"
            >
              <Icon
                name="LogOut"
                size={15}
              />

              Logout
            </button>

            {/* MOBILE MENU BUTTON */}
            <button
              className="lg:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() =>
                setMobileMenuOpen(!isMobileMenuOpen)
              }
            >
              <Icon
                name={
                  isMobileMenuOpen ? "X" : "Menu"
                }
                size={22}
              />
            </button>

          </div>

        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>

          {isMobileMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.2,
              }}
              className="lg:hidden bg-white border-t shadow-md"
            >

              <div className="flex flex-col p-4 gap-2">

                {navItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      isActive(item.path)
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                    />

                    {item.label}
                  </NavLink>
                ))}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition"
                >
                  <Icon
                    name="LogOut"
                    size={18}
                  />

                  Logout
                </button>

              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </nav>

      {/* PAGE SPACING */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;