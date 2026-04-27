import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("PHP");
  const [rates, setRates] = useState({ PHP: 1 });

  const currencySymbols = {
    PHP: "₱",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    SGD: "S$",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    INR: "₹",
    BRL: "R$",
    MXN: "MX$",
    ZAR: "R",
    NGN: "₦",
    GHS: "GH₵",
    KES: "KSh",
    EGP: "E£",
    AED: "د.إ",
    IDR: "Rp"
  };

  const symbol = currencySymbols[currency] || "$";

  // 🔥 LOAD USER CURRENCY
  useEffect(() => {
    const loadCurrency = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_settings")
        .select("currency")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.currency) setCurrency(data.currency);
    };

    loadCurrency();
  }, []);

  // 🔥 FETCH EXCHANGE RATES (LIVE)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/PHP");
        const data = await res.json();

        if (data?.rates) {
          setRates({
            PHP: 1,
            ...data.rates
          });
        }
      } catch (err) {
        console.error("Rate fetch error:", err);
      }
    };

    fetchRates();
  }, []);

  // 🔥 CONVERSION FUNCTION (SAFE FIX)
  const convert = (amount) => {
    const safeAmount = Number(amount) || 0;
    const rate = rates[currency] || 1;
    return safeAmount * rate;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      symbol,
      convert
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);