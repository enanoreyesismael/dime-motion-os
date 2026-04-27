import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddIncomeForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    source: "Salary",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const handleAdd = async () => {
    if (!form.amount) return alert("Enter amount");

    // 🔹 Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    // 🔹 Insert with user_id
    const { error } = await supabase.from("incomes").insert([
      {
        ...form,
        amount: Number(form.amount),
        user_id: user.id
      }
    ]);

    if (error) {
      console.error(error);
      alert("Error saving income");
      return;
    }

    onSaved?.();
    onClose( {amount, source} );
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3>Add Income</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        
        <div>
          <label>Source</label>
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          >
            <option>Salary</option>
            <option>Freelance</option>
            <option>Business</option>
            <option>Investment</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label>Amount</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        <div>
          <label>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div>
          <label>Notes</label>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

      </div>

      <div style={{ marginTop: 20, marginLeft: 10 }}>
        <button className="btn btn-blue" onClick={handleAdd}>
          Save Income
        </button>

        <button
          className="btn btn-gray"
          onClick={() => onCancel && onCancel()}
          style={{ marginLeft: 10 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}