import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddTransactionForm({ onClose }) {
  const [form, setForm] = useState({
    category: "Food",
    bucket: "Available",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const handleSave = async () => {
    if (!form.amount) return alert("Enter amount");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Not logged in");

    const { error } = await supabase.from("expenses").insert([
      {
        category: form.category,
        bucket: form.bucket,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes,
        user_id: user.id
      }
    ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // ✅ FIXED: use form values
    onClose({
      amount: form.amount,
      category: form.category
    });
  };

  return (
    <div
      className="card"
      style={{
        width: "100%",
        maxWidth: "100%",
        padding: 24,
        borderRadius: 16
      }}
    >
      <h3>Add Transaction</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        
        <div>
          <label>Category</label>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        <div>
          <label>Bucket</label>
          <select
            value={form.bucket}
            onChange={(e) => setForm({ ...form, bucket: e.target.value })}
          >
            <option>Available</option>
            <option>Others</option>
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

        <div style={{ gridColumn: "1 / span 2" }}>
          <label>Notes</label>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-blue" onClick={handleSave}>
          Save
        </button>

        <button
          className="btn btn-gray"
          onClick={() => onClose && onClose()}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}