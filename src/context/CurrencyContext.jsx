import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { supabase } from "../lib/supabase";

const CurrencyContext =
  createContext();

export function CurrencyProvider({
  children
}) {
  // PRIMARY
  const [currency, setCurrency] =
    useState("PHP");

  // SECONDARY
  const [
    secondaryCurrency,
    setSecondaryCurrency
  ] = useState("USD");

  const [
    showSecondary,
    setShowSecondary
  ] = useState(false);

  // RATES
  const [rates, setRates] =
    useState({ USD: 1 });

  // SYMBOLS
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

  // PRIMARY SYMBOL
  const symbol =
    currencySymbols[currency] ||
    "$";

  // SECONDARY SYMBOL
  const secondarySymbol =
    currencySymbols[
      secondaryCurrency
    ] || "$";

  // SECONDARY RATE
  const secondaryRate =
    rates[
      secondaryCurrency
    ] || 1;

  // LOAD USER SETTINGS
  useEffect(() => {
    const loadCurrency =
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
            .select(`
              primary_currency,
              secondary_currency,
              show_secondary
            `)
            .eq(
              "user_id",
              user.id
            )
            .maybeSingle();

        // PRIMARY
        if (
          data?.primary_currency
        ) {
          setCurrency(
            data.primary_currency
          );
        }

        // SECONDARY
        if (
          data?.secondary_currency
        ) {
          setSecondaryCurrency(
            data.secondary_currency
          );
        }

        // TOGGLE
        setShowSecondary(
          data?.show_secondary ||
            false
        );
      };

    loadCurrency();
  }, []);

  // FETCH RATES
  useEffect(() => {
    const fetchRates =
      async () => {
        try {
          const res =
            await fetch(
              "https://open.er-api.com/v6/latest/USD"
            );

          const data =
            await res.json();

          if (data?.rates) {
            setRates({
              USD: 1,
              ...data.rates
            });
          }
        } catch (err) {
          console.error(
            "Rate fetch error:",
            err
          );
        }
      };

    fetchRates();
  }, []);

  // USER INPUT → USD
  const toUSD = (amount) => {
    const safeAmount =
      Number(amount) || 0;

    const rate =
      rates[currency] || 1;

    return safeAmount / rate;
  };

  // USD → PRIMARY
  const fromUSD = (
    amountUSD
  ) => {
    const safeAmount =
      Number(amountUSD) || 0;

    const rate =
      rates[currency] || 1;

    return safeAmount * rate;
  };

  // USD → SECONDARY
  const convertSecondary = (
    amountUSD
  ) => {
    const safeAmount =
      Number(amountUSD) || 0;

    return (
      safeAmount *
      secondaryRate
    );
  };

  return (
    <CurrencyContext.Provider
      value={{
        // PRIMARY
        currency,
        setCurrency,
        symbol,

        // SECONDARY
        secondaryCurrency,
        setSecondaryCurrency,

        showSecondary,
        setShowSecondary,

        secondarySymbol,

        // RATES
        rates,

        // CONVERSIONS
        toUSD,
        fromUSD,
        convertSecondary
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency =
  () => useContext(
    CurrencyContext
  );