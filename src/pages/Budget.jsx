import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import MoneyDisplay from "../components/MoneyDisplay";

export default function Budget() {
  const [openBucket, setOpenBucket] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [wallet, setWallet] =
    useState(null);

  const [settings, setSettings] =
    useState(null);

  const [expenses, setExpenses] =
    useState([]);

  const [goals, setGoals] =
    useState([]);

  const [form, setForm] = useState({
  name: "",
  target: "",
  saved: "",

  target_date: "",

  category: "General",

  priority: "Medium",

  source_type: "manual",

  auto_source: "Goals Builder",

  auto_percent: 0,

  notes: "",

  status: "Active"
});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData =
  async () => {
    setLoading(true);

    const {
      data: { user }
    } =
      await supabase.auth.getUser();

    if (!user) return;

    // WALLET
    const {
      data: walletData
    } = await supabase
      .from("wallets")
      .select("*")
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

    // SETTINGS
    const {
      data: settingsData
    } = await supabase
      .from(
        "user_settings"
      )
      .select("*")
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

    // EXPENSES
    const {
      data: expensesData
    } = await supabase
      .from("expenses")
      .select("*")
      .eq(
        "user_id",
        user.id
      )
      .order(
        "created_at",
        { ascending: false }
      );

    // GOALS
    const {
      data: goalsData
    } = await supabase
      .from("goals")
      .select("*")
      .eq(
        "user_id",
        user.id
      );

    setWallet(walletData);

    setSettings(
      settingsData
    );

    setExpenses(
      expensesData || []
    );

    setGoals(goalsData || []);

    setLoading(false);
  };

  const buckets = [
    {
      name: "Available",

      percent: Math.round(
        (settings?.available_rate ||
          0.6) * 100
      ),

      amount:
        wallet?.available_balance ??
        0,

      description:
        "Daily spending and lifestyle expenses",

      insight:
        "Used for expenses and transactions",

      color:
        "linear-gradient(135deg,#2563EB,#3B82F6)"
    },

    {
      name: "Savings",

      percent: Math.round(
        (settings?.savings_rate ||
          0.15) * 100
      ),

      amount:
        wallet?.savings_balance ??
        0,

      description:
        "Protection and future support reserve",

      insight:
        "Building long-term financial security",

      color:
        "linear-gradient(135deg,#059669,#10B981)"
    },

    {
      name: "Goals Builder",

      percent: Math.round(
        (settings?.goals_rate ||
          0.15) * 100
      ),

      amount:
        wallet?.goals_balance ??
        0,

      description:
        "Dreams, goals, and future planning",

      insight:
        "Funds future goals automatically",

      color:
        "linear-gradient(135deg,#F59E0B,#FACC15)"
    },

    {
      name: "Tithe",

      percent: Math.round(
        (settings?.tithe_rate ||
          0.10) * 100
      ),

      amount:
        wallet?.tithe_balance ??
        0,

      description:
        "Giving, church, charity, and generosity",

      insight:
        "Reserved for giving and contribution",

      color:
        "linear-gradient(135deg,#9333EA,#A855F7)"
    }
  ];

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <h1
          style={{
            margin: 0,
            color: "#062B68"
          }}
        >
          🎯 Budget System
        </h1>

        <p style={subText}>
          Your income is
          automatically organized
          into intentional
          financial buckets
        </p>
      </div>

      {/* INSIGHT */}
      <div style={insightCard}>
        💡 Current Allocation:
        {" "}
        <strong>
          {buckets[0].percent}%
        </strong>{" "}
        Available •{" "}
        <strong>
          {buckets[1].percent}%
        </strong>{" "}
        Savings •{" "}
        <strong>
          {buckets[2].percent}%
        </strong>{" "}
        Goals •{" "}
        <strong>
          {buckets[3].percent}%
        </strong>{" "}
        Tithe
      </div>

      {/* BUCKETS */}
      <div style={grid}>
        {buckets.map((bucket) => {
          const total =
            Number(
              wallet?.available_balance ||
                0
            ) +
            Number(
              wallet?.savings_balance ||
                0
            ) +
            Number(
              wallet?.goals_balance ||
                0
            ) +
            Number(
              wallet?.tithe_balance ||
                0
            );

          const progress =
            total > 0
              ? (bucket.amount /
                  total) *
                100
              : 0;

          return (
            <div
              key={bucket.name}
              style={{
                ...card,

                background:
                  bucket.color
              }}
            >
              {/* TOP */}
              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "flex-start",

                  gap: 16
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,

                      color:
                        "white"
                    }}
                  >
                    {
                      bucket.name
                    }
                  </h2>

                  <p
                    style={{
                      color:
                        "rgba(255,255,255,0.82)",

                      marginTop: 8,

                      fontSize: 13,

                      lineHeight: 1.5
                    }}
                  >
                    {
                      bucket.description
                    }
                  </p>
                </div>

                <div
                  style={{
                    background:
                      "rgba(255,255,255,0.18)",

                    padding:
                      "8px 12px",

                    borderRadius: 999,

                    color:
                      "white",

                    fontWeight: 700,

                    fontSize: 14
                  }}
                >
                  {
                    bucket.percent
                  }
                  %
                </div>
              </div>

              {/* AMOUNT */}
              <div
                style={{
                  marginTop: 24
                }}
              >
                <MoneyDisplay
                  amount={
                    bucket.amount
                  }
                  large
                  color="white"
                  secondaryColor="rgba(255,255,255,0.75)"
                />
              </div>

              <div
                style={{
                  marginTop: 8,

                  color:
                    "rgba(255,255,255,0.75)",

                  fontSize: 13
                }}
              >
                Current bucket
                balance
              </div>

              {/* PROGRESS */}
              <div
                style={{
                  marginTop: 20
                }}
              >
                <div
                  style={{
                    height: 10,

                    background:
                      "rgba(255,255,255,0.18)",

                    borderRadius: 999,

                    overflow:
                      "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,

                      height:
                        "100%",

                      background:
                        "rgba(255,255,255,0.95)",

                      borderRadius: 999
                    }}
                  />
                </div>
              </div>

              {/* ACTION */}
              <div
                style={{
                  marginTop: 20
                }}
              >
                <button
                  style={
                    expandButton
                  }
                  onClick={() =>
                    setOpenBucket(
                      openBucket ===
                        bucket.name
                        ? null
                        : bucket.name
                    )
                  }
                >
                  {openBucket ===
                  bucket.name
                    ? "Hide Details"
                    : "View Details"}
                </button>
              </div>

              {/* EXPANDED */}
{openBucket ===
  bucket.name && (
  <div
    style={{
      marginTop: 20,

      background:
        "rgba(255,255,255,0.12)",

      borderRadius: 18,

      padding: 16
    }}
  >
    {/* AVAILABLE */}
    {bucket.name ===
      "Available" && (
      <>
        <div
          style={detailTitle}
        >
          Recent Expenses
        </div>

        {expenses.length ===
        0 ? (
          <div
            style={
              detailEmpty
            }
          >
            No expenses yet
          </div>
        ) : (
          expenses
            .slice(0, 5)
            .map((e) => (
              <div
                key={e.id}
                style={
                  detailItem
                }
              >
                <span>
                  {
                    e.category
                  }
                </span>

                <MoneyDisplay
                  amount={
                    e.amount
                  }
                  color="white"
                  secondaryColor="rgba(255,255,255,0.7)"
                />
              </div>
            ))
        )}

        <div
          style={remainingBox}
        >
          Remaining Available
          <MoneyDisplay
            amount={
              wallet?.available_balance ||
              0
            }
            color="white"
            secondaryColor="rgba(255,255,255,0.7)"
          />
        </div>
      </>
    )}

    {/* SAVINGS */}
    {bucket.name ===
      "Savings" && (
      <>
        <div
          style={detailTitle}
        >
          Savings Allocation
        </div>

        <div
          style={detailItem}
        >
          <span>
            Emergency Fund
          </span>

          <MoneyDisplay
            amount={
              wallet?.savings_balance ||
              0
            }
            color="white"
            secondaryColor="rgba(255,255,255,0.7)"
          />
        </div>

        <div
          style={remainingBox}
        >
          Protected Savings
          <MoneyDisplay
            amount={
              wallet?.savings_balance ||
              0
            }
            color="white"
            secondaryColor="rgba(255,255,255,0.7)"
          />
        </div>
      </>
    )}

    {/* GOALS */}
    {bucket.name ===
      "Goals Builder" && (
      <>
        <div
          style={detailTitle}
        >
          Goal Allocations
        </div>

        {goals.length ===
        0 ? (
          <div
            style={
              detailEmpty
            }
          >
            No goals yet
          </div>
        ) : (
          goals.map(
            (goal) => (
              <div
                key={
                  goal.id
                }
                style={
                  detailItem
                }
              >
                <span>
                  {
                    goal.name
                  }
                </span>

                <MoneyDisplay
                  amount={
                    goal.saved ||
                    0
                  }
                  color="white"
                  secondaryColor="rgba(255,255,255,0.7)"
                />
              </div>
            )
          )
        )}

        <div
          style={remainingBox}
        >
          Remaining Goal Funds
          <MoneyDisplay
            amount={
              wallet?.goals_balance ||
              0
            }
            color="white"
            secondaryColor="rgba(255,255,255,0.7)"
          />
        </div>
      </>
    )}

    {/* TITHE */}
    {bucket.name ===
      "Tithe" && (
      <>
        <div
          style={detailTitle}
        >
          Giving Allocation
        </div>

        <div
          style={detailItem}
        >
          <span>
            Reserved Giving
          </span>

          <MoneyDisplay
            amount={
              wallet?.tithe_balance ||
              0
            }
            color="white"
            secondaryColor="rgba(255,255,255,0.7)"
          />
        </div>

        <div
          style={remainingBox}
        >
          Available Giving
          <MoneyDisplay
            amount={
              wallet?.tithe_balance ||
              0
            }
            color="white"
            secondaryColor="rgba(255,255,255,0.7)"
          />
        </div>
      </>
    )}
  </div>
)}
            </div>
          );
        })}
      </div>

      {/* INFO */}
      <div style={infoCard}>
        <h3
          style={{
            marginTop: 0,
            color: "#062B68"
          }}
        >
          💡 Why This Matters
        </h3>

        <p
          style={{
            color: "#475569",
            lineHeight: 1.8
          }}
        >
          DimeMotion helps you
          separate spending,
          savings, goals, and
          giving automatically so
          your money always has
          purpose and direction.
        </p>
      </div>
    </div>
  );
}

