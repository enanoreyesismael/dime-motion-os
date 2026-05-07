import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function AddIncomeForm({
  source,
  onSuccess,
  onCancel
}) {
  const [form, setForm] = useState({
    source: source?.name || "Salary",
    amount: "",
    date: new Date()
      .toISOString()
      .split("T")[0],
    notes: ""
  });

  const { toUSD } = useCurrency();

  const handleAdd = async () => {
    if (!form.amount)
      return alert("Enter amount");

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    // REQUIRE SOURCE
    if (!source?.id) {
      alert(
        "No income source selected"
      );
      return;
    }

    // CONVERT TO USD
    const amountUSD = toUSD(
      Number(form.amount)
    );

    // INSERT INCOME
    const { error } =
      await supabase
        .from("incomes")
        .insert([
          {
            source_id: source.id,

            amount: amountUSD,

            note: form.notes,

            created_at:
              new Date(
                form.date
              ).toISOString(),

            user_id: user.id
          }
        ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // GET SETTINGS
    const {
      data: settings
    } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // GET WALLET
    const {
      data: wallet
    } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // PERCENTAGES
    const tithePercent =
      Number(
        settings?.tithe || 10
      );

    const savingsPercent =
      Number(
        settings?.save || 15
      );

    const availablePercent =
      Number(
        settings?.available ||
          60
      );

    const goalsPercent =
      Number(
        settings?.others || 15
      );

    // ALLOCATIONS
    const tithe =
      amountUSD *
      (tithePercent / 100);

    const savings =
      amountUSD *
      (savingsPercent / 100);

    const available =
      amountUSD *
      (availablePercent /
        100);

    const goals =
      amountUSD *
      (goalsPercent / 100);

    // UPDATE WALLET
    const {
      error: walletError
    } = await supabase
      .from("wallets")
      .update({
        income:
          Number(
            wallet?.income ||
              0
          ) + amountUSD,

        balance:
          Number(
            wallet?.balance ||
              0
          ) + amountUSD,

        tithe_balance:
          Number(
            wallet?.tithe_balance ||
              0
          ) + tithe,

        savings_balance:
          Number(
            wallet?.savings_balance ||
              0
          ) + savings,

        available_balance:
          Number(
            wallet?.available_balance ||
              0
          ) + available,

        goals_balance:
          Number(
            wallet?.goals_balance ||
              0
          ) + goals
      })
      .eq("user_id", user.id);

    if (walletError) {
      console.error(
        walletError
      );

      alert(
        walletError.message
      );

      return;
    }

    // SUCCESS MESSAGE
    alert(
      `Income Added Successfully

Allocated:
Tithe → ${tithe.toFixed(
        2
      )}
Savings → ${savings.toFixed(
        2
      )}
Goals → ${goals.toFixed(
        2
      )}
Available → ${available.toFixed(
        2
      )}`
    );

    // RESET
    setForm({
      source:
        source?.name || "Salary",

      amount: "",

      date: new Date()
        .toISOString()
        .split("T")[0],

      notes: ""
    });

    // CALLBACKS
    onSuccess && onSuccess();

    onCancel && onCancel();
  };

  return (
    <div
      className="card"
      style={{ marginTop: 20 }}
    >
      <h3>Add Income</h3>

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gap: 20
        }}
      >
        {/* SOURCE */}
        <div>
          <label>Source</label>

          <input
            value={form.source}
            disabled
          />
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
        <div>
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
        style={{
          marginTop: 20,
          marginLeft: 10
        }}
      >
        <button
          className="btn btn-blue"
          onClick={handleAdd}
        >
          Save Income
        </button>

        <button
          className="btn btn-gray"
          onClick={() =>
            onCancel &&
            onCancel()
          }
          style={{
            marginLeft: 10
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}