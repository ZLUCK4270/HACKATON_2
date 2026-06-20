"use client";

import React, { useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  isOpen: boolean;
  isDangerous?: boolean;
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, isOpen, isDangerous = true }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };

  const accentColor = isDangerous ? "#ef4444" : "#f59e0b";
  const accentGlow  = isDangerous ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)";
  const IconComp    = isDangerous ? AlertTriangle : HelpCircle;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onCancel}
    >
      <div
        className="animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          width: "100%", maxWidth: "420px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "1.5rem 1.5rem 1rem",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
            background: isDangerous ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconComp size={20} color={accentColor} />
          </div>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {title}
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
          <p style={{ margin: "0 0 1.5rem", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {message}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: "9px 20px", borderRadius: "8px",
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500,
                opacity: loading ? 0.5 : 1, cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                padding: "9px 24px", borderRadius: "8px",
                background: accentColor, border: "none", color: "#fff",
                fontSize: "0.875rem", fontWeight: 600,
                boxShadow: `0 4px 14px ${accentGlow}`,
                opacity: loading ? 0.7 : 1, transition: "all 0.2s", cursor: "pointer",
              }}
            >
              {loading ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
