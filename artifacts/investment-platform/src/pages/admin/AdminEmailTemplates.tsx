import { useState } from "react";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import { Link } from "wouter";

const CARD  = "#111827";
const BORD  = "rgba(255,255,255,0.07)";
const TEXT  = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.38)";

const TEMPLATES = [
  { id: "application_received",   label: "Application Received",     desc: "Sent when user submits onboarding form" },
  { id: "welcome",                label: "Welcome Email",             desc: "Sent after successful registration" },
  { id: "kyc_submitted",          label: "KYC Under Review",          desc: "Sent when KYC docs are uploaded" },
  { id: "kyc_approved",           label: "KYC Approved",              desc: "Sent when identity is verified" },
  { id: "kyc_rejected",           label: "KYC Rejected",              desc: "Sent when verification fails" },
  { id: "account_activated",      label: "Account Activated",         desc: "Sent with login credentials on activation" },
  { id: "forgot_pin",             label: "Passcode Reset",            desc: "Sent when user requests passcode reset" },
  { id: "deposit_confirmation",   label: "Deposit Confirmed",         desc: "Sent after deposit is processed" },
  { id: "withdrawal_confirmation",label: "Withdrawal Initiated",      desc: "Sent when withdrawal is submitted" },
  { id: "trade_confirmation",     label: "Trade Confirmation",        desc: "Sent after buy/sell order execution" },
];

export default function AdminEmailTemplates() {
  const [selected, setSelected] = useState<string | null>(null);

  const previewUrl = selected ? `/api/admin/email-preview/${selected}` : null;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", fontFamily: "Inter,system-ui,sans-serif", padding: "0 0 40px" }}>
      <style>{`
        .tmpl-card:hover { background: rgba(255,255,255,0.04) !important; }
        .tmpl-card-active { background: rgba(59,130,246,0.08) !important; border-color: rgba(59,130,246,0.3) !important; }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: MUTED, textDecoration: "none", fontSize: 13, marginBottom: 16,
        }}>
          <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Back to Dashboard
        </Link>
        <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Communication</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: "-0.02em" }}>Email Templates</h1>
        <p style={{ fontSize: 14, color: MUTED, marginTop: 6, margin: "6px 0 0" }}>Visual preview of all transactional emails sent to users.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "320px 1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap: 16, alignItems: "start" }}>
        {/* Template list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TEMPLATES.map(t => (
            <button key={t.id}
              onClick={() => setSelected(selected === t.id ? null : t.id)}
              className={`tmpl-card${selected === t.id ? " tmpl-card-active" : ""}`}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px",
                background: CARD, border: `1px solid ${BORD}`, borderRadius: 14,
                cursor: "pointer", textAlign: "left", transition: "all 0.1s",
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: selected === t.id ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Mail style={{ width: 16, height: 16, color: selected === t.id ? "#3b82f6" : MUTED }} strokeWidth={1.5} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, marginBottom: 3 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{t.desc}</div>
              </div>
              {selected === t.id && (
                <div style={{ marginLeft: "auto", flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", marginTop: 6 }} />
              )}
            </button>
          ))}
        </div>

        {/* Preview panel */}
        {selected && previewUrl && (
          <div style={{
            background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden",
            position: "sticky", top: 24, height: "calc(100vh - 160px)",
            display: "flex", flexDirection: "column",
          }}>
            {/* Preview header */}
            <div style={{
              padding: "14px 20px", borderBottom: `1px solid ${BORD}`,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT }}>
                  {TEMPLATES.find(t => t.id === selected)?.label}
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Live HTML preview</div>
              </div>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 8, border: `1px solid ${BORD}`,
                color: MUTED, textDecoration: "none", fontSize: 12,
                background: "transparent",
              }}>
                <ExternalLink style={{ width: 13, height: 13 }} strokeWidth={1.5} />
                Open
              </a>
            </div>

            {/* Iframe */}
            <iframe
              key={selected}
              src={previewUrl}
              title={selected}
              style={{
                flex: 1, width: "100%", border: "none",
                background: "#f0f2f5",
              }}
              sandbox="allow-same-origin"
            />
          </div>
        )}

        {/* Empty state when no selection */}
        {!selected && (
          <div style={{
            gridColumn: "1 / -1", background: CARD, border: `1px solid ${BORD}`, borderRadius: 16,
            padding: "64px 40px", textAlign: "center", display: "none",
          }} />
        )}
      </div>
    </div>
  );
}
