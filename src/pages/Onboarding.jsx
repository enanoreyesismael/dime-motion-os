import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [bdate, setBdate] = useState("");

  const [balance, setBalance] = useState("");
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");

  const [currency, setLocalCurrency] = useState("PHP");

  const [smartSavings, setSmartSavings] = useState(true);
  const [savingsRate, setSavingsRate] = useState(20);

  const [securedFund, setSecuredFund] = useState(true);
  const [startFund, setStartFund] = useState(false);

  const { setCurrency } = useCurrency();

  const handleFinish = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const finalNickname = nickname || firstName;

      await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        nickname: finalNickname,
        phone,
        bdate: bdate || null
      });

      await supabase.auth.updateUser({
        data: {
          display_name: finalNickname,
          phone: phone?.trim() || null
        }
      });

      await supabase.from("wallets").upsert({
        user_id: user.id,
        balance: Number(balance) || 0,
        income: Number(income) || 0,
        expenses: Number(expenses) || 0,
        currency
      });

      await supabase.from("user_settings").upsert({
        user_id: user.id,
        primary_currency: currency,
        smart_savings_enabled: smartSavings,
        savings_rate: savingsRate / 100,
        secured_fund_enabled: securedFund,
        secured_fund_started: startFund,
        secured_fund_months_target: 6
      });

      setCurrency(currency);
      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <img src="/logo.png" style={bgLogo} />

      <div style={splitWrapper}>

        {/* LEFT CARD */}
        <div style={card}>
          <img src="/logo.png" style={{ height: 90, marginBottom: 10 }} />

          <div style={{ color: "#cbd5e1", marginBottom: 10 }}>
            Step {step} of 5
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h2 style={title}>Welcome</h2>
              <p style={subtitle}>Let’s set up your system</p>
              <button style={primaryBtn} onClick={() => setStep(2)}>
                Start
              </button>
            </>
          )}

          {/* STEP 2 PROFILE */}
          {step === 2 && (
            <>
              <h3 style={title}>Your Profile</h3>

              <input placeholder="First Name" onChange={e => setFirstName(e.target.value)} style={input} />
              <input placeholder="Last Name" onChange={e => setLastName(e.target.value)} style={input} />
              <input placeholder="Nickname" onChange={e => setNickname(e.target.value)} style={input} />
              <input placeholder="Phone" onChange={e => setPhone(e.target.value)} style={input} />
              <input type="date" onChange={e => setBdate(e.target.value)} style={input} />

              <button style={primaryBtn} onClick={() => setStep(3)}>Next</button>
            </>
          )}

          {/* STEP 3 MONEY */}
          {step === 3 && (
            <>
              <h3 style={title}>Your Finances</h3>

              <select value={currency} onChange={e => setLocalCurrency(e.target.value)} style={input}>
                <option value="PHP">₱ Philippine Peso</option>
                <option value="USD">$ US Dollar</option>
                <option value="EUR">€ Euro</option>
              </select>

              <input placeholder="Current Balance" onChange={e => setBalance(e.target.value)} style={input} />
              <input placeholder="Monthly Income" onChange={e => setIncome(e.target.value)} style={input} />
              <input placeholder="Monthly Expenses" onChange={e => setExpenses(e.target.value)} style={input} />

              <button style={primaryBtn} onClick={() => setStep(4)}>Next</button>
            </>
          )}

          {/* STEP 4 SMART SAVINGS */}
          {step === 4 && (
            <>
              <h3 style={title}>Smart Savings</h3>

              <label style={rowBetween}>
                <span style={{ color: "#fff" }}>Enable</span>
                <input type="checkbox" checked={smartSavings} onChange={() => setSmartSavings(!smartSavings)} />
              </label>

              {smartSavings && (
                <>
                  <div style={label}>Rate: {savingsRate}%</div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={savingsRate}
                    onChange={e => setSavingsRate(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </>
              )}

              <button style={primaryBtn} onClick={() => setStep(5)}>Next</button>
            </>
          )}

          {/* STEP 5 EMERGENCY FUND */}
          {step === 5 && (
            <>
              <h3 style={title}>Emergency Fund</h3>

              <label style={rowBetween}>
                <span style={{ color: "#fff" }}>Enable</span>
                <input type="checkbox" checked={securedFund} onChange={() => setSecuredFund(!securedFund)} />
              </label>

              {securedFund && (
                <>
                  <p style={subtitle}>
                    Target: {Number(expenses || 0) * 6}
                  </p>

                  <label style={rowBetween}>
                    <span style={{ color: "#fff" }}>Start now</span>
                    <input type="checkbox" checked={startFund} onChange={() => setStartFund(!startFund)} />
                  </label>
                </>
              )}

              <button style={primaryBtn} onClick={handleFinish} disabled={loading}>
                {loading ? "Saving..." : "Finish"}
              </button>
            </>
          )}
        </div>

        {/* RIGHT INFO PANEL */}
        <div style={infoPanel}>
          {step === 1 && <p>We’ll build your financial system step-by-step.</p>}
          {step === 2 && <p>This personalizes your account and identity.</p>}
          {step === 3 && <p>This defines how your money flows.</p>}
          {step === 4 && <p>Automatically save without thinking.</p>}
          {step === 5 && <p>Build protection against emergencies.</p>}
        </div>

      </div>
    </div>
  );
}

/* STYLES */

const container = {
  minHeight: "100vh",
  background: "#b1dede",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative"
};

const bgLogo = {
  position: "absolute",
  width: "1200px",
  opacity: 0.2,
  top: "70%",
  left: "50%",
  transform: "translate(-50%, -50%)"
};

const splitWrapper = {
  display: "flex",
  width: "900px",
  gap: 40,
  zIndex: 2
};

const card = {
  width: 380,
  background: "#293152",
  padding: "40px 30px",
  borderRadius: 16
};

const infoPanel = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  fontSize: 18,
  color: "#1e293b"
};

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 10,
  border: "1px solid #444",
  background: "#1e293b",
  color: "#fff"
};

const primaryBtn = {
  width: "100%",
  padding: 14,
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer"
};

const title = { color: "#fff", marginBottom: 10 };
const subtitle = { color: "#cbd5e1", marginBottom: 10 };
const label = { color: "#cbd5e1", marginBottom: 10 };

const rowBetween = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10
};