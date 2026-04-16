import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Shield, Landmark, Users, DollarSign, Lock, Check } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop";

const TRUST_TYPES = [
  { name: "Revocable Living Trust", desc: "The most common trust type. You retain full control and can modify or dissolve the trust at any time. Assets avoid probate upon your death, protecting privacy and saving time." },
  { name: "Irrevocable Trust", desc: "Once established, the trust cannot be modified. Assets are legally owned by the trust, offering protection from creditors and potential tax advantages." },
  { name: "Testamentary Trust", desc: "Created by the terms of a will and only comes into effect upon the grantor's death. Used to manage assets for minor children or beneficiaries with special needs." },
  { name: "Special Needs Trust", desc: "Designed to benefit a person with disabilities without disqualifying them from government benefits such as Medicaid or Supplemental Security Income." },
  { name: "Charitable Trust", desc: "Used to transfer assets to a charity, either immediately or upon death. Can provide income during your lifetime while delivering a charitable bequest." },
  { name: "Institutional Trustee Account", desc: "For professional trustees managing assets on behalf of multiple beneficiaries — with sub-account management and reporting tools." },
];

const FEATURES = [
  { icon: Shield, title: "Full Trustee Authority", desc: "Trustees have complete authority to buy, sell, and manage all assets in the account on behalf of beneficiaries." },
  { icon: Landmark, title: "Legal Title in Trust's Name", desc: "The brokerage account is titled in the name of the trust — not the individual — as required for proper trust administration." },
  { icon: DollarSign, title: "Same Investment Access", desc: "Trust accounts have the same access to global markets, securities, and trading capabilities as individual accounts." },
  { icon: Users, title: "Successor Trustee Support", desc: "Name successor trustees who can take over account management if the original trustee is unable to act." },
  { icon: Lock, title: "Estate Privacy", desc: "Unlike a will, a trust avoids public probate proceedings — keeping your estate distribution private." },
  { icon: Check, title: "Tax ID Accepted", desc: "Trusts with an EIN/Tax ID can open accounts. Revocable trusts may use the grantor's SSN if applicable." },
];

export default function TrustAccounts() {
  return (
    <MarketingPage
      eyebrow="Trust Accounts"
      title={<>Protect and Manage<br /><span style={{ color: "#fff" }}>Trust Assets</span></>}
      subtitle="INT Brokers offers brokerage accounts for all major trust structures — revocable, irrevocable, charitable, special needs, and institutional trustee accounts — with the same institutional-grade tools."
      heroImage={IMG}
      stats={[
        { value: "6+", label: "Trust Account Types" },
        { value: "$0", label: "Account Fees" },
        { value: "170+", label: "Markets Available" },
        { value: "SIPC", label: "Protected" },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Full trustee capabilities</h2>
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
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Supported trust account types</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {TRUST_TYPES.map(t => (
              <div key={t.name} style={{ border: "1px solid #E6E8EB", borderRadius: 14, padding: "24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>{t.name}</h3>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
