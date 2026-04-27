import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bg =
    type === "success" ? "#10b981" :
    type === "error" ? "#ef4444" :
    "#3b82f6";

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      background: bg,
      color: "white",
      padding: "12px 16px",
      borderRadius: 10,
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      zIndex: 9999,
      minWidth: 220,
      fontSize: 14
    }}>
      {message}
    </div>
  );
}