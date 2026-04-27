import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AddTransactionForm from "../components/AddTransactionForm";
import { useCurrency } from "../context/CurrencyContext"; // ✅ added

export default function Transactions() {
  const [filter, setFilter] = useState("All");
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const { symbol, convert } = useCurrency(); // ✅ added convert

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: incomeData } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id);

    const { data: expenseData } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id);

    setIncomes(incomeData || []);
    setExpenses(expenseData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 CALCULATIONS
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

  const availableAllocated = totalIncome * 0.6;

  const availableUsed = expenses
    .filter(e => e.bucket === "Available")
    .reduce((s, e) => s + e.amount, 0);

  const availableRemaining = availableAllocated - availableUsed;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const othersBase = totalIncome * 0.1;

  const data = {
    Available: {
      display: availableRemaining,
      total: availableAllocated,
      color: "#3b82f6"
    },
    Expenses: {
      display: totalExpenses,
      total: totalIncome,
      color: "#ef4444"
    },
    Others: {
      display: othersBase,
      total: othersBase,
      color: "#f59e0b"
    }
  };

  const filters = ["All", "Available", "Expenses", "Others"];

  return (
    <div>
      <h1>Transactions</h1>

      {/* TOP CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 15,
          marginTop: 20
        }}
      >
        {Object.entries(data).map(([name, val]) => (
          <div className="card" key={name}>
            <span>{name}</span>
            <h2>{symbol}{convert(Math.max(0, val.display)).toLocaleString()}</h2>
            <p>of {symbol}{convert(val.total).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* ACTION */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          className="btn btn-blue"
          onClick={() => setShowTransactionForm(!showTransactionForm)}
        >
          + Add Transaction
        </button>
      </div>

      {showTransactionForm && (
        <div style={{ marginTop: 20 }}>
          <AddTransactionForm
            onCancel={() => setShowTransactionForm(false)}
            onSuccess={fetchData}
          />
        </div>
      )}

      {/* LIST */}
      {[...incomes, ...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
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
              <p>{item.date}</p>
            </div>

            <h3 style={{ color: item.source ? "green" : "red" }}>
              {item.source ? "+" : "-"}{symbol}{convert(item.amount).toLocaleString()}
            </h3>
          </div>
        ))}
    </div>
  );
}