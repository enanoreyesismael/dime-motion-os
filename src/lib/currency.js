export const currencySymbols = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export const formatCurrency = (value, currency = "USD") => {
  const symbol = currencySymbols[currency] || "$";
  return `${symbol}${(value || 0).toLocaleString()}`;
};