import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function Settings() {
  const {
    currency,
    setCurrency,

    secondaryCurrency,
    setSecondaryCurrency,

    showSecondary,
    setShowSecondary
  } = useCurrency();

  const [alloc, setAlloc] =
    useState({
      tithe: 10,
      save: 20,
      available: 60,
      others: 10
    });

  const [editMode, setEditMode] =
    useState(false);

  const [tempAlloc, setTempAlloc] =
    useState(alloc);

  const [aiAlloc, setAiAlloc] =
    useState(null);

  const [aiMessage, setAiMessage] =
    useState("Analyzing...");

  const currencies = [
    {
      code: "USD",
      label: "US Dollar",
      symbol: "$"
    },
    {
      code: "EUR",
      label: "Euro",
      symbol: "€"
    },
    {
      code: "GBP",
      label: "British Pound",
      symbol: "£"
    },
    {
      code: "JPY",
      label: "Japanese Yen",
      symbol: "¥"
    },
    {
      code: "CAD",
      label: "Canadian Dollar",
      symbol: "CA$"
    },
    {
      code: "AUD",
      label: "Australian Dollar",
      symbol: "A$"
    },
    {
      code: "CHF",
      label: "Swiss Franc",
      symbol: "CHF"
    },
    {
      code: "INR",
      label: "Indian Rupee",
      symbol: "₹"
    },
    {
      code: "BRL",
      label: "Brazilian Real",
      symbol: "R$"
    },
    {
      code: "MXN",
      label: "Mexican Peso",
      symbol: "MX$"
    },
    {
      code: "ZAR",
      label: "South African Rand",
      symbol: "R"
    },
    {
      code: "NGN",
      label: "Nigerian Naira",
      symbol: "₦"
    },
    {
      code: "GHS",
      label: "Ghanaian Cedi",
      symbol: "GH₵"
    },
    {
      code: "KES",
      label: "Kenyan Shilling",
      symbol: "KSh"
    },
    {
      code: "EGP",
      label: "Egyptian Pound",
      symbol: "E£"
    },
    {
      code: "AED",
      label: "UAE Dirham",
      symbol: "د.إ"
    },
    {
      code: "SGD",
      label: "Singapore Dollar",
      symbol: "S$"
    },
    {
      code: "PHP",
      label: "Philippine Peso",
      symbol: "₱"
    },
    {
      code: "IDR",
      label: "Indonesian Rupiah",
      symbol: "Rp"
    }
  ];

  useEffect(() => {
    const loadSettings =
      async () => {
        const {
          data: { user }
        } =
          await supabase.auth.getUser();

        if (!user) return;

        const { data } =
          await supabase
            .from(
              "user_settings"
            )
            .select("*")
            .eq(
              "user_id",
              user.id
            )
            .maybeSingle();

        if (data) {
          const loaded = {
            tithe:
              data.tithe ?? 10,

            save:
              data.save ?? 20,

            available:
              data.available ??
              60,

            others:
              data.others ?? 10
          };

          setAlloc(loaded);
          setTempAlloc(
            loaded
          );
        }
      };

    loadSettings();
  }, []);

  // AI ANALYSIS
  useEffect(() => {
    const analyze =
      async () => {
        const {
          data: { user }
        } =
          await supabase.auth.getUser();

        const {
          data: expenses
        } = await supabase
          .from("expenses")
          .select("*")
          .eq(
            "user_id",
            user.id
          );

        if (
          !expenses ||
          expenses.length === 0
        ) {
          const fallback = {
            tithe: 10,
            save: 25,
            available: 55,
            others: 10
          };

          setAiAlloc(
            fallback
          );

          setAiMessage(
            "Start strong with this setup"
          );

          return;
        }

        const total =
          expenses.reduce(
            (s, e) =>
              s + e.amount,
            0
          );

        const availableSpent =
          expenses
            .filter(
              (e) =>
                e.bucket ===
                "Available"
            )
            .reduce(
              (s, e) =>
                s + e.amount,
              0
            );

        const ratio =
          availableSpent /
          total;

        if (ratio > 0.7) {
          setAiAlloc({
            tithe: 10,
            save: 30,
            available: 50,
            others: 10
          });

          setAiMessage(
            "You're overspending → boost savings"
          );
        } else if (
          ratio < 0.4
        ) {
          setAiAlloc({
            tithe: 10,
            save: 25,
            available: 55,
            others: 10
          });

          setAiMessage(
            "Great discipline → optimized growth"
          );
        } else {
          setAiAlloc({
            tithe: 10,
            save: 20,
            available: 60,
            others: 10
          });

          setAiMessage(
            "Balanced → maintain system"
          );
        }
      };

    analyze();
  }, []);

  // PRIMARY
  const handleCurrencyChange =
    async (code) => {
      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      await supabase
        .from(
          "user_settings"
        )
        .upsert(
          {
            user_id:
              user.id,

            primary_currency:
              code
          },
          {
            onConflict:
              "user_id"
          }
        );

      setCurrency(code);
    };

  // SECONDARY
  const handleSecondaryCurrency =
    async (code) => {
      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      await supabase
        .from(
          "user_settings"
        )
        .upsert(
          {
            user_id:
              user.id,

            secondary_currency:
              code
          },
          {
            onConflict:
              "user_id"
          }
        );

      setSecondaryCurrency(
        code
      );
    };

  // TOGGLE
  const handleToggleSecondary =
    async () => {
      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      const next =
        !showSecondary;

      await supabase
        .from(
          "user_settings"
        )
        .upsert(
          {
            user_id:
              user.id,

            show_secondary:
              next
          },
          {
            onConflict:
              "user_id"
          }
        );

      setShowSecondary(
        next
      );
    };

  // NORMALIZE
  const normalizeAlloc = (
    data
  ) => {
    let total =
      Object.values(
        data
      ).reduce(
        (a, b) =>
          a +
          Number(b || 0),
        0
      );

    if (total === 100)
      return data;

    return {
      ...data,

      available:
        Math.max(
          0,
          data.available +
            (100 - total)
        )
    };
  };

  // SAVE
  const saveAlloc =
    async () => {
      const finalAlloc =
        normalizeAlloc(
          tempAlloc
        );

      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      await supabase
        .from(
          "user_settings"
        )
        .upsert(
          {
            user_id:
              user.id,

            ...finalAlloc
          },
          {
            onConflict:
              "user_id"
          }
        );

      setAlloc(finalAlloc);
      setTempAlloc(
        finalAlloc
      );

      setEditMode(false);
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
          ⚙️ Settings
        </h1>

        <p style={subText}>
          Customize your financial
          operating system
        </p>
      </div>

      {/* PRIMARY */}
      <div style={card}>
        <h2 style={sectionTitle}>
          💲 Primary Currency
        </h2>

        <div style={wheelRow}>
          {currencies.map(
            (c) => (
              <button
                key={c.code}
                onClick={() =>
                  handleCurrencyChange(
                    c.code
                  )
                }
                style={{
                  ...wheelButton,

                  border:
                    currency ===
                    c.code
                      ? "2px solid #0B5ED7"
                      : "1px solid #E2E8F0",

                  background:
                    currency ===
                    c.code
                      ? "linear-gradient(135deg,#062B68,#0B5ED7)"
                      : "#FFFFFF",

                  color:
                    currency ===
                    c.code
                      ? "white"
                      : "#062B68",

                  boxShadow:
                    currency ===
                    c.code
                      ? "0 10px 24px rgba(11,94,215,0.22)"
                      : "none"
                }}
              >
                <span>
                  {c.symbol}
                </span>

                <span>
                  {c.code}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* SECONDARY */}
      <div style={card}>
        <div
          style={
            rowBetween
          }
        >
          <div>
            <h2
              style={
                sectionTitle
              }
            >
              🌍 Secondary Currency
            </h2>

            <p
              style={
                settingSub
              }
            >
              Show converted values
            </p>
          </div>

          <button
            onClick={
              handleToggleSecondary
            }
            style={{
              background:
                showSecondary
                  ? "linear-gradient(135deg,#2E9E44,#1F7A34)"
                  : "#CBD5E1",

              color: "white",

              border: "none",

              borderRadius: 999,

              padding:
                "10px 18px",

              cursor: "pointer",

              fontWeight: 700,

              minWidth: 80
            }}
          >
            {showSecondary
              ? "ON"
              : "OFF"}
          </button>
        </div>

        <div style={wheelRow}>
          {currencies.map(
            (c) => (
              <button
                key={c.code}
                onClick={() =>
                  handleSecondaryCurrency(
                    c.code
                  )
                }
                style={{
                  ...wheelButton,

                  border:
                    secondaryCurrency ===
                    c.code
                      ? "2px solid #2E9E44"
                      : "1px solid #E2E8F0",

                  background:
                    secondaryCurrency ===
                    c.code
                      ? "linear-gradient(135deg,#2E9E44,#1F7A34)"
                      : "#FFFFFF",

                  color:
                    secondaryCurrency ===
                    c.code
                      ? "white"
                      : "#062B68",

                  boxShadow:
                    secondaryCurrency ===
                    c.code
                      ? "0 10px 24px rgba(34,197,94,0.22)"
                      : "none"
                }}
              >
                <span>
                  {c.symbol}
                </span>

                <span>
                  {c.code}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* ALLOCATION */}
      <div style={card}>
        <h2
          style={{
            ...sectionTitle,
            textAlign:
              "center"
          }}
        >
          🎯 Allocation Settings
        </h2>

        {/* AI */}
        <div
          style={{
            textAlign:
              "center",

            marginBottom: 20
          }}
        >
          <button
            style={
              aiButton
            }
            onClick={() => {
              if (aiAlloc) {
                setTempAlloc(
                  aiAlloc
                );

                setEditMode(
                  true
                );
              }
            }}
          >
            🤖 {aiMessage}

            {aiAlloc && (
              <div
                style={{
                  fontSize: 12,
                  marginTop: 6,
                  opacity: 0.9
                }}
              >
                Tithe:
                {
                  aiAlloc.tithe
                }
                % • Save:
                {
                  aiAlloc.save
                }
                % • Available:
                {
                  aiAlloc.available
                }
                % • Others:
                {
                  aiAlloc.others
                }
                %
              </div>
            )}
          </button>
        </div>

        {/* ALLOCATION GRID */}
        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(120px,1fr))",

            gap: 16
          }}
        >
          {[
            "tithe",
            "save",
            "available",
            "others"
          ].map((key) => (
            <div
              key={key}
              style={
                allocCard
              }
            >
              <div
                style={{
                  opacity: 0.7,

                  marginBottom: 10,

                  textTransform:
                    "capitalize"
                }}
              >
                {key}
              </div>

              {!editMode ? (
                <div
                  style={{
                    fontSize: 32,

                    fontWeight: 800,

                    color:
                      "#062B68"
                  }}
                >
                  {alloc[key]}
                  %
                </div>
              ) : (
                <input
                  type="number"
                  value={
                    tempAlloc[
                      key
                    ]
                  }
                  style={
                    inputStyle
                  }
                  onChange={(
                    e
                  ) =>
                    setTempAlloc(
                      {
                        ...tempAlloc,

                        [key]:
                          Number(
                            e
                              .target
                              .value
                          )
                      }
                    )
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* SAVE */}
        <div
          style={{
            marginTop: 24,

            textAlign:
              "center"
          }}
        >
          {!editMode ? (
            <button
              style={
                grayButton
              }
              onClick={() =>
                setEditMode(
                  true
                )
              }
            >
              Change Allocation
            </button>
          ) : (
            <button
              style={
                blueButton
              }
              onClick={
                saveAlloc
              }
            >
              Save Allocation
            </button>
          )}
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

const header = {
  marginBottom: 20
};

const subText = {
  color: "#64748B",
  fontSize: 14
};

const card = {
  background: "#FFFFFF",
  padding: 24,
  borderRadius: 24,
  marginBottom: 20,
  boxShadow:
    "0 10px 28px rgba(0,0,0,0.06)"
};

const sectionTitle = {
  color: "#062B68",
  marginBottom: 14
};

const wheelRow = {
  display: "flex",

  gap: 12,

  overflowX: "auto",

  paddingBottom: 6,

  marginTop: 18
};

const wheelButton = {
  minWidth: 110,

  padding: "14px 18px",

  borderRadius: 999,

  fontWeight: 700,

  cursor: "pointer",

  transition: "0.2s",

  whiteSpace: "nowrap",

  display: "flex",

  alignItems: "center",

  justifyContent:
    "center",

  gap: 8
};

const rowBetween = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 20
};

const settingSub = {
  color: "#64748B",
  fontSize: 14
};

const aiButton = {
  width: "100%",
  background:
    "linear-gradient(135deg,#F4C400,#FFD84D)",
  color: "#062B68",
  border: "none",
  borderRadius: 18,
  padding: 18,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow:
    "0 10px 24px rgba(244,196,0,0.25)"
};

const allocCard = {
  background: "#F8FAFC",
  padding: 20,
  borderRadius: 20,
  textAlign: "center"
};

const inputStyle = {
  width: 80,
  padding: 10,
  textAlign: "center",
  borderRadius: 12,
  border: "1px solid #CBD5E1",
  fontSize: 22,
  fontWeight: 700
};

const blueButton = {
  background:
    "linear-gradient(135deg,#062B68,#0B5ED7)",
  color: "white",
  border: "none",
  borderRadius: 14,
  padding: "14px 22px",
  fontWeight: 700,
  cursor: "pointer"
};

const grayButton = {
  background: "#E2E8F0",
  color: "#0F172A",
  border: "none",
  borderRadius: 14,
  padding: "14px 22px",
  fontWeight: 700,
  cursor: "pointer"
};