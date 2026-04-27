import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login";
import AppShell from "./AppShell";
import { CurrencyProvider } from "./context/CurrencyContext"; // ✅ added

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session) return <Login />;

  return (
    <CurrencyProvider>
      <AppShell />
    </CurrencyProvider>
  );
}