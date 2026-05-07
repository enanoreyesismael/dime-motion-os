import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";
import { useNavigate } from "react-router-dom";

import RecentTransactions from "../components/RecentTransactions";
import EmergencyFundCard from "../components/EmergencyFundCard";
import MoneyDisplay from "../components/MoneyDisplay";

import {
  getMonthlyIncome
} from "../utils/finance";

import { computeEmergencyFund } from "../utils/emergencyFund";

export default function Dashboard() {
  const [firstName, setFirstName] =
    useState("");

  const [incomes, setIncomes] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [wallet, setWallet] =
    useState(null);

  const [sources, setSources] =
    useState([]);

  const [goals, setGoals] =
    useState([]);

  const navigate = useNavigate();

  const { symbol, fromUSD } =
    useCurrency();

  const fetchAll = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    // PROFILE
    const { data: profile } =
      await supabase
        .from("profiles")
        .select(
          "nickname, first_name"
        )
        .eq("id", user.id)
        .maybeSingle();

    setFirstName(
      profile?.nickname ||
        profile?.first_name ||
        "User"
    );

    // WALLET
    const {
      data: walletData
    } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setWallet(walletData);

    // INCOMES
    const { data: inc } =
      await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id);

    // EXPENSES
    const { data: exp } =
      await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id);

    // SOURCES
    const { data: src } =
      await supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", user.id);

    // GOALS
    const { data: goalData } =
      await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id);

    setGoals(goalData || []);
    setSources(src || []);
    setIncomes(inc || []);
    setExpenses(exp || []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // MONTHLY INCOME
  const monthlyIncome =
    getMonthlyIncome(
      incomes
    );

  // BALANCES
  const availableBalance =
    wallet?.available_balance ||
    0;

  const savingsBalance =
    wallet?.savings_balance ||
    0;

  const goalsBalance =
    wallet?.goals_balance ||
    0;

  const titheBalance =
    wallet?.tithe_balance ||
    0;

  // MONTHLY EXPENSES
  const monthlyExpenses =
    expenses.reduce(
      (sum, e) =>
        sum +
        Number(
          e.amount || 0
        ),
      0
    );

  // TOTAL PROTECTED MONEY
  const totalBalance =
    availableBalance +
    savingsBalance +
    goalsBalance;

  // EMERGENCY FUND
  const emergencyData =
    computeEmergencyFund({
      goals,
      expenses,
      wallet,
      monthlyIncome
    });

  // ADD FUNDS
  const handleAddFunds =
    async () => {
      const input = prompt(
        "Enter amount to add:"
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

      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      if (!user) return;

      const newSaved =
        (emergencyData.saved ||
          0) + amount;

      const { error } =
        await supabase
          .from("goals")
          .update({
            saved:
              newSaved
          })
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "type",
            "emergency"
          );

      if (error) {
        alert(
          "Failed to add funds"
        );

        return;
      }

      fetchAll();
    };

  // SPENDING INSIGHT
  const dailySpend =
    monthlyExpenses / 30;

  const daysCover =
    dailySpend
      ? totalBalance /
        dailySpend
      : 0;

  const months = Math.floor(
    daysCover / 30
  );

  const days = Math.floor(
    daysCover % 30
  );

  const getSourceName = (
    sourceId
  ) => {
    const src = sources.find(
      (s) => s.id === sourceId
    );

    return src
      ? src.name
      : "Income";
  };

  return (
    <div style={page}>
      <div style={container}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h2
              style={{
                marginBottom: 4,
                color: "#062B68"
              }}
            >
              Hi, {firstName} 👋
            </h2>

            <p style={subText}>
              Track • Plan • Grow
            </p>
          </div>
        </div>

        {/* SNAPSHOT */}
        <div style={heroCard}>
          <h3 style={heroTitle}>
            Financial Snapshot
          </h3>

          <MoneyDisplay
            amount={
              availableBalance
            }
            large
            color="white"
            secondaryColor="rgba(255,255,255,0.75)"
          />

          <p style={heroSub}>
            Available Balance
          </p>

          <div style={heroGrid}>
            {/* MONTHLY INCOME */}
            <div style={heroMini}>
             <span>
               Monthly Income
             </span>

             <MoneyDisplay
               amount={
                 monthlyIncome
               }
               color="white"
               secondaryColor="rgba(255,255,255,0.75)"
             />
          </div>

            {/* SAVINGS */}
            <div style={heroMini}>
              <span>
                Savings
              </span>

              <MoneyDisplay
                amount={
                  savingsBalance
                }
                color="white"
                secondaryColor="rgba(255,255,255,0.75)"
              />
            </div>

            {/* GOALS */}
            <div style={heroMini}>
              <span>
                Goals Builder
              </span>

              <MoneyDisplay
                amount={
                  goalsBalance
                }
                color="white"
                secondaryColor="rgba(255,255,255,0.75)"
              />
            </div>

            {/* TITHE */}
            <div style={heroMini}>
              <span>
                Tithe
              </span>

              <MoneyDisplay
                amount={
                  titheBalance
                }
                color="white"
                secondaryColor="rgba(255,255,255,0.75)"
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              background:
                "rgba(255,255,255,0.12)",
              padding: 14,
              borderRadius: 14
            }}
          >
            💡 Based on your
            spending, your current
            protected funds may
            last about{" "}
            <strong>
              {months} month
              {months !== 1
                ? "s"
                : ""}{" "}
              & {days} day
              {days !== 1
                ? "s"
                : ""}
            </strong>
          </div>
        </div>

        {/* AI INSIGHT */}
        <div style={insightCard}>
          💡 You're consistently
          building wealth through
          saving and planning.
          Keep growing steadily.
        </div>

        {/* SECURED YOU */}
        <EmergencyFundCard
          data={emergencyData}
          symbol={symbol}
          fromUSD={fromUSD}
          onAddFunds={
            handleAddFunds
          }
          card={securedCard}
          progressBg={
            progressBar
          }
          progressFill={
            progressFill
          }
        />

        {/* GOALS */}
        <div style={card}>
          <div
            style={
              rowBetween
            }
          >
            <h3
              style={{
                ...sectionTitle,
                color: "#062B68"
              }}
            >
              🎯 Goals Progress
            </h3>

            <button
              className="btn"
              style={blueButton}
              onClick={() =>
                navigate(
                  "/goals"
                )
              }
            >
              View all →
            </button>
          </div>

          {(() => {
            const totalSaved =
              goals.reduce(
                (
                  sum,
                  goal
                ) =>
                  sum +
                  (goal.saved ||
                    0),
                0
              );

            const totalTarget =
              goals.reduce(
                (
                  sum,
                  goal
                ) =>
                  sum +
                  (goal.target ||
                    0),
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
              <>
                {/* SUMMARY */}
                <div
                  style={{
                    marginBottom: 20
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      color:
                        "#64748b"
                    }}
                  >
                    Combined Goals
                  </p>

                  <MoneyDisplay
                    amount={
                      totalSaved
                    }
                    large
                  />

                  <div
                    style={{
                      marginTop: 8,
                      color:
                        "#64748B"
                    }}
                  >
                    Target:{" "}
                    <MoneyDisplay
                      amount={
                        totalTarget
                      }
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 12
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
                        fontSize: 12,
                        marginTop: 6
                      }}
                    >
                      {Math.round(
                        overallPercent
                      )}
                      % completed
                    </p>
                  </div>
                </div>

                {/* GOAL LIST */}
                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: 14
                  }}
                >
                  {goals
                    .slice(
                      0,
                      5
                    )
                    .map(
                      (
                        goal
                      ) => {
                        const percent =
                          goal.target >
                          0
                            ? Math.min(
                                (goal.saved /
                                  goal.target) *
                                  100,
                                100
                              )
                            : 0;

                        return (
                          <div
                            key={
                              goal.id
                            }
                            style={{
                              background:
                                "#f8fafc",
                              padding: 12,
                              borderRadius: 14
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                marginBottom: 6
                              }}
                            >
                              <strong
                                style={{
                                  color:
                                    "#062B68"
                                }}
                              >
                                {
                                  goal.name
                                }
                              </strong>

                              <MoneyDisplay
                                amount={
                                  goal.saved
                                }
                              />
                            </div>

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
                                    "linear-gradient(90deg,#F4C400,#FFD84D)"
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              </>
            );
          })()}
        </div>

        {/* RECENT */}
        <div style={card}>
          <h3
            style={{
              color: "#062B68"
            }}
          >
            Recent Activity
          </h3>

          <RecentTransactions
            incomes={incomes}
            expenses={
              expenses
            }
            getSourceName={
              getSourceName
            }
          />
        </div>
      </div>
    </div>
  );
}

