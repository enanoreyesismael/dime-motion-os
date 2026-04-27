import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { supabase } from "../lib/supabase";
import AddIncomeForm from "../components/AddIncomeForm";
import AddTransactionForm from "../components/AddTransactionForm";
import { useCurrency } from "../context/CurrencyContext";
import Toast from "../components/Toast";

export default function Dashboard() {
  const [firstName, setFirstName] = useState("");

  const { symbol, convert } = useCurrency();

  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [toast, setToast] = useState(null);

  const monthLabel = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const fetchIncome = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id);

    setIncomes(data || []);
  };

  const fetchExpenses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id);

    setExpenses(data || []);
  };

  useEffect(() => {
    fetchIncome();
    fetchExpenses();

    const channel = supabase
      .channel("realtime-all")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        fetchIncome();
        fetchExpenses();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setFirstName(data.user?.user_metadata?.first_name || "User");
    });
  }, []);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const tithe = totalIncome * 0.1;
  const save = totalIncome * 0.2;

  const availableAllocated = totalIncome * 0.6;
  const availableUsed = expenses
    .filter(e => e.bucket === "Available")
    .reduce((s, e) => s + e.amount, 0);

  const availableRemaining = availableAllocated - availableUsed;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const others = totalIncome * 0.1;

  const now = new Date();
  const totalIncomeThisMonth = incomes
    .filter(i => {
      const d = new Date(i.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, i) => sum + i.amount, 0);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const pieData = [
    { name: "Tithe", value: tithe },
    { name: "Save", value: save },
    { name: "Available", value: availableRemaining },
    { name: "Others", value: others },
  ];

  const COLORS = ["#a855f7", "#10b981", "#3b82f6", "#f59e0b"];
// 🔥 SMART INSIGHT (SAFE ADD)
const totalExpensesMonthly = totalExpenses || 0;
// 👉 Set minimum realistic daily spend
const BASE_DAILY_SPEND = 300;

// 👉 Current average (from your data)
const computedDaily = totalExpensesMonthly / 30;

// 👉 Use whichever is higher (more realistic)
const dailySpend = Math.max(computedDaily, BASE_DAILY_SPEND);

// 👉 Calculate days
const daysLeft = availableRemaining / dailySpend;
let primaryInsight = "";
let alert = "";

if (daysLeft <= 5) {
  primaryInsight = `⚠️ Your money may run out in ${Math.floor(daysLeft)} days`;
  alert = "Reduce spending immediately";
} else if (daysLeft <= 10) {
  primaryInsight = `⚠️ You have about ${Math.floor(daysLeft)} days left`;
  alert = "Watch your spending";
} else {
  primaryInsight = `You're safe for ${Math.floor(daysLeft)} days (@ ${symbol}${convert(dailySpend).toFixed(0)}/day)`;
  alert = "You're on track";
}
  return (
    <div>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontWeight: 600 }}>
            {firstName}'s Wallet
          </h1>
          <p style={{ color: "#64748b", marginTop: 10 }}>
            {monthLabel}
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <button className="btn btn-gray" onClick={() => setShowMenu(!showMenu)}>
            {firstName} ▼
          </button>

          {showMenu && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "110%",
              background: "white",
              borderRadius: 10,
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              padding: 10,
              minWidth: 150
            }}>
              <div style={{ padding: 8 }}>Profile</div>
              <div
                style={{ padding: 8, cursor: "pointer", color: "red" }}
                onClick={() => supabase.auth.signOut()}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOP SECTION */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "0.7fr 2fr",
        gap: 20,
        marginTop: 20
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <ThinCard title="This Month" value={totalIncomeThisMonth} sub={monthLabel} symbol={symbol} convert={convert} />
          <ThinCard title="YTD Income" value={totalIncome} sub="Total earned" symbol={symbol} convert={convert} />
        </div>

        <div className="card" style={{
          background: "linear-gradient(135deg,#3b82f6,#2563eb)",
          color: "white",
          padding: 20,
          borderRadius: 20
        }}>
          <p style={{ opacity: 0.8 }}>AVAILABLE TO SPEND</p>

          <h1 style={{ fontSize: 64, marginTop: 20 }}>
            {symbol}{convert(availableRemaining).toLocaleString()}
          </h1>
