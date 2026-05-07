import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const [list, setList] = useState([]);

  const { symbol, fromUSD, toUSD } = useCurrency(); // ✅ FIXED

  const [form, setForm] = useState({
    category: "Food",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const fetchExpenses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setList(data || []);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = async () => {
    if (!form.amount) return alert("Enter amount");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // ✅ CONVERT TO USD BEFORE SAVE
    const amountUSD = toUSD(Number(form.amount));

    await supabase.from("expenses").insert([
      {
        user_id: user.id,
        category: form.category,
        amount: amountUSD, // ✅ USD stored
        notes: form.notes,
        created_at: form.date
      }
    ]);

    fetchExpenses();
    setShowForm(false);
  };

  // CURRENT MONTH
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyList = list.filter(e => {
    const d = new Date(e.created_at);
    return d.getMonth() === currentMonth &&
           d.getFullYear() === currentYear;
  });

  const total = monthlyList.reduce((sum, i) => sum + i.amount, 0);

  const categoryOptions = [...new Set(list.map(e => e.category))];

  return (
    <div>
      <h1>Expenses</h1>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>{symbol}{fromUSD(total).toLocaleString()}</h2>
        <p>
          {now.toLocaleString("default", { month: "long", year: "numeric" })} Expenses
        </p>
      </div>

      <button
        className="btn btn-red"
        onClick={() => setShowForm(!showForm)}
      >
        + Add Expense
      </button>

      {showForm && (
        <div className="card">
          <input
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <button onClick={handleAdd}>Save</button>
        </div>
      )}

      {monthlyList.map((e) => (
        <div key={e.id} className="card">
          {e.category} — {symbol}{fromUSD(e.amount).toLocaleString()}
        </div>
      ))}
    </div>
  );
}