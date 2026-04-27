import { useState } from "react";
import { useCurrency } from "../context/CurrencyContext"; // ✅ added

export default function Budget() {
  const [openBucket, setOpenBucket] = useState(null);

  const { symbol, convert } = useCurrency(); // ✅ added convert

  const buckets = [
    {
      name: "Available",
      percent: 60,
      amount: 9000,
      color: "#3b82f6",
      categories: [
        { name: "Rent", percent: 35, amount: 3150 },
        { name: "Groceries", percent: 25, amount: 2250 },
        { name: "Transport", percent: 15, amount: 1350 },
        { name: "Utilities", percent: 15, amount: 1350 }
      ]
    },
    {
      name: "Tithe",
      percent: 10,
      amount: 1500,
      color: "#a855f7",
      categories: [
        { name: "Church", percent: 80, amount: 1200 },
        { name: "Charity", percent: 20, amount: 300 }
      ]
    },
    {
      name: "Save",
      percent: 20,
      amount: 3000,
      color: "#10b981",
      categories: []
    },
    {
      name: "Others",
      percent: 10,
      amount: 1500,
      color: "#f59e0b",
      categories: []
    }
  ];

  return (
    <div>
      <h1>Budget</h1>
      <p>Set categories within each bucket</p>

      {buckets.map((bucket) => (
        <div
          key={bucket.name}
          className="card"
          style={{ marginTop: 20, cursor: "pointer" }}
          onClick={() =>
            setOpenBucket(openBucket === bucket.name ? null : bucket.name)
          }
        >
          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: bucket.color
                }}
              />
              <h3 style={{ margin: 0 }}>
                {bucket.name} ({bucket.percent}%)
              </h3>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong>{symbol}{convert(bucket.amount).toLocaleString()}</strong>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                {symbol}{convert(bucket.amount).toLocaleString()} left
              </div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div
            style={{
              height: 6,
              background: "#e5e7eb",
              borderRadius: 10,
              marginTop: 10
            }}
          />

          {/* EXPAND CONTENT */}
          {openBucket === bucket.name && (
            <div style={{ marginTop: 15 }}>
              {bucket.categories.length === 0 ? (
                <p style={{ opacity: 0.6 }}>No categories</p>
              ) : (
                bucket.categories.map((cat, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f9fafb",
                      padding: 10,
                      borderRadius: 10,
                      marginTop: 10
                    }}
                  >
                    <strong>{cat.name}</strong>
                    <p style={{ fontSize: 12 }}>
                      {cat.percent}% of bucket • Spent: {symbol}{convert(0).toLocaleString()} / {symbol}
                      {convert(cat.amount).toLocaleString()}
                    </p>
                  </div>
                ))
              )}

              <button
                className="btn btn-gray"
                style={{ marginTop: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Add category (next step)");
                }}
              >
                + Add Category
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}