<div style={{
  marginTop: 10,
  background: "rgba(255,255,255,0.15)",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: 14,
  textAlign: "center"
}}>
  {primaryInsight}
</div>

<p style={{
  marginTop: 6,
  fontSize: 12,
  opacity: 0.9,
  textAlign: "center"
}}>
  {alert}
</p>
          <p style={{ opacity: 0.8, marginTop: 20 }}>
            Income: {symbol}{convert(totalIncome).toLocaleString()} • Expenses: {symbol}{convert(totalExpenses).toLocaleString()}
          </p>
        </div>
      </div>

      {/* ADD INCOME FORM */}
      {showIncomeForm && (
        <div className="card" style={{ marginTop: 20 }}>
          <AddIncomeForm
            onSuccess={(data) => {
              setShowIncomeForm(false);
              fetchIncome();

              setToast({
                type: "success",
                message: `💰 Income Saved\n${symbol}${convert(data.amount)} - ${data.source}`
    });
  }}
            onCancel={() => setShowIncomeForm(false)}
          />
        </div>
      )}

      {/* ADD TRANSACTION FORM (ONLY ADDITION) */}
      {showTransactionForm && (
        <div className="card" style={{ marginTop: 20 }}>
          <AddTransactionForm
            onClose={() => setShowTransactionForm(false)}
            onSuccess={(data) => {
              setShowTransactionForm(false);
              fetchExpenses();

              setToast({
                type: "success",
                message: `💸 Transaction Saved\n${symbol}${convert(data.amount)} - ${data.category}`
              });
           }}
         />
        </div>
      )}

      {/* MIDDLE */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: 20,
        marginTop: 20
      }}>
        <div className="card">
          <h3>Monthly Allocation</h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart key={refreshKey}>
              <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={100}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div style={{ display: "flex", justifyContent: "center", gap: 25, marginTop: 15 }}>
            {pieData.map((item, i) => (
              <div key={i}>
                <span>{item.name}</span>
                <div>{symbol}{convert(item.value).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <Card title="INCOME" value={symbol + convert(totalIncome).toLocaleString()} />
          <Card title="EXPENSES" value={symbol + convert(totalExpenses).toLocaleString()} />
          <Card title="SAVINGS" value={symbol + convert(save).toLocaleString()} />
        </div>

        {/* QUICK ACTIONS */}
        <div className="card">
          <h3>Quick Actions</h3>

          <button className="btn btn-blue" onClick={() => setShowIncomeForm(true)}>
            + Add Income
          </button>

          <button className="btn btn-green" onClick={() => setShowTransactionForm(true)}>
            + Log Transaction
          </button>

          <button className="btn btn-gray" onClick={() => alert("Go to Goals page")}>
            + Set a Goal
          </button>

          <div style={{ marginTop: 20 }}>
            <p>Emergency Fund</p>
            <div style={{ height: 6, background: "#e5e7eb", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ width: "0%", background: "#3b82f6", height: "100%" }} />
            </div>
            <p style={{ fontSize: 12 }}>
              0% of {symbol}{convert(10000).toLocaleString()}
            </p>
          </div>

          <div style={{ marginTop: 10 }}>
            <p>New Laptop</p>
            <div style={{ height: 6, background: "#e5e7eb", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ width: "0%", background: "#10b981", height: "100%" }} />
            </div>
            <p style={{ fontSize: 12 }}>
              0% of {symbol}{convert(1500).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* RECENT */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Recent Activity</h3>

        {[...incomes, ...expenses]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map((item) => (
            <div key={item.id} className="card" style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <div>
                <strong>{item.source || item.category}</strong>
                <p style={{ fontSize: 12 }}>{item.date}</p>
              </div>
              <h3 style={{ color: item.source ? "#10b981" : "#ef4444" }}>
                {item.source ? "+" : "-"}{symbol}{convert(item.amount).toLocaleString()}
              </h3>
            </div>
          ))}
      </div>
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}
    </div>
  );
}



function Card({ title, value }) {
  return <div className="card"><p>{title}</p><h2>{value}</h2></div>;
}

function ThinCard({ title, value, sub, symbol, convert }) {
  return (
    <div className="card" style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 14, opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
        {symbol}{convert(value).toLocaleString()}
      </div>
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{sub}</div>
    </div>
  );
}