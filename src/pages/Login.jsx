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
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Welcome</h2>

      {/* FIRST NAME */}
      <input
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      {/* EMAIL */}
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      {/* PASSWORD */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 20 }}
      />

      {/* LOGIN */}
      <button
        onClick={handleLogin}
        style={{ width: "100%", marginBottom: 10 }}
      >
        Login
      </button>

      {/* SIGNUP */}
      <button
        onClick={handleSignup}
        style={{ width: "100%", marginBottom: 10 }}
      >
        Create Account
      </button>

      {/* RESET PASSWORD */}
      <button
        onClick={handleReset}
        style={{ width: "100%" }}
      >
        Forgot Password
      </button>
    </div>
  );
}