export default function MiniCard({
  title,
  amount,
  count,
  color = "#3b82f6",
  onClick
}) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: 18,
        cursor: "pointer",
        background: `linear-gradient(135deg, ${color}, ${color})`,
        color: "white",
        borderRadius: 20,
        minHeight: 130,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "0.2s",
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
      }}
    >
      {/* TITLE */}
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700
          }}
        >
          {title}
        </h3>
      </div>

      {/* AMOUNT */}
      <div>
        <h2
          style={{
            margin: "10px 0 4px 0",
            fontSize: 28,
            fontWeight: 800
          }}
        >
          {amount}
        </h2>

        {/* COUNT */}
        <p
          style={{
            margin: 0,
            opacity: 0.85,
            fontSize: 13
          }}
        >
          {count}
        </p>
      </div>
    </div>
  );
}