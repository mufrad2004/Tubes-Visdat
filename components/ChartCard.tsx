// components/ChartCard.tsx
import React from "react";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function ChartCard({ title, description, children }: Props) {
  return (
    <section
      style={{
        backgroundColor: "#020617",
        borderRadius: 16,
        padding: 16,
        border: "1px solid #1f2937",
        boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <header>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h2>
        {description && (
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
            {description}
          </p>
        )}
      </header>
      <div style={{ width: "100%", height: 280 }}>{children}</div>
    </section>
  );
}
