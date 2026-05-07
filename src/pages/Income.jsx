import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import AddIncomeForm from "../components/AddIncomeForm";
import MiniCard from "../components/MiniCard";
import RecentTransactions from "../components/RecentTransactions";
import MoneyDisplay from "../components/MoneyDisplay";

import { useCurrency } from "../context/CurrencyContext";

export default function Income() {
  const [incomes, setIncomes] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [sources, setSources] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [
    selectedSource,
    setSelectedSource
  ] = useState(null);

  const { symbol, fromUSD } =
    useCurrency();

  const fetchData = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    // INCOMES
    const { data: incomes } =
      await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id);

    // EXPENSES
    const {
      data: expenseData
    } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id);

    // SOURCES
    const { data: src } =
      await supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", user.id);

    setIncomes(incomes || []);
    setExpenses(expenseData || []);
    setSources(src || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CURRENT MONTH
  const now = new Date();

  const m = now.getMonth();

  const y = now.getFullYear();

  const monthlyIncome =
    incomes.filter((i) => {
      const d = new Date(
        i.created_at
      );

      return (
        d.getMonth() === m &&
        d.getFullYear() === y
      );
    });

  const total =
    monthlyIncome.reduce(
      (s, i) => s + i.amount,
      0
    );

  const getSourceTotal = (
    sourceId
  ) => {
    return monthlyIncome
      .filter(
        (i) =>
          i.source_id === sourceId
      )
      .reduce(
        (s, i) => s + i.amount,
        0
      );
  };

  const getSourceCount = (
    sourceId
  ) => {
    return monthlyIncome.filter(
      (i) =>
        i.source_id === sourceId
    ).length;
  };

  const getSourceName = (
    sourceId
  ) => {
    const src = sources.find(
      (s) => s.id === sourceId
    );

    return src
      ? src.name
      : "Unknown";
  };

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
          Income
        </h1>

        <p style={subText}>
          Track your income streams
          and growth
        </p>
      </div>

      {/* HERO CARD */}
      <div style={heroCard}>
        <div>
          <p style={heroLabel}>
            This Month's Income
          </p>

          <MoneyDisplay
            amount={total}
            large
            color="white"
            secondaryColor="rgba(255,255,255,0.75)"
          />

          <p style={heroSub}>
            {monthlyIncome.length}{" "}
            total income transaction
            {monthlyIncome.length !==
            1
              ? "s"
              : ""}
          </p>
        </div>

        <div style={heroCircle}>
          💰
        </div>
      </div>

      {/* ADD STREAM */}
      <button
        style={blueButton}
        onClick={async () => {
          const name = prompt(
            "Enter income stream name"
          );

          if (!name) return;

          const {
            data: { user }
          } =
            await supabase.auth.getUser();

          await supabase
            .from("income_sources")
            .insert([
              {
                user_id:
                  user.id,
                name
              }
            ]);

          fetchData();
        }}
      >
        + Add Income Stream
      </button>

      {/* MINI CARDS */}
      <div style={cardGrid}>
        {sources.map((src) => (
          <MiniCard
            key={src.id}
            title={src.name}
            amount={`${symbol}${fromUSD(
              getSourceTotal(
                src.id
              )
            ).toLocaleString()}`}
            count={`${getSourceCount(
              src.id
            )} transactions`}
            color="#0B5ED7"
            onClick={() => {
              setSelectedSource(
                src
              );

              setShowForm(true);
            }}
          />
        ))}
      </div>

      {/* FORM */}
      {showForm && (
        <AddIncomeForm
          source={
            selectedSource
          }
          onCancel={() =>
            setShowForm(false)
          }
          onSuccess={() => {
            fetchData();
            setShowForm(false);
          }}
        />
      )}

      {/* SUMMARY CARDS */}
      <div style={summaryGrid}>
        <div style={summaryCard}>
          <p style={summaryLabel}>
            Active Streams
          </p>

          <h2
            style={{
              color: "#062B68"
            }}
          >
            {sources.length}
          </h2>
        </div>

        <div style={summaryCard}>
          <p style={summaryLabel}>
            Average per Stream
          </p>

          <MoneyDisplay
            amount={
              sources.length
                ? total /
                  sources.length
                : 0
            }
            color="#2E9E44"
          />
        </div>

        <div style={summaryCard}>
          <p style={summaryLabel}>
            Monthly Growth
          </p>

          <h2
            style={{
              color: "#F4C400"
            }}
          >
            +12%
          </h2>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div style={card}>
        <h3
          style={{
            color: "#062B68",
            marginBottom: 16
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
  marginTop: 10
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

const cardGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px,1fr))",
  gap: 16,
  marginBottom: 20
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px,1fr))",
  gap: 16,
  marginBottom: 20
};

const summaryCard = {
  background: "#FFFFFF",
  padding: 20,
  borderRadius: 20,
  boxShadow:
    "0 8px 25px rgba(0,0,0,0.05)"
};

const summaryLabel = {
  fontSize: 13,
  color: "#64748B",
  marginBottom: 10
};

const card = {
  background: "#FFFFFF",
  padding: 22,
  borderRadius: 22,
  boxShadow:
    "0 8px 25px rgba(0,0,0,0.06)"
};