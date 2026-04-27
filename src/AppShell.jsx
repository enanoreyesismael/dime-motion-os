import { useState } from "react";
import "./App.css";

import {
  LayoutDashboard,
  Wallet,
  PieChart,
  ArrowLeftRight,
  Target,
  Settings as SettingsIcon
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Budget from "./pages/Budget";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";

export default function AppShell() {
  const [page, setPage] = useState("Dashboard");

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Income", icon: <Wallet size={18} /> },
    { name: "Budget", icon: <PieChart size={18} /> },
    { name: "Transactions", icon: <ArrowLeftRight size={18} /> },
    { name: "Goals", icon: <Target size={18} /> },
    { name: "Settings", icon: <SettingsIcon size={18} /> },
    
  ];

  const renderPage = () => {
    switch (page) {
      case "Dashboard": return <Dashboard />;
      case "Income": return <Income />;
      case "Budget": return <Budget />;
      case "Transactions": return <Transactions />;
      case "Goals": return <Goals />;
      case "Settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>
            💰 <span style={{ color: "#c2a205" }}>DimeMotion</span>
        </h2>
        <p style={{ fontSize: 12, opacity: 0.7 }}>Personal Finance</p>

        {menu.map(item => (
          <div
            key={item.name}
            onClick={() => setPage(item.name)}
            className={`menu-item ${page === item.name ? "active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12
            }}
          >
            {item.icon}
            {item.name}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="main">
        {renderPage()}
      </div>

    </div>
  );
}