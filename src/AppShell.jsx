import "./App.css";
import { NavLink, Outlet } from "react-router-dom";

import {
  LayoutDashboard,
  Wallet,
  PieChart,
  ArrowLeftRight,
  Target,
  Settings as SettingsIcon
} from "lucide-react";

export default function AppShell() {
  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Income", icon: <Wallet size={18} /> },
    { name: "Budget", icon: <PieChart size={18} /> },
    { name: "Transactions", icon: <ArrowLeftRight size={18} /> },
    { name: "Goals", icon: <Target size={18} /> },
    { name: "Settings", icon: <SettingsIcon size={18} /> }
  ];

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/logo-icon.png"
            alt="logo"
            style={{ width: 60, height: 60 }}
          />
          <span style={{ fontWeight: "bold", fontSize: 25 }}>
            DimeMotion
          </span>
        </div>

        <p style={{ fontSize: 12, opacity: 0.7 }}>
          Personal Finance
        </p>

        {menu.map(item => (
          <NavLink
            key={item.name}
            to={`/${item.name.toLowerCase()}`}
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
              color: "inherit"
            }}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}