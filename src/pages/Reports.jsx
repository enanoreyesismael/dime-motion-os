import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function Report() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [start, setStart] = useState("2026-04-01");
  const [end, setEnd] = useState("2026-04-30");

  const { symbol, convert } = useCurrency(); // ✅ added convert

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: inc } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end);

    const { data: exp } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end);

    setIncomes(inc || []);
    setExpenses(exp || []);
  };

  useEffect(() => {
    fetchData();
  }, [start, end]);

  // 🔹 CALCULATIONS
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const net = totalIncome - totalExpenses;

  // 🔹 CATEGORY BREAKDOWN
  const categoryTotals = {};
  expenses.forEach((e) => {
    if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
    categoryTotals[e.category] += e.amount;
  });

  return (
    <div>
      <h1>Report</h1>

      {/* DATE FILTER */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>

      {/* SUMMARY */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Summary</h3>
        <p>Income: {symbol}{convert(totalIncome).toLocaleString()}</p>
        <p>Expenses: {symbol}{convert(totalExpenses).toLocaleString()}</p>
        <h2>Net: {symbol}{convert(net).toLocaleString()}</h2>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>By Category</h3>

        {Object.keys(categoryTotals).length === 0 ? (
          <p>No data</p>
        ) : (
          Object.entries(categoryTotals).map(([cat, val]) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span>{cat}</span>
              <strong>{symbol}{convert(val).toLocaleString()}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}