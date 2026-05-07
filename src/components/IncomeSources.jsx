import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function IncomeSources({ onSelectSource }) {
  const [sources, setSources] = useState([]);
  const [incomes, setIncomes] = useState([]);

  const { symbol, fromUSD } = useCurrency();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: src } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", user.id);

    const { data: inc } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id);

    setSources(src || []);
    setIncomes(inc || []);
  };

  // 🔥 CURRENT MONTH FILTER
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();

  const monthly = incomes.filter(i => {
    const d = new Date(i.created_at);
    return d.getMonth() === m && d.getFullYear() === y;
  });

  const total = monthly.reduce((s, i) => s + i.amount, 0);

  const getSourceTotal = (name) => {
    return monthly
      .filter(i => i.source === name)
      .reduce((s, i) => s + i.amount, 0);
  };

  return (
    <div style={{ marginTop: 20 }}>
        
        {/* 🔵 TOTAL CARD */}
      <div className="card" style={{
        marginBottom: 15,
        background: "linear-gradient(135deg,#3b82f6,#2563eb)",
        color: "white"
      }}>
        <h3>Total Income</h3>
        <h1>{symbol}{fromUSD(total).toLocaleString()}</h1>
      </div>

      {/* 🟢 SOURCE CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
        gap: 10
      }}>

        {sources.map(src => (
          <div
            key={src.id}
            className="card"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectSource(src.name)}
          >
            <p>{src.name}</p>
            <h3>{symbol}{fromUSD(getSourceTotal(src.name)).toLocaleString()}</h3>
          </div>
        ))}

        {/* ➕ ADD SOURCE */}
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: "#f1f5f9"
          }}
          onClick={async () => {
            const name = prompt("Enter new income source");
            if (!name) return;

            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from("income_sources").insert([
              {
                user_id: user.id,
                name
              }
            ]);

            fetchData();
          }}
        >
          + Add Source
        </div>

      </div>
    </div>
  );
}