import React from "react";

interface LogoProps {
  variant?: "white" | "dark";
  height?: number;
  style?: React.CSSProperties;
}

export function Logo({ variant = "white", height = 36, style }: LogoProps) {
  const c  = variant === "white" ? "#ffffff" : "#0d1520";
  const co = variant === "white" ? 0.85 : 0.7;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 44"
      fill="none"
      style={{ height, width: "auto", display: "block", flexShrink: 0, ...style }}
      aria-label="INT Brokers"
    >
      {/* Bar chart icon */}
      <rect x="2"  y="22" width="7" height="20" rx="2" fill={c} />
      <rect x="12" y="14" width="7" height="28" rx="2" fill={c} />
      <rect x="22" y="6"  width="7" height="36" rx="2" fill={c} />
      {/* Upward trend line */}
      <polyline points="3,30 12,20 22,10 30,6" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.42" fill="none" />
      {/* INT — bold */}
      <text x="38" y="32" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="800" fill={c} letterSpacing="-0.5">INT</text>
      {/* BROKERS — light */}
      <text x="74" y="32" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="400" fill={c} opacity={co} letterSpacing="2">BROKERS</text>
    </svg>
  );
}
