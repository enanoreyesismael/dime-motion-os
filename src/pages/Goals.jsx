import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import { useCurrency } from "../context/CurrencyContext";

import {
  getMonthlyIncome
} from "../utils/finance";

import { computeEmergencyFund } from "../utils/emergencyFund";

import EmergencyFundCard from "../components/EmergencyFundCard";
import MoneyDisplay from "../components/MoneyDisplay";

export default function Goals() {
  const [goals, setGoals] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [wallet, setWallet] =
    useState(null);

  const [incomes, setIncomes] =
    useState([]);

  const { symbol, fromUSD } =
    useCurrency();

  const [showGoalModal, setShowGoalModal] =
  useState(false);

const [goalForm, setGoalForm] =
  useState({
    name: "",

    target: "",

    saved: "",

    target_date: "",

    category: "General",

    priority: "Medium",

    source_type: "auto",

    auto_source:
      "Goals Builder",

    auto_percent: 15,

    notes: "",

    status: "Active"
  });

  const fetchData = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    // GOALS
    const { data: goalData } =
      await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id);

    // EXPENSES
    const {
      data: expenseData
    } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id);

    // WALLET
    const {
      data: walletData
    } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // INCOMES
    const {
      data: incomeData
    } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id);

    setGoals(goalData || []);
    setExpenses(
      expenseData || []
    );
    setWallet(walletData);
    setIncomes(incomeData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // MONTHLY INCOME
  const monthlyIncome =
    getMonthlyIncome(incomes);

  // EMERGENCY FUND
  const emergencyData =
    computeEmergencyFund({
      goals,
      expenses,
      wallet,
      monthlyIncome
    });

    // ADD GOAL
  const handleCreateGoal =
  async () => {

    if (!goalForm.name) {
      alert("Enter goal name");
      return;
    }

    if (
      !goalForm.target ||
      Number(goalForm.target) <= 0
    ) {
      alert(
        "Enter valid target"
      );

      return;
    }

    const {
      data: { user }
    } =
      await supabase.auth.getUser();

    if (!user) return;

    const { error } =
      await supabase
        .from("goals")
        .insert([
          {
            user_id: user.id,

            name:
              goalForm.name,

            target: Number(
              goalForm.target
            ),

            saved: Number(
              goalForm.saved || 0
            ),

            target_date:
              goalForm.target_date,

            category:
              goalForm.category,

            priority:
              goalForm.priority,

            source_type:
              goalForm.source_type,

            auto_source:
              goalForm.auto_source,

            auto_percent:
              Number(
                goalForm.auto_percent
              ),

            notes:
              goalForm.notes,

            status: "Active"
          }
        ]);

    if (error) {
      console.error(error);

      alert(error.message);

      return;
    }

    setShowGoalModal(false);

    fetchData();
  };
      

  // ADD FUNDS
  const handleAddFunds =
    async (goal) => {
      const input = prompt(
        `Add funds to ${goal.name}`
      );

      if (!input) return;

      const amount = Number(
        input
      );

      if (
        isNaN(amount) ||
        amount <= 0
      ) {
        alert(
          "Invalid amount"
        );

        return;
      }

      const newSaved =
        (goal.saved || 0) +
        amount;

      const { error } =
        await supabase
          .from("goals")
          .update({
            saved:
              newSaved
          })
          .eq("id", goal.id);

      if (error) {
        alert(
          "Failed to update goal"
        );

        return;
      }

      fetchData();
    };

  // TOTALS
  const totalSaved =
    goals.reduce(
      (sum, goal) =>
        sum +
        (goal.saved || 0),
      0
    );

  const totalTarget =
    goals.reduce(
      (sum, goal) =>
        sum +
        (goal.target || 0),
      0
    );

  const overallPercent =
    totalTarget > 0
      ? Math.min(
          (totalSaved /
            totalTarget) *
            100,
          100
        )
      : 0;

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <h1
          style={{
            color: "#062B68",
            marginBottom: 4
          }}
        >
          Goals
        </h1>

        <p style={subText}>
          Plan your future and
          build toward it
        </p>
      </div>

      {/* HERO */}
      <div style={heroCard}>
        <div>
          <p style={heroLabel}>
            Combined Goals Progress
          </p>

          <MoneyDisplay
            amount={totalSaved}
            large
            color="white"
            secondaryColor="rgba(255,255,255,0.75)"
          />

          <p style={heroSub}>
            of
          </p>

          <MoneyDisplay
            amount={totalTarget}
            color="white"
            secondaryColor="rgba(255,255,255,0.75)"
          />

          <div
            style={{
              marginTop: 16
            }}
          >
            <div
              style={
                progressBar
              }
            >
              <div
                style={{
                  ...progressFill,
                  width: `${overallPercent}%`,
                  background:
                    "linear-gradient(90deg,#2E9E44,#66CC66)"
                }}
              />
            </div>

            <p
              style={{
                marginTop: 8
              }}
            >
              {Math.round(
                overallPercent
              )}
              % completed
            </p>
          </div>
        </div>

        <div style={heroCircle}>
          🎯
        </div>
      </div>

      {/* ADD GOAL */}
      <button
  style={blueButton}
  onClick={() =>
    setShowGoalModal(true)
  }
>
  + Add New Goal
</button>

{showGoalModal && (
  <div style={modalOverlay}>
    <div style={modalCard}>

      <div style={rowBetween}>
        <div>
          <h2
            style={{
              margin: 0,
              color: "#062B68"
            }}
          >
            🎯 Create Goal
          </h2>

          <p
            style={{
              color: "#64748B",
              marginTop: 6
            }}
          >
            Plan your future with intentional saving
          </p>
        </div>

        <button
          style={closeBtn}
          onClick={() =>
            setShowGoalModal(false)
          }
        >
          ✕
        </button>
      </div>

      <div style={goalFormGrid}>

        <div>
          <label>Goal Name</label>

          <input
            style={input}
            value={goalForm.name}
            onChange={(e) =>
              setGoalForm({
                ...goalForm,
                name: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Category</label>

          <select
            style={input}
            value={goalForm.category}
            onChange={(e) =>
              setGoalForm({
                ...goalForm,
                category: e.target.value
              })
            }
          >
            <option>General</option>
            <option>Travel</option>
            <option>Emergency</option>
            <option>Business</option>
            <option>Car</option>
            <option>House</option>
          </select>
        </div>

        <div>
          <label>Target Amount</label>

          <input
            type="number"
            style={input}
            value={goalForm.target}
            onChange={(e) =>
              setGoalForm({
                ...goalForm,
                target: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Current Saved</label>

          <input
            type="number"
            style={input}
            value={goalForm.saved}
            onChange={(e) =>
              setGoalForm({
                ...goalForm,
                saved: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Target Date</label>

          <input
            type="date"
            style={input}
            value={goalForm.target_date}
            onChange={(e) =>
              setGoalForm({
                ...goalForm,
                target_date:
                  e.target.value
              })
            }
          />
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ color: "#062B68" }}>
          Funding Strategy
        </h3>

        <div style={strategyGrid}>

          {[
            {
              value: "manual",
              title: "Manual Saving"
            },

            {
              value: "auto",
              title:
                "Automatic Allocation"
            },

            {
              value: "hybrid",
              title: "Hybrid"
            }
          ].map((item) => (
            <div
              key={item.value}
              style={{
                ...strategyCard,

                border:
                  goalForm.source_type ===
                  item.value
                    ? "2px solid #2563EB"
                    : "1px solid #CBD5E1"
              }}
              onClick={() =>
                setGoalForm({
                  ...goalForm,
                  source_type:
                    item.value
                })
              }
            >
              <div
                style={{
                  ...radioCircle,

                  background:
                    goalForm.source_type ===
                    item.value
                      ? "#2563EB"
                      : "white"
                }}
              />

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#062B68"
                  }}
                >
                  {item.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={modalActions}>
        <button
          style={cancelBtn}
          onClick={() =>
            setShowGoalModal(false)
          }
        >
          Cancel
        </button>

        <button
          style={createBtn}
          onClick={handleCreateGoal}
        >
          Create Goal
        </button>
      </div>
    </div>
  </div>
)}


      {/* EMERGENCY FUND */}
      <EmergencyFundCard
        data={emergencyData}
        symbol={symbol}
        fromUSD={fromUSD}
        onAddFunds={() =>
          handleAddFunds({
            id:
              emergencyData.id,
            name:
              "Emergency Fund",
            saved:
              emergencyData.saved
          })
        }
        card={securedCard}
        progressBg={
          progressBar
        }
        progressFill={
          progressFill
        }
      />

      {/* GOALS GRID */}
      <div style={goalGrid}>
        {goals.map((goal) => {
          const percent =
            goal.target > 0
              ? Math.min(
                  (goal.saved /
                    goal.target) *
                    100,
                  100
                )
              : 0;

          let gradient =
            "linear-gradient(135deg,#062B68,#0B5ED7)";

          if (percent >= 70)
            gradient =
              "linear-gradient(135deg,#2E9E44,#1F7A34)";

          if (percent >= 100)
            gradient =
              "linear-gradient(135deg,#F4C400,#D9A800)";

          return (
            <div
              key={goal.id}
              style={goalCard}
            >
              {/* TOP */}
              <div
                style={
                  rowBetween
                }
              >
                <div>
                  <h3
                    style={{
                      marginBottom: 6,
                      color:
                        "#062B68"
                    }}
                  >
                    {
                      goal.name
                    }
                  </h3>

                  <p
                    style={{
                      color:
                        "#64748B",
                      fontSize: 13
                    }}
                  >
                    Goal Target
                  </p>
                </div>

                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius:
                      "50%",
                    background:
                      gradient,
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    color:
                      "white",
                    fontSize: 24,
                    fontWeight: 700
                  }}
                >
                  {Math.round(
                    percent
                  )}
                  %
                </div>
              </div>

              {/* VALUE */}
              <div
                style={{
                  marginTop: 18
                }}
              >
                <MoneyDisplay
                  amount={
                    goal.saved
                  }
                  color="#062B68"
                />

                <div
                  style={{
                    marginTop: 6,
                    color:
                      "#64748B"
                  }}
                >
                  Target:
                </div>

                <MoneyDisplay
                  amount={
                    goal.target
                  }
                  color="#64748B"
                />
              </div>

              {/* BAR */}
              <div
                style={{
                  marginTop: 16
                }}
              >
                <div
                  style={
                    progressBar
                  }
                >
                  <div
                    style={{
                      ...progressFill,
                      width: `${percent}%`,
                      background:
                        gradient
                    }}
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div
                style={{
                  marginTop: 18,
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center"
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color:
                      "#64748B"
                  }}
                >
                  {Math.round(
                    percent
                  )}
                  % completed
                </span>

                <button
                  style={
                    addFundsBtn
                  }
                  onClick={() =>
                    handleAddFunds(
                      goal
                    )
                  }
                >
                  + Add Funds
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY */}
      {goals.length === 0 && (
        <div style={emptyCard}>
          <h3
            style={{
              color: "#062B68"
            }}
          >
            No goals yet
          </h3>

          <p
            style={{
              color: "#64748B"
            }}
          >
            Start planning your
            future by creating your
            first goal.
          </p>
        </div>
      )}
    </div>
  );

}
// STYLES

const page = {
  background: "#EEF4FB",
  minHeight: "100vh",
  padding: 20
};

const header = {
  marginBottom: 20
};

const subText = {
  color: "#64748B",
  fontSize: 14
};

const heroCard = {
  background:
    "linear-gradient(135deg,#062B68,#0B5ED7)",
  color: "white",
  padding: 26,
  borderRadius: 24,
  marginBottom: 20,
  boxShadow:
    "0 14px 35px rgba(11,94,215,0.30)",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center"
};

const heroLabel = {
  opacity: 0.9,
  marginBottom: 8
};

const heroSub = {
  opacity: 0.85,
  marginTop: 8,
  marginBottom: 6
};

const heroCircle = {
  width: 90,
  height: 90,
  borderRadius: "50%",
  background:
    "rgba(255,255,255,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 42
};

const blueButton = {
  width: "100%",
  background:
    "linear-gradient(135deg,#062B68,#0B5ED7)",
  color: "white",
  border: "none",
  borderRadius: 16,
  padding: 16,
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: 20,
  boxShadow:
    "0 10px 25px rgba(11,94,215,0.20)"
};

const securedCard = {
  background:
    "linear-gradient(135deg,#ECFDF5,#EFF6FF)",
  padding: 22,
  borderRadius: 22,
  marginBottom: 20,
  border: "1px solid #D1FAE5",
  boxShadow:
    "0 8px 25px rgba(0,0,0,0.05)"
};

const goalGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px,1fr))",
  gap: 18
};

const goalCard = {
  background: "#FFFFFF",
  padding: 22,
  borderRadius: 24,
  boxShadow:
    "0 10px 28px rgba(0,0,0,0.06)"
};

const rowBetween = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center"
};

const progressBar = {
  height: 10,
  background: "#E5E7EB",
  borderRadius: 999,
  overflow: "hidden"
};

const progressFill = {
  height: "100%",
  borderRadius: 999,
  transition: "0.3s"
};

const addFundsBtn = {
  background:
    "linear-gradient(135deg,#2E9E44,#1F7A34)",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 600,
  cursor: "pointer"
};

const emptyCard = {
  background: "#FFFFFF",
  padding: 30,
  borderRadius: 24,
  textAlign: "center",
  marginTop: 20,
  boxShadow:
    "0 8px 25px rgba(0,0,0,0.06)"
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999
};

const modalCard = {
  width: "95%",
  maxWidth: 850,
  maxHeight: "92vh",
  overflowY: "auto",
  background: "white",
  borderRadius: 30,
  padding: 30,
  boxShadow:
    "0 25px 60px rgba(0,0,0,0.25)"
};

const closeBtn = {
  border: "none",
  background: "#EEF4FB",
  width: 40,
  height: 40,
  borderRadius: "50%",
  cursor: "pointer"
};

const goalFormGrid = {
  display: "grid",
  gridTemplateColumns:
    window.innerWidth < 768
      ? "1fr"
      : "1fr 1fr",
  gap: 18,
  marginTop: 24
};

const input = {
  width: "100%",
  marginTop: 8,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #CBD5E1",
  fontSize: 15
};

const strategyGrid = {
  display: "grid",
  gridTemplateColumns:
    window.innerWidth < 768
      ? "1fr"
      : "1fr 1fr 1fr",
  gap: 16,
  marginTop: 18
};

const strategyCard = {
  padding: 18,
  borderRadius: 18,
  cursor: "pointer",
  display: "flex",
  gap: 14,
  alignItems: "center"
};

const radioCircle = {
  width: 18,
  height: 18,
  borderRadius: "50%",
  border: "2px solid #2563EB"
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 14,
  marginTop: 32
};

const cancelBtn = {
  padding: "14px 22px",
  borderRadius: 14,
  border: "none",
  background: "#E2E8F0",
  cursor: "pointer",
  fontWeight: 700
};

const createBtn = {
  padding: "14px 22px",
  borderRadius: 14,
  border: "none",
  background:
    "linear-gradient(135deg,#062B68,#0B5ED7)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700
};
