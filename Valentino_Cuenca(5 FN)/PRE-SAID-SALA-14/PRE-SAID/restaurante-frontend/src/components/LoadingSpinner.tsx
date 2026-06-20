"use client";

export function LoadingSpinner({ message = "Cargando..." }: { message?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 0" }}>
      <div style={{ position: "relative", width: "48px", height: "48px", marginBottom: "1rem" }}>
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.06)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "#f59e0b",
          animation: "spinGold 0.9s linear infinite",
        }} />
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{message}</p>
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="skeleton" style={{ height: "24px", width: "40%" }} />
      <div className="skeleton" style={{ height: "16px", width: "70%" }} />
      <div className="skeleton" style={{ height: "16px", width: "55%" }} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="skeleton" style={{ height: "20px", width: "35%" }} />
        <div className="skeleton" style={{ height: "20px", width: "20%", borderRadius: "99px" }} />
      </div>
      <div className="skeleton" style={{ height: "40px", width: "50%" }} />
      <div className="skeleton" style={{ height: "14px", width: "65%" }} />
      <div className="skeleton" style={{ height: "36px", width: "100%", borderRadius: "8px" }} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      {[20, 40, 25, 15, 20].map((w, i) => (
        <td key={i} style={{ padding: "14px 20px" }}>
          <div className="skeleton" style={{ height: "16px", width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}