// STYLES

const page = {
  background: "#EEF4FB",
  minHeight: "100vh",
  padding: 20
};

const container = {
  width: "100%",
  maxWidth: "100%",
  padding: "0 20px"
};

const header = {
  marginBottom: 20
};

const subText = {
  color: "#64748B",
  fontSize: 14
};

const card = {
  background: "#FFFFFF",
  padding: 22,
  borderRadius: 22,
  marginBottom: 18,
  boxShadow:
    "0 8px 25px rgba(0,0,0,0.06)"
};

const heroCard = {
  background:
    "linear-gradient(135deg,#062B68,#0B5ED7)",
  color: "white",
  padding: 26,
  borderRadius: 24,
  marginBottom: 20,
  boxShadow:
    "0 14px 35px rgba(11,94,215,0.30)"
};

const heroTitle = {
  opacity: 0.9,
  marginBottom: 8
};

const heroSub = {
  opacity: 0.9,
  marginBottom: 20,
  marginTop: 8
};

const heroGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(140px,1fr))",
  gap: 14
};

const heroMini = {
  background:
    "rgba(255,255,255,0.12)",
  padding: 14,
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  gap: 8
};

const securedCard = {
  background:
    "linear-gradient(135deg,#ECFDF5,#EFF6FF)",
  padding: 22,
  borderRadius: 22,
  marginBottom: 18,
  border: "1px solid #D1FAE5",
  boxShadow:
    "0 8px 25px rgba(0,0,0,0.05)"
};

const sectionTitle = {
  marginBottom: 10
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
  borderRadius: 999
};

const progressFill = {
  height: "100%",
  borderRadius: 999,
  transition: "0.3s"
};

const insightCard = {
  background:
    "linear-gradient(135deg,#F4C400,#FFD84D)",
  padding: 16,
  borderRadius: 18,
  marginBottom: 18,
  color: "#062B68",
  fontWeight: 600,
  boxShadow:
    "0 8px 20px rgba(244,196,0,0.25)"
};

const blueButton = {
  background:
    "linear-gradient(135deg,#062B68,#0B5ED7)",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 600
};