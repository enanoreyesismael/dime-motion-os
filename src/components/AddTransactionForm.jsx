import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function AddTransactionForm({
  category,
  onSuccess,
  onCancel
}) {
  const [form, setForm] = useState({
    category: category || "Food",
    bucket: "Available",
    amount: "",
    date: new Date()
      .toISOString()
      .split("T")[0],
    notes: ""
  });

  const [categories, setCategories] =
    useState([]);

  const { toUSD } = useCurrency();

  const handleSave = async () => {
    if (!form.amount)
      return alert("Enter amount");

    const amountNumber = parseFloat(
      form.amount
    );

    if (isNaN(amountNumber))
      return alert("Invalid amount");

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user)
      return alert("Not logged in");

    // CONVERT TO USD
    const amountUSD = toUSD(
      amountNumber
    );

    // INSERT
    const { error } =
      await supabase
        .from("expenses")
        .insert([
          {
            category:
              form.category,
            bucket: form.bucket,
            amount: amountUSD,
            date: form.date,
            notes: form.notes,
            user_id: user.id
          }
        ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // RESET FORM
    setForm({
      category:
        category || "Food",
      bucket: "Available",
      amount: "",
      date: new Date()
        .toISOString()
        .split("T")[0],
      notes: ""
    });

    // CALLBACK
    onSuccess &&
      onSuccess({
        amount: form.amount,
        category:
          form.category
      });
  };

  useEffect(() => {
    const fetchCategories =
      async () => {
        const {
          data: { user }
        } =
          await supabase.auth.getUser();

        if (!user) return;

        const {
          data,
          error
        } = await supabase
          .from(
            "others_categories"
          )
          .select("*")
          .eq(
            "user_id",
            user.id
          );

        if (error) {
          console.error(error);
          return;
        }

        setCategories(data || []);
      };

    fetchCategories();
  }, []);

  return (
    <div
      className="card"
      style={{
        width: "100%",
        maxWidth: "100%",
        padding: 24,
        borderRadius: 16
      }}
    >
      <h3>Add Transaction</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: 20
        }}
      >
        {/* CATEGORY */}
        <div>
          <label>Category</label>

          <input
            list="categories"
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category:
                  e.target.value
              })
            }
          />

          <datalist id="categories">
            {categories.map((c) => (
              <option
                key={c.id}
                value={c.name}
              >
                {c.name}
              </option>
            ))}
          </datalist>
        </div>

        {/* BUCKET */}
        <div>
          <label>Bucket</label>

          <select
            value={form.bucket}
            onChange={(e) =>
              setForm({
                ...form,
                bucket:
                  e.target.value
              })
            }
          >
            <option>
              Available
            </option>

            <option>
              Others
            </option>
          </select>
        </div>

        {/* AMOUNT */}
        <div>
          <label>Amount</label>

          <input
            type="number"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount:
                  e.target.value
              })
            }
          />
        </div>

        {/* DATE */}
        <div>
          <label>Date</label>

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date:
                  e.target.value
              })
            }
          />
        </div>

        {/* NOTES */}
        <div
          style={{
            gridColumn:
              "1 / span 2"
          }}
        >
          <label>Notes</label>

          <input
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes:
                  e.target.value
              })
            }
          />
        </div>
      </div>

      {/* BUTTONS */}
      <div
        style={{ marginTop: 20 }}
      >
        <button
          className="btn btn-blue"
          onClick={handleSave}
        >
          Save
        </button>

        <button
          className="btn btn-gray"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}