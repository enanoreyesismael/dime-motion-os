import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import { getAvailable } from "../utils/finance";

import AddTransactionForm from "../components/AddTransactionForm";
import MiniCard from "../components/MiniCard";
import RecentTransactions from "../components/RecentTransactions";

import { useCurrency } from "../context/CurrencyContext";

export default function Transactions() {
  const [incomes, setIncomes] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [wallet, setWallet] =
    useState(null);

  const [
    showTransactionForm,
    setShowTransactionForm
  ] = useState(false);

  const [sources, setSources] =
    useState([]);

  const [
    selectedCategory,
    setSelectedCategory
  ] = useState(null);

  const { symbol, fromUSD } =
    useCurrency();

  const fetchData = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    // INCOMES
    const {
      data: incomeData
    } = await supabase
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

    // WALLET
    const {
      data: walletData
    } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // SOURCES
    const { data: src } =
      await supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", user.id);

    setSources(src || []);
    setIncomes(incomeData || []);
    setExpenses(expenseData || []);
    setWallet(walletData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // AVAILABLE ENGINE
  const available = getAvailable({
    wallet,
    incomes,
    expenses
  });

  // DASHBOARD STATS
  const stats = [
    {
      title: "Available",
      value:
        available.remaining,
      color:
        "linear-gradient(135deg,#062B68,#0B5ED7)",
      icon: "💳"
    },

    {
      title: "Expenses",
      value:
        available.monthlyExpenses,
      color:
        "linear-gradient(135deg,#2E9E44,#1F7A34)",
      icon: "💸"
    },

    {
      title: "Savings",
      value:
        available.monthlyIncome *
        0.2,
      color:
        "linear-gradient(135deg,#F4C400,#D9A800)",
      icon: "🪙"
    }
  ];

  // GROUP EXPENSES
  const grouped =
    expenses.reduce(
      (acc, expense) => {
        const category =
          expense.category ||
          "Others";

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push(
          expense
        );

        return acc;
      },
      {}
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
      {/* HEADER */}
      <div style={header}>
        <h1
          style={{
            color: "#062B68",
            marginBottom: 4
          }}
        >
          Transactions
        </h1>

        <p style={subText}>
          Track where your money
          goes
        </p>
      </div>

      {/* TOP STATS */}
      <div style={topGrid}>
        {stats.map((item) => (
          <div
            key={item.title}
            style={{
              ...topCard,
              background:
                item.color
            }}
          >
            <div
              style={{
                fontSize: 28
              }}
            >
              {item.icon}
            </div>

            <p style={topLabel}>
              {item.title}
            </p>

            <h2 style={topValue}>
              {symbol}
              {fromUSD(
                item.value
              ).toLocaleString()}
            </h2>
          </div>
        ))}
      </div>

      {/* ADD CATEGORY */}
      <button
        style={blueButton}
        onClick={() => {
          const category =
            prompt(
              "Enter transaction category"
            );

          if (!category) return;

          setSelectedCategory(
            category
          );

          setShowTransactionForm(
            true
          );
        }}
      >
        + Add Transaction
        Category
      </button>

      {/* CATEGORY CARDS */}
      <div style={cardGrid}>
        {Object.entries(
          grouped
        ).map(
          ([category, items]) => {
            const total =
              items.reduce(
                (
                  sum,
                  transaction
                ) =>
                  sum +
                  transaction.amount,
                0
              );

            // CATEGORY COLORS
            let color =
              "#0B5ED7";

            if (
              category
                .toLowerCase()
                .includes(
                  "food"
                )
            )
              color =
                "#2E9E44";

            if (
              category
                .toLowerCase()
                .includes(
                  "shopping"
                )
            )
              color =
                "#F4C400";

            if (
              category
                .toLowerCase()
                .includes(
                  "transport"
                )
            )
              color =
                "#7C3AED";

            return (
              <MiniCard
                key={category}
                title={category}
                amount={`${symbol}${fromUSD(
                  total
                ).toLocaleString()}`}
                count={`${items.length} transactions`}
                color={color}
                onClick={() => {
                  setSelectedCategory(
                    category
                  );

                  setShowTransactionForm(
                    true
                  );
                }}
              />
            );
          }
        )}
      </div>

      {/* FORM */}
      {showTransactionForm && (
        <AddTransactionForm
          category={
            selectedCategory
          }
          onCancel={() =>
            setShowTransactionForm(
              false
            )
          }
          onSuccess={() => {
            fetchData();

            setShowTransactionForm(
              false
            );
          }}
        />
      )}

      {/* SPENDING INSIGHT */}
      <div style={insightCard}>
        💡 Your largest spending
        categories help determine
        your financial habits.
        Track intentionally.
      </div>

      {/* RECENT TRANSACTIONS */}
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

const topGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px,1fr))",
  gap: 16,
  marginBottom: 20
};

const topCard = {
  color: "white",
  padding: 24,
  borderRadius: 22,
  boxShadow:
    "0 12px 30px rgba(0,0,0,0.15)"
};

const topLabel = {
  opacity: 0.9,
  marginTop: 14,
  marginBottom: 8
};

const topValue = {
  fontSize: 28,
  margin: 0
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

const card = {
  background: "#FFFFFF",
  padding: 22,
  borderRadius: 22,
  boxShadow:
    "0 8px 25px rgba(0,0,0,0.06)"
};