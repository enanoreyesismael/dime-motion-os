import { useCurrency } from "../context/CurrencyContext";

export default function MoneyDisplay({
  amount = 0,
  large = false,
  color = "#062B68",
  secondaryColor = "#64748B",
  weight = 700
}) {
  const {
    symbol,
    fromUSD,

    showSecondary,
    secondarySymbol,
    convertSecondary
  } = useCurrency();

  const primaryValue =
    fromUSD(
      Number(amount) || 0
    ).toLocaleString();

  const secondaryValue =
    convertSecondary(
      Number(amount) || 0
    ).toLocaleString();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        flexWrap: "wrap"
      }}
    >
      {/* PRIMARY */}
      <span
        style={{
          fontSize: large
            ? 42
            : 24,

          fontWeight: weight,

          color,

          lineHeight: 1.1
        }}
      >
        {symbol}
        {primaryValue}
      </span>

      {/* SECONDARY */}
      {showSecondary && (
        <span
          style={{
            fontSize: large
              ? 16
              : 13,

            color:
              secondaryColor,

            opacity: 0.8,

            fontWeight: 500
          }}
        >
          (
          {
            secondarySymbol
          }
          {secondaryValue}
          )
        </span>
      )}
    </div>
  );
}