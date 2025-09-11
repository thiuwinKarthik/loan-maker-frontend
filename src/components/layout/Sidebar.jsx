import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  Users,
  Home,
  FileText,
  CreditCard,
  BarChart2,
  BadgePercent,
  Database,
  UserCheck,
} from "lucide-react";

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Open sidebar via custom event (optional)
  useEffect(() => {
    const handler = () => setMobileOpen(true);
    document.addEventListener("open-sidebar", handler);
    return () => document.removeEventListener("open-sidebar", handler);
  }, []);

  // Dispatch sidebar open/close events
  useEffect(() => {
    const evt = new Event(mobileOpen ? "sidebar-opened" : "sidebar-closed");
    document.dispatchEvent(evt);
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Links for user/admin
  const userLinks = [
    { name: "Dashboard", to: "/dashboard", icon: <Home size={18} /> },
    { name: "Apply Loan", to: "/apply-loan", icon: <CreditCard size={18} /> },
    { name: "Loan History", to: "/loan-history", icon: <FileText size={18} /> },
    { name: "Profile", to: "/profile", icon: <Users size={18} /> },
    { name: "Offers", to: "/offers", icon: <BadgePercent size={18} /> },
    { name: "Assets", to: "/assets", icon: <Database size={18} /> },
  ];

  const adminLinks = [
    { name: "Dashboard", to: "/admin", icon: <Home size={18} /> },
    { name: "Users", to: "/admin/users", icon: <Users size={18} /> },
    { name: "Loans", to: "/admin/loans", icon: <CreditCard size={18} /> },
    { name: "Reports", to: "/admin/reports", icon: <BarChart2 size={18} /> },
    { name: "Admins", to: "/admin/add", icon: <UserCheck size={18} /> },
  ];

  const links = role === "ROLE_ADMIN" ? adminLinks : userLinks;

  return (
    <>
      {/* Mobile Toggle Button */}
      {!mobileOpen && (
        <button
          className="fixed left-4 top-4 z-[100] rounded-lg bg-gray-900/90 p-2 text-white shadow-lg backdrop-blur md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed md:relative h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl transition-transform duration-300 ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 z-[100]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && <h1 className="font-bold text-lg">Loan Maker</h1>}
          <div className="flex items-center gap-1">
            {/* Collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-gray-800 rounded hidden md:block"
              aria-label="Toggle collapse"
            >
              <Menu size={24} />
            </button>
            {/* Close button on mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 hover:bg-gray-800 rounded md:hidden"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-4 overflow-auto">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 p-3 rounded mx-2 my-1 transition-colors duration-150 hover:bg-white/10 focus:bg-white/10 focus:outline-none"
              onClick={() => setMobileOpen(false)}
            >
              {link.icon}
              {!collapsed && <span>{link.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            <LogOut size={20} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
