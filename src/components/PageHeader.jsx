export default function PageHeader({ icon, title, subtitle, right }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          background: "#eef2ff",
          padding: 8,
          borderRadius: 10,
          display: "flex",
          alignItems: "center"
        }}>
          {icon}
        </div>

        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          {subtitle && (
            <p style={{ margin: 0, marginTop: 15, fontSize: 12, color: "#64748b" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      {right && <div>{right}</div>}
    </div>
  );
}