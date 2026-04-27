import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AddIncomeForm from "../components/AddIncomeForm";
import { useCurrency } from "../context/CurrencyContext"; // ✅ added

export default function Income() {
  const [list, setList] = useState([]);
  const [expenses, setExpenses] = useState([]); 
  const [showForm, setShowForm] = useState(false);

  const { symbol, convert } = useCurrency(); // ✅ added convert

  const fetchIncome = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id);

    const { data: expenseData } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id);

    setList(data || []);
    setExpenses(expenseData || []);
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  // 🔹 CALCULATIONS
  const total = list.reduce((sum, i) => sum + i.amount, 0);

  const tithe = total * 0.1;
  const save = total * 0.2;

  const availableAllocated = total * 0.6;

  const availableUsed = expenses
    .filter(e => e.bucket === "Available")
    .reduce((s, e) => s + e.amount, 0);

  const available = availableAllocated - availableUsed;

  const others = total * 0.1;

  return (
    <div>
      <h1>Income</h1>
      <p>Track your income sources</p>

      {/* TOP CARD */}
      <div
        className="card"
        style={{
          marginTop: 20,
          background: "linear-gradient(135deg,#3b82f6,#2563eb)",
          color: "white"
        }}
      >
        <h3 style={{ marginTop: 15 }}>April 2026 Income</h3>

        <h1 style={{ fontSize: 58, marginTop: 20 }}>
          {symbol}{convert(total).toLocaleString()}
        </h1>

        <p style={{ marginTop: 20 }}>Allocations</p>

        <div style={{ display: "flex", gap: 10 }}>
          <MiniCard label="Tithe" value={tithe} percent="10%" symbol={symbol} convert={convert} />
          <MiniCard label="Save" value={save} percent="20%" symbol={symbol} convert={convert} />
          <MiniCard label="Available" value={available} percent="60%" symbol={symbol} convert={convert} />
          <MiniCard label="Others" value={others} percent="10%" symbol={symbol} convert={convert} />
        </div>
      </div>

      {/* ADD BUTTON */}
      <button
        className="btn btn-blue"
        style={{ marginTop: 20 }}
        onClick={() => setShowForm(true)}
      >
        + Add Income
      </button>

      {/* FORM */}
      {showForm && (
        <AddIncomeForm
          onCancel={() => setShowForm(false)}
          onSuccess={fetchIncome}
        />
      )}

      {/* RECENT ACTIVITY */}
      <h3 className="card" style={{ marginTop: 20 }}>
        Recent Activity</h3>

      {
        [...list, ...expenses]
          .map((item, index) => ({
            ...item,
            _order: new Date(item.date).getTime() + index
          }))
          .sort((a, b) => b._order - a._order)
          .map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <div>
                <strong>{item.source || item.category}</strong>
                <p style={{ fontSize: 12 }}>{item.date}</p>
              </div>

              <h3
                style={{
                  color: item.source ? "#10b981" : "#ef4444"
                }}
              >
                {item.source ? "+" : "-"}{symbol}
                {convert(item.amount).toLocaleString()}
              </h3>
            </div>
          ))
      }
    </div>
  );
}

/* COMPONENT */

function MiniCard({ label, value, percent, symbol, convert }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.15)",
        padding: 10,
        borderRadius: 10,
        flex: 1
      }}
    >
      <p>{label}</p>
      <strong>{symbol}{convert(value).toLocaleString()}</strong>
      <p style={{ fontSize: 12 }}>{percent}</p>
    </div>
  );
}