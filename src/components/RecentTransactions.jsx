import { useCurrency } from "../context/CurrencyContext";

export default function RecentTransactions({
  incomes = [],
  expenses = [],
  getSourceName
}) {
  const { symbol, fromUSD } = useCurrency();

  // MIX + SORT NEWEST FIRST
  const mergedTransactions = [
    ...incomes,
    ...expenses
  ].sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  );

  return (
    <>
      {mergedTransactions.map((item) => {
        const isIncome = !!item.source_id;

        return (
          <div
            key={item.id}
            className="card"
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <div>
              <strong>
                {isIncome
                  ? getSourceName(
                      item.source_id
                    )
                  : item.category}
              </strong>

              <p
                style={{
                  fontSize: 12
                }}
              >
                {new Date(
                  item.created_at
                ).toLocaleString()}
              </p>
            </div>

            <h3
              style={{
                color: isIncome
                  ? "#10b981"
                  : "#ef4444"
              }}
            >
              {isIncome ? "+" : "-"}
              {symbol}
              {fromUSD(
                item.amount
              ).toLocaleString()}
            </h3>
          </div>
        );
      })}
    </>
  );
}