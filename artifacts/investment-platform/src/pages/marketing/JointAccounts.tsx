import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Users, Shield, DollarSign, TrendingUp, BarChart2, Check } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&auto=format&fit=crop";

const FEATURES = [
  { icon: Users, title: "Up to 4 Account Holders", desc: "Add up to four people to a joint account. All holders have equal access to manage and invest." },
  { icon: Shield, title: "Estate Planning Benefits", desc: "Joint tenancy with right of survivorship (JTWROS) allows assets to pass directly to survivors without probate." },
  { icon: DollarSign, title: "Shared Investment Access", desc: "Full access to INT Brokers' 170+ global markets, commission-free stocks, and all asset classes." },
  { icon: TrendingUp, title: "Ideal for Couples & Families", desc: "Perfect for spouses building shared wealth or parents investing with adult children." },
  { icon: Check, title: "Simplified Reporting", desc: "All transactions, gains, and losses reported on a single account statement and 1099 form." },
  { icon: BarChart2, title: "Equal Contribution Rights", desc: "Any holder can fund the account. Deposits, withdrawals, and trading are accessible to all." },
];

const TYPES = [
  { name: "Joint Tenants with Right of Survivorship (JTWROS)", desc: "The most common joint account type. Upon one owner's death, their share passes automatically to the surviving owner(s) without going through probate. Ideal for spouses and domestic partners.", pros: ["Avoids probate", "Automatic survivorship", "Simplified estate transfer"] },
  { name: "Tenants in Common (TIC)", desc: "Each owner holds a defined percentage of the account. Upon an owner's death, their share passes to their estate (per their will), NOT to the other owner(s). More complex estate planning.", pros: ["Custom ownership percentages", "Estate flexibility", "No automatic survivorship"] },
];

export default function JointAccounts() {
  return (
    <MarketingPage
      eyebrow="Joint Brokerage Accounts"
      title={<>Invest Together —<br /><span style={{ background: "linear-gradient(90deg,#e8394a,#ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Joint Accounts</span></>}
      subtitle="Open a joint brokerage account with up to four people. Build shared wealth together with full access to INT Brokers' global markets, commission-free trading, and estate planning benefits."
      heroImage={IMG}
      stats={[
        { value: "4", label: "Max Account Holders" },
        { value: "$0", label: "Account Minimum" },
        { value: "170+", label: "Markets Available" },
        { value: "SIPC", label: "Protected" },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Built for shared investing</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px" }}>
                <Icon size={22} color="#374151" strokeWidth={1.5} style={{ marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Two types of joint ownership</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))", gap: 24 }}>
            {TYPES.map(t => (
              <div key={t.name} style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "#0F172A", padding: "24px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>{t.name}</h3>
                </div>
                <div style={{ padding: "24px" }}>
                  <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.8, marginBottom: 16 }}>{t.desc}</p>
                  {t.pros.map(p => (
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Check size={14} color="#374151" strokeWidth={2.5} />
                      <span style={{ fontSize: 13, color: "#374151" }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
