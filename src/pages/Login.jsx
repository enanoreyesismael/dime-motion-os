import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔵 LOGIN
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/dashboard"; // ✅ redirect after login
    }
  };

  // 🟢 SIGN UP
  const handleSignup = async () => {
    if (!firstName) return alert("Enter first name");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName
        }
      }
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to confirm your account");
    }
  };

  // 🟡 RESET PASSWORD
  const handleReset = async () => {
    if (!email) return alert("Enter your email first");

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to reset password");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb"
      }}
    >
      <div
        style={{
          width: 360,
          background: "#fff",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Welcome</h2>

        {/* FIRST NAME */}
        <input
          placeholder="First Name (for signup)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={inputStyle}
        />

        {/* EMAIL */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {/* LOGIN */}
        <button style={primaryBtn} onClick={handleLogin}>
          Login
        </button>

        {/* SIGNUP */}
        <button style={secondaryBtn} onClick={handleSignup}>
          Create Account
        </button>

        {/* RESET PASSWORD */}
        <button style={linkBtn} onClick={handleReset}>
          Forgot Password?
        </button>
      </div>
    </div>
  );
}

// 🎨 STYLES
const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14
};

const primaryBtn = {
  width: "100%",
  padding: 12,
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  marginBottom: 10,
  cursor: "pointer",
  fontWeight: "bold"
};

const secondaryBtn = {
  width: "100%",
  padding: 12,
  background: "#f1f5f9",
  border: "none",
  borderRadius: 8,
  marginBottom: 10,
  cursor: "pointer"
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "#3b82f6",
  cursor: "pointer",
  fontSize: 14
};