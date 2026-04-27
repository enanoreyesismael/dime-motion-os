import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import {
  Target,
  CheckCircle,
  Pause,
  Plus,
  Pencil,
  Wallet
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";


export default function Goals() {
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [goals, setGoals] = useState([]);
  const [incomes, setIncomes] = useState([]);

  const { symbol, convert } = useCurrency();

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: incomeData } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id);

    setGoals(data || []);
    setIncomes(incomeData || []);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const getEmergencyFund = () => {
    if (!incomes.length) return null;

    const monthly = {};
    incomes.forEach(i => {
      const month = new Date(i.date).toISOString().slice(0, 7);
      monthly[month] = (monthly[month] || 0) + i.amount;
    });

    const highest = Math.max(...Object.values(monthly), 0);
    if (!highest) return null;

    const existing = goals.find(g => g.name === "Emergency Fund");
    const saved = existing?.saved || 0;

    const multiplier = Math.max(6, Math.ceil(saved / highest));
    const target = highest * multiplier;

    const monthsCovered = saved / highest;
    const daysCovered = Math.floor(monthsCovered * 30);

    const percent = Math.min(100, Math.round((saved / target) * 100));

    return {
      saved,
      target,
      percent,
      monthsCovered,
      daysCovered,
      targetMonths: multiplier
    };
  };

  const emergency = getEmergencyFund();

  const enhancedGoals = goals
    .filter(g => g.name !== "Emergency Fund")
    .map(g => {
      const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
      let status = "Active";
      if (percent >= 100) status = "Completed";
      return { ...g, percent, status };
    });

  const filteredGoals =
    filter === "All"
      ? enhancedGoals
      : enhancedGoals.filter(g => g.status === filter);

  const active = enhancedGoals.filter(g => g.status === "Active").length;
  const completed = enhancedGoals.filter(g => g.status === "Completed").length;
  const paused = enhancedGoals.filter(g => g.status === "Paused").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          

<PageHeader
  
  title="🎯 Goals"
  subtitle="Track your financial milestones"
  