// STYLES

const page = {
  padding: 20,
  background: "#EEF4FB",
  minHeight: "100vh"
};

const header = {
  marginBottom: 24
};

const subText = {
  color: "#64748B",
  marginTop: 8
};

const insightCard = {
  background:
    "linear-gradient(135deg,#062B68,#0B5ED7)",

  color: "white",

  padding: 18,

  borderRadius: 20,

  marginBottom: 24,

  boxShadow:
    "0 10px 30px rgba(11,94,215,0.25)"
};

const grid = {
  display: "grid",

  // ✅ FIXED TRUE 2x2 LAYOUT
  gridTemplateColumns:
    window.innerWidth < 768
      ? "1fr"
      : "1fr 1fr",

  gap: 20,

  alignItems: "stretch"
};

const card = {
  borderRadius: 28,

  padding: 24,

  boxShadow:
    "0 18px 40px rgba(0,0,0,0.08)"
};

const expandButton = {
  width: "100%",

  border: "none",

  borderRadius: 14,

  padding: "14px 16px",

  background:
    "rgba(255,255,255,0.16)",

  color: "white",

  fontWeight: 700,

  cursor: "pointer",

  backdropFilter:
    "blur(10px)"
};

const manageButton = {
  width: "100%",

  marginTop: 16,

  border: "none",

  borderRadius: 14,

  padding: "14px 16px",

  background:
    "rgba(255,255,255,0.2)",

  color: "white",

  fontWeight: 700,

  cursor: "pointer"
};

const detailTitle = {
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 14,
  color: "white"
};

const detailItem = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom:
    "1px solid rgba(255,255,255,0.12)",
  color: "white",
  fontSize: 14
};

const detailEmpty = {
  opacity: 0.8,
  color: "white",
  fontSize: 13
};

const remainingBox = {
  marginTop: 16,
  background:
    "rgba(255,255,255,0.15)",
  borderRadius: 14,
  padding: 14,
  color: "white",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  fontWeight: 700
};

const infoCard = {
  marginTop: 24,

  background: "white",

  borderRadius: 24,

  padding: 24,

  boxShadow:
    "0 10px 28px rgba(0,0,0,0.06)"
};