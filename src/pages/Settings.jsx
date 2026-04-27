import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function Settings() {
  const [currency, setCurrencyLocal] = useState("PHP");
  const { setCurrency } = useCurrency();

  const [alloc, setAlloc] = useState({
    tithe: 10,
    save: 20,
    available: 60,
    others: 10
  });

  const [editMode, setEditMode] = useState(false);
  const [tempAlloc, setTempAlloc] = useState(alloc);

  const [aiAlloc, setAiAlloc] = useState(null);
  const [aiMessage, setAiMessage] = useState("Analyzing...");

  const currencies = [
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "JPY", label: "Japanese Yen", symbol: "¥" },
    { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
    { code: "AUD", label: "Australian Dollar", symbol: "A$" },
    { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
    { code: "INR", label: "Indian Rupee", symbol: "₹" },
    { code: "BRL", label: "Brazilian Real", symbol: "R$" },
    { code: "MXN", label: "Mexican Peso", symbol: "MX$" },
    { code: "ZAR", label: "South African Rand", symbol: "R" },
    { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
    { code: "GHS", label: "Ghanaian Cedi", symbol: "GH₵" },
    { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
    { code: "EGP", label: "Egyptian Pound", symbol: "E£" },
    { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
    { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
    { code: "PHP", label: "Philippine Peso", symbol: "₱" },
    { code: "IDR", label: "Indonesian Rupiah", symbol: "Rp" },
  ];

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        if (data.currency) setCurrencyLocal(data.currency);

        const loaded = {
          tithe: data.tithe ?? 10,
          save: data.save ?? 20,
          available: data.available ?? 60,
          others: data.others ?? 10
        };

        setAlloc(loaded);
        setTempAlloc(loaded);
      }
    };

    loadSettings();
  }, []);

  // 🔥 AUTO AI
  useEffect(() => {
    const analyze = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id);

      if (!expenses || expenses.length === 0) {
        const fallback = { tithe: 10, save: 25, available: 55, others: 10 };
        setAiAlloc(fallback);
        setAiMessage("Start strong with this setup");
        return;
      }

      const total = expenses.reduce((s, e) => s + e.amount, 0);

      const availableSpent = expenses
        .filter(e => e.bucket === "Available")
        .reduce((s, e) => s + e.amount, 0);

      const ratio = availableSpent / total;

      if (ratio > 0.7) {
        setAiAlloc({ tithe: 10, save: 30, available: 50, others: 10 });
        setAiMessage("You’re overspending → boost savings");
      } else if (ratio < 0.4) {
        setAiAlloc({ tithe: 10, save: 25, available: 55, others: 10 });
        setAiMessage("Great discipline → optimized growth");
      } else {
        setAiAlloc({ tithe: 10, save: 20, available: 60, others: 10 });
        setAiMessage("Balanced → maintain system");
      }
    };

    analyze();
  }, []);

  const handleCurrencyChange = async (code) => {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("user_settings").upsert(
      { user_id: user.id, currency: code },
      { onConflict: "user_id" }
    );

    setCurrencyLocal(code);
    setCurrency(code);
  };

  const normalizeAlloc = (data) => {
    let total = Object.values(data).reduce((a, b) => a + Number(b || 0), 0);
    if (total === 100) return data;

    return {
      ...data,
      available: Math.max(0, data.available + (100 - total))
    };
  };

  const saveAlloc = async () => {
    const finalAlloc = normalizeAlloc(tempAlloc);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("user_settings").upsert(
      { user_id: user.id, ...finalAlloc },
      { onConflict: "user_id" }
    );

    setAlloc(finalAlloc);
    setTempAlloc(finalAlloc);
    setEditMode(false);
  };

  return (
    <div>
      <h1>⚙️ Settings</h1>
      <p style={{ color: "#64748b" }}>
        Customize your currency and budget allocation
      </p>

      {/* CURRENCY */}
      <div className="card" style={{ marginTop: 20, padding: 20, borderRadius: 20 }}>
        <h2 style={{ marginBottom: 20 }}>💲 Currency</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 }}>
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => handleCurrencyChange(c.code)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 15,
                borderRadius: 12,
                border: currency === c.code ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                background: currency === c.code ? "#eff6ff" : "white",
                cursor: "pointer",
                fontWeight: currency === c.code ? 600 : 400
              }}
            >
              <span>{c.symbol}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ALLOCATION */}
      <div className="card" style={{ marginTop: 20, padding: 20, borderRadius: 20 }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          🎯 Allocation Settings (%)
        </h2>

        {/* 🔥 AI BUTTON WITH VALUES */}
        <div style={{ textAlign: "center", marginBottom: 15 }}>
          <button
            className="btn btn-green"
            style={{ lineHeight: 1.4, fontSize: 25 }}
            onClick={() => {
              if (aiAlloc) {
                setTempAlloc(aiAlloc);
                setEditMode(true);
              }
            }}
          >
            🤖 {aiMessage}
            {aiAlloc && (
              <div style={{ fontSize: 12, marginTop: 4, color: "blue" }}>
                (SUGGESTION) Make allocation to :  Tithe:{aiAlloc.tithe}% Savings:{aiAlloc.save}% Available:{aiAlloc.available}%  Others:{aiAlloc.others}%
              </div>
            )}
          </button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          textAlign: "center",
          gap: 10
        }}>
          {["tithe", "save", "available", "others"].map((key) => (
            <div key={key}>
              <div style={{ opacity: 0.7 }}>{key}</div>

              {!editMode ? (
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  {alloc[key]}%
                </div>
              ) : (
                <input
                  type="number"
                  value={tempAlloc[key]}
                  style={{ width: 70, textAlign: "center" }}
                  onChange={(e) =>
                    setTempAlloc({
                      ...tempAlloc,
                      [key]: Number(e.target.value)
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          {!editMode ? (
            <button className="btn btn-gray" onClick={() => setEditMode(true)}>
              Change Allocation
            </button>
          ) : (
            <button className="btn btn-blue" onClick={saveAlloc}>
              Save Allocation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}