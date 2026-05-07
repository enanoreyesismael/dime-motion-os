import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔁 REDIRECT (ONLY CALLED MANUALLY AFTER LOGIN)
  const handleRedirect = async (session) => {
    const user = session?.user;
    if (!user) return;

    // 🚫 BLOCK if not verified
    if (!user.email_confirmed_at) {
      alert("Please verify your email first");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    const { data: settings } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile || !settings) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/dashboard";
    }
  };

  // 🔵 LOGIN (ONLY PLACE WHERE REDIRECT HAPPENS)
  const handleLogin = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // ✅ redirect ONLY after user action
    await handleRedirect(data.session);

    setLoading(false);
  };

  // 🟢 SIGN UP (NO AUTO LOGIN)
  const handleSignup = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to verify your account");
      // 🚫 DO NOT redirect
      // 🚫 DO NOT login automatically
    }

    setLoading(false);
  };

  // 🟡 RESET PASSWORD
  const handleReset = async () => {
    if (!email) return alert("Enter your email first");

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) alert(error.message);
    else alert("Check your email to reset password");
  };

  // 🔴 GOOGLE LOGIN (still redirects after login)
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) alert(error.message);
  };

  return (
    <div style={container}>
      <img src="/logo.png" alt="bg" style={bgLogo} />

      <div style={card}>
        <img src="/logo.png" alt="DimeMotion" style={{ height: 120, marginBottom: 10 }} />

        <h2 style={{ marginBottom: 20 }}>Welcome</h2>

        <div style={formGroup}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button style={primaryBtn} onClick={handleLogin} disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>

          <button style={secondaryBtn} onClick={handleSignup} disabled={loading}>
            Create Account
          </button>

          <button style={linkBtn} onClick={handleReset}>
            Forgot Password?
          </button>

          <div style={{ marginTop: 20 }}>
            <div style={divider}>or continue with</div>

            <button style={socialBtn} onClick={handleGoogleLogin}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="18" />
              Continue with Google
            </button>

            <button style={socialBtn}>
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" width="18" />
              Continue with Facebook
            </button>

            <button style={socialBtn}>
              <img src="https://www.svgrepo.com/show/475646/apple-color.svg" width="18" />
              Continue with Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎨 STYLES (UNCHANGED)

const container = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  background: "#b1dede",
  overflow: "hidden"
};

const bgLogo = {
  position: "absolute",
  width: "1400px",
  opacity: 0.3,
  top: "70%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
  zIndex: 0
};

const card = {
  width: 380,
  background: "#293152",
  opacity: 0.8,
  padding: "40px 30px",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 1
};

const formGroup = {
  width: "100%",
  maxWidth: 320
};

const inputStyle = {
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 15,
  boxSizing: "border-box"
};

const primaryBtn = {
  width: "100%",
  padding: 14,
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  marginBottom: 12,
  cursor: "pointer",
  fontWeight: "bold"
};

const secondaryBtn = {
  width: "100%",
  padding: 14,
  background: "#e5e7eb",
  border: "none",
  borderRadius: 10,
  marginBottom: 12,
  cursor: "pointer"
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "#3b82f6",
  cursor: "pointer",
  fontSize: 14,
  marginBottom: 10
};

const divider = {
  textAlign: "center",
  fontSize: 12,
  color: "#888",
  marginBottom: 10
};

const socialBtn = {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  cursor: "pointer"
};