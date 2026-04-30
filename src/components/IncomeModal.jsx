import { useState } from "react";
import { supabase } from "../services/supabase";

export default function IncomeModal({ user, onClose }) {
  const [amount, setAmount] = useState("");

  const save = async () => {
    if (!amount) return alert("Enter amount");

    await supabase.from("incomes").insert([
      {
        user_id: user.id,
        amount: Number(amount),
        source: "Salary",
      },
    ]);

    onClose();
    window.location.reload();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{ background: "#fff", padding: 20 }}>
        <h2>Add Income</h2>

        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <br /><br />

        <button onClick={save}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}