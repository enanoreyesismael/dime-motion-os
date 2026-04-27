import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function Others() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const { symbol, convert } = useCurrency(); // ✅ added convert

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: catData } = await supabase
      .from("others_categories")
      .select("*")
      .eq("user_id", user.id);

    const { data: expData } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .eq("bucket", "Others");

    setCategories(catData || []);
    setExpenses(expData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 CALCULATE USAGE
  const getUsed = (name) => {
    return expenses
      .filter(e => e.category === name)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div>
      <h1>Others</h1>
      <p>Manage discretionary spending</p>

      {/* CATEGORY CARDS */}
      <div style={{ marginTop: 20, display: "grid", gap: 20 }}>
        {categories.map(cat => {
          const used = getUsed(cat.name);
          const percent = cat.limit_amount
            ? (used / cat.limit_amount) * 100
            : 0;

          return (
            <div className="card" key={cat.id}>
              <h3>{cat.name}</h3>

              <p>{symbol}{convert(used).toLocaleString()} used</p>

              {/* PROGRESS BAR */}
              <div style={{
                height: 10,
                background: "#eee",
                borderRadius: 5,
                marginTop: 10
              }}>
                <div style={{
                  width: `${percent}%`,
                  background: percent > 100 ? "red" : "#10b981",
                  height: "100%",
                  borderRadius: 5
                }} />
              </div>

              <p style={{ marginTop: 10 }}>
                Limit: {symbol}{convert(cat.limit_amount).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}