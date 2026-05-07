import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import AppShell from "./AppShell";

import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Budget from "./pages/Budget";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";

import { CurrencyProvider } from "./context/CurrencyContext";

export default function App() {
  return (
    <Router>
      <CurrencyProvider>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* 🔥 APP SHELL */}
          <Route path="/" element={<AppShell />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="income" element={<Income />} />
            <Route path="budget" element={<Budget />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="goals" element={<Goals />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </CurrencyProvider>
    </Router>
  );
}