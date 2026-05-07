export default function EmergencyFundCard({
  data,
  symbol,
  fromUSD,
  onAddFunds,
  card,
  progressBg,
  progressFill
}) {
  const {
    saved = 0,
    target = 0,
    percent = 0,
    gap = 0,
    monthsCovered = 0,
    monthlyContribution = 0,
    monthsToGoal = 0
  } = data;

  const actionBtn = {
  background: "#4fee7c",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer"
};

  return (
    <div style={{ ...card, padding: 20, marginTop: 20 }}>
      
      {/* TOP GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center"
      }}>

        {/* LEFT */}
        <div>
          <h2 style={{ margin: 0 }}>🛡 Secured You</h2>

          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            You need{" "}
            <strong>
              {symbol}{fromUSD(gap).toLocaleString()}
            </strong>{" "}
            more to be fully secured
          </p>

          <p style={{ fontSize: 13 }}>
            Covers <strong>{monthsCovered.toFixed(1)}</strong> months
          </p>
        </div>

        {/* CENTER */}
        <div style={{
          textAlign: "center",
          fontSize: 25,
          color: "#64748b"
        }}>
          Emergency Fund Goal
        </div>

        {/* RIGHT */}
        

<div style={{ textAlign: "right" }}>
      <button style={actionBtn} onClick={onAddFunds}>
  + Add Funds
</button>

          <h2 style={{ marginTop: 8 }}>
            Target: {symbol}{fromUSD(target).toLocaleString()}
          </h2>
        </div>

      </div>

      {/* PROGRESS BAR */}
      <div style={{ marginTop: 15 }}>
        <div style={progressBg}>
          <div
            style={{
              ...progressFill,
              width: `${percent}%`,
              background:
                percent === 0 ? "#cbd5f5" : "#3b82f6"
            }}
          />
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        marginTop: 12
      }}>

        <div>
          {symbol}
          {fromUSD(saved).toLocaleString()} saved of{" "}
          {symbol}
          {fromUSD(target).toLocaleString()}
        </div>

        <div style={{ textAlign: "center" }}>
          <span style={{
            fontSize: 12,
            padding: "5px 10px",
            borderRadius: 8,
            background:
              percent >= 100 ? "#dcfce7" :
              percent >= 60 ? "#dbeafe" :
              "#fef3c7",
            color:
              percent >= 100 ? "#166534" :
              percent >= 60 ? "#1d4ed8" :
              "#92400e"
          }}>
            {percent >= 100
              ? "Fully Secured"
              : percent >= 60
              ? "On Track"
              : "Building Protection"}
          </span>
        </div>

        <div style={{ textAlign: "right", fontSize: 12 }}>
          {Math.round(percent)}% complete
        </div>

      </div>

      {/* ACTION BOX */}
      <div style={{
        marginTop: 14,
        padding: 12,
        borderRadius: 10,
        background: "#f1f5f9"
      }}>
        💡 Add{" "}
        <strong>
          {symbol}
          {fromUSD(monthlyContribution).toFixed(0)}
        </strong>{" "}
        this month to stay on track
      </div>

      {/* TIMELINE */}
      <p style={{
        marginTop: 8,
        fontSize: 12,
        color: "#64748b"
      }}>
        Reach goal in ~ <strong>{monthsToGoal}</strong> months, currently saving 
        <strong>  {}
          {symbol}
          {fromUSD(monthlyContribution).toFixed(0)}
        </strong>{" "}
        monthly
      </p>

    </div>
  );
}