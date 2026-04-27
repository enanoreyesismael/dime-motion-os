import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const [list, setList] = useState([]);

  const { symbol, convert } = useCurrency(); // ✅ added convert

  const [form, setForm] = useState({
    category: "Food",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    setList(data || []);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = async () => {
    if (!form.amount) return alert("Enter amount");

    await supabase.from("expenses").insert([
      {
        ...form,
        amount: Number(form.amount)
      }
    ]);

    fetchExpenses();
    setShowForm(false);
  };

  const total = list.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      <h1>Expenses</h1>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>{symbol}{convert(total).toLocaleString()}</h2>
        <p>Total Expenses</p>
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

      {list.map((e) => (
        <div key={e.id} className="card">
          {e.category} — {symbol}{convert(e.amount).toLocaleString()}
        </div>
      ))}
    </div>
  );
}