/>
        </div>

        <button
          className="btn btn-blue"
          style={{ width: "auto", display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          New Goal
        </button>
      </div>

      {/* SUMMARY */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20 }}>
        <SummaryCard icon={<Target size={18} />} value={active} label="Active" />
        <SummaryCard icon={<CheckCircle size={18} />} value={completed} label="Completed" />
        <SummaryCard icon={<Pause size={18} />} value={paused} label="Paused" />
      </div>

      {/* 🔥 EMERGENCY FUND */}
{emergency && (
  <div className="card" style={{ marginTop: 20, padding: 16 }}>

    {/* HEADER */}
    <div style={{
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center"
}}>

  {/* LEFT */}
  <h2 style={{ margin: 0 }}>
    🛡️ Secured You
  </h2>

  {/* CENTER */}
  <div style={{
    textAlign: "center",
    fontSize: 20,
    color: "#64748b",
    fontWeight: 500
  }}>
    Emergency Fund Goal
  </div>

  {/* RIGHT */}
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <button
      className="btn btn-green"
      style={{ width: "auto", display: "flex", gap: 6, alignItems: "center" }}
    >
      <Wallet size={14} /> Add Funds
    </button>
  </div>

</div>

    {/* SAVED */}
    <p style={{ marginTop: 6 }}>
      {symbol}{convert(emergency.saved).toLocaleString()} saved of {symbol}{convert(Math.round(emergency.target)).toLocaleString()}
    </p>

    {/* PROGRESS BAR */}
    <div style={{ marginTop: 10 }}>
      <div style={{ height: 10, background: "#e5e7eb", borderRadius: 10 }}>
        <div
          style={{
            width: `${emergency.percent}%`,
            height: "100%",
            background: emergency.percent === 0 ? "#cbd5f5" : "#3b82f6",
            borderRadius: 10
          }}
        />
      </div>
    </div>

    {/* PERCENT */}
    <div style={{
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  marginTop: 8
}}>

  {/* LEFT (empty spacer) */}
  <div />

  {/* CENTER → STATUS */}
  <div style={{ textAlign: "center" }}>
    <span style={{
      fontSize: 12,
      padding: "4px 8px",
      borderRadius: 6,
      background:
        emergency.percent >= 100 ? "#dcfce7" :
        emergency.percent >= 60 ? "#dbeafe" :
        "#fef3c7",
      color:
        emergency.percent >= 100 ? "#166534" :
        emergency.percent >= 60 ? "#1d4ed8" :
        "#92400e"
    }}>
      {emergency.percent >= 100
        ? "Fully Secured"
        : emergency.percent >= 60
        ? "On Track"
        : "Building Protection"}
    </span>
  </div>

  {/* RIGHT → PERCENT */}
  <div style={{
    display: "flex",
    justifyContent: "flex-end",
    fontSize: 12
  }}>
    {emergency.percent}% complete
  </div>

</div>

    {/* COVERAGE */}
    <div style={{ marginTop: 12 }}>
      <h3 style={{ margin: 0 }}>
  You are currently{" "}
  <span style={{
    color: "#3b82f6",
    fontWeight: 600
  }}>
    {emergency.monthsCovered.toFixed(1)} months : {emergency.daysCovered} days
  </span>{" "}
  covered
</h3>

      <p style={{ fontSize: 12, color: "#64748b" }}>
        Goal: Reach {emergency.targetMonths} months of protection.
      </p>
    </div>

    {/* NEXT STEP */}
    <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
      Adding {symbol}{convert(Math.ceil((emergency.target - emergency.saved) * 0.1)).toLocaleString()} will extremely improve coverage
    </p>

  </div>
)}

      {showForm && (
        <AddGoalModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            fetchGoals();
            setShowForm(false);
          }}
        />
      )}

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {["All", "Active", "Completed"].map((f) => (
          <button
            key={f}
            className="btn"
            style={{
              width: "auto",
              padding: "8px 14px",
              background: filter === f ? "#3b82f6" : "#e5e7eb",
              color: filter === f ? "white" : "black"
            }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* GOALS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 20 }}>
        {filteredGoals.map((goal) => {
          const percent = goal.percent;

          const color =
            percent >= 100
              ? "#10b981"
              : percent >= 60
              ? "#3b82f6"
              : "#f59e0b";

          const statusLabel =
            percent >= 100
              ? "Completed"
              : percent >= 60
              ? "On Track"
              : "Getting Started";

          const nextStep = percent === 0
            ? Math.ceil(goal.target * 0.02)
            : Math.ceil((goal.target - goal.saved) * 0.1);

          return (
            <div key={goal.id} className="card" style={{ padding: 16 }}>

              {/* HEADER */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>{goal.name}</h3>
                <strong>{percent}%</strong>
              </div>

              {/* TARGET */}
              <p style={{ fontSize: 12, color: "#64748b" }}>
                Target: {symbol}{convert(goal.target).toLocaleString()}
              </p>

              {/* SAVED */}
              <p style={{ marginTop: 6 }}>
                {symbol}{convert(goal.saved).toLocaleString()} saved
              </p>

              {/* PROGRESS */}
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 8, background: "#e5e7eb", borderRadius: 10 }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: percent === 0 ? "#cbd5f5" : color,
                      borderRadius: 10
                    }}
                  />
                </div>
              </div>

              {/* STATUS */}
              <div style={{ marginTop: 8 }}>
                <span style={{
                  fontSize: 12,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background:
                    percent >= 100 ? "#dcfce7" :
                    percent >= 60 ? "#dbeafe" :
                    "#fef3c7",
                  color:
                    percent >= 100 ? "#166534" :
                    percent >= 60 ? "#1d4ed8" :
                    "#92400e"
                }}>
                  {statusLabel}
                </span>
              </div>

              {/* NEXT STEP */}
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                Add {symbol}{convert(nextStep).toLocaleString()} to move forward
              </p>

              {/* ACTION */}
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-green" style={{ width: "100%", display: "flex", justifyContent: "center", gap: 6 }}>
                  <Wallet size={14} />
                  Add Funds
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

/* SAME COMPONENTS */

function SummaryCard({ icon, value, label }) {
  const colorMap = {
    Active: "#3b82f6",
    Completed: "#10b981",
    Paused: "#f59e0b"
  };

  const color = colorMap[label] || "#64748b";

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{
        marginBottom: 8,
        background: `${color}15`,
        color,
        display: "inline-flex",
        padding: 8,
        borderRadius: 10
      }}>
        {icon}
      </div>

      <h2>{value}</h2>
      <p>{label}</p>
    </div>
  );
}

function AddGoalModal({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const handleSave = async () => {
    if (!name || !target) return alert("Fill all fields");

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("goals").insert([
      {
        name,
        target: Number(target),
        saved: 0,
        user_id: user.id
      }
    ]);

    onSaved();
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3>Add Goal</h3>

      <input
        placeholder="Goal name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginTop: 10 }}
      />

      <input
        type="number"
        placeholder="Target amount"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        style={{ marginTop: 10 }}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
        <button className="btn btn-blue" onClick={handleSave}>
          Save
        </button>
        <button className="btn btn-gray" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}