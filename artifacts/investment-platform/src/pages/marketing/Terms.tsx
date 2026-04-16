import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";

const SECTIONS = [
  {
    title: "1. Agreement to Terms",
    body: `By accessing or using the INT Brokers (Vault Wealth Management LLC) platform, website, mobile applications, or any related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Services. These Terms constitute a legally binding agreement between you and Vault Wealth Management LLC, a registered broker-dealer, member FINRA/SIPC.`,
  },
  {
    title: "2. Eligibility and Account Registration",
    body: `To open a brokerage account with INT Brokers, you must: (a) be at least 18 years of age; (b) have a valid Social Security Number or Tax Identification Number; (c) be a legal resident or citizen of an eligible jurisdiction; (d) provide accurate and complete identity verification documents as required by applicable Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations. INT Brokers reserves the right to refuse, suspend, or terminate accounts at its sole discretion, including where it suspects fraudulent activity, regulatory non-compliance, or violations of these Terms.`,
  },
  {
    title: "3. Brokerage Services and Investment Risk",
    body: `INT Brokers provides brokerage and custody services for securities, derivatives, and cryptocurrency assets. All investments involve risk. The value of securities can decrease as well as increase. Past performance is not indicative of future results. INT Brokers does not provide investment advice, portfolio management, or financial planning services unless separately agreed in writing. You are solely responsible for your investment decisions and for ensuring that any investment is suitable for your financial situation, objectives, and risk tolerance.`,
  },
  {
    title: "4. Commissions, Fees, and Charges",
    body: `Commissions and fees are as described in INT Brokers' published commission schedule, which may be updated from time to time. By trading, you agree to pay applicable commissions. Margin interest accrues daily on debit balances at the rates published in our margin rate schedule. We reserve the right to modify fees with 30 days' written notice. Certain exchange fees, regulatory fees (e.g., SEC Section 31 fees, FINRA trading activity fees), and clearing fees are passed through to clients as applicable.`,
  },
  {
    title: "5. Margin Accounts and Leverage",
    body: `Margin trading involves significant risk and is not suitable for all investors. By using margin, you may lose more than your initial investment. INT Brokers may liquidate positions in your account without prior notice if your margin falls below required levels. Margin calls must be met promptly. INT Brokers sets its own house margin requirements, which may be more stringent than regulatory minimums. Your margin account agreement, incorporated by reference, governs all margin-related terms.`,
  },
  {
    title: "6. Order Execution and Best Execution",
    body: `INT Brokers routes orders to trading venues on the basis of achieving best execution, considering factors including price, speed, likelihood of execution, and cost. We use a proprietary SmartRouting system that continuously evaluates available execution venues. We do not accept payment for order flow on equities. Detailed information about our order routing practices is available in our Order Routing Disclosure document. We make no guarantee that any particular order will be executed at the best available price.`,
  },
  {
    title: "7. Cryptocurrency Services",
    body: `Cryptocurrency trading and custody services are provided subject to additional terms and conditions. Cryptocurrencies are highly volatile, largely unregulated, and not covered by SIPC or FDIC insurance. INT Brokers holds cryptocurrency assets in institutional cold storage under a custodial arrangement. Staking rewards, where offered, are variable and not guaranteed. Cryptocurrency trading is available 24/7 but may be interrupted for maintenance, regulatory compliance, or technical reasons.`,
  },
  {
    title: "8. Prohibited Activities",
    body: `You agree not to: (a) use the Services for any unlawful purpose, including money laundering, tax evasion, or market manipulation; (b) engage in wash trading, front-running, spoofing, or any form of market abuse; (c) attempt to gain unauthorized access to INT Brokers systems; (d) use automated bots or scripts to access the platform in violation of our API terms; (e) misrepresent your identity or provide false information during account registration or KYC verification.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, VAULT WEALTH MANAGEMENT LLC AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE TOTAL COMMISSIONS PAID BY YOU TO US IN THE 12 MONTHS PRECEDING THE CLAIM.`,
  },
  {
    title: "10. Dispute Resolution and Arbitration",
    body: `Any dispute, claim, or controversy arising from or relating to these Terms or the Services shall be resolved by binding arbitration administered by FINRA or the American Arbitration Association, as applicable, under its then-current rules. You waive any right to a jury trial. CLASS ACTION ARBITRATION IS NOT PERMITTED. This arbitration agreement is enforceable under the Federal Arbitration Act. Notwithstanding the foregoing, either party may seek emergency injunctive relief from a court of competent jurisdiction.`,
  },
  {
    title: "11. Governing Law",
    body: `These Terms shall be governed by and construed in accordance with the laws of the State of Connecticut, without regard to its conflict of law principles, except where preempted by federal law. For regulatory matters, applicable FINRA, SEC, and CFTC rules take precedence over these Terms to the extent of any conflict.`,
  },
  {
    title: "12. Modifications to Terms",
    body: `INT Brokers reserves the right to modify these Terms at any time. Significant changes will be communicated via email or in-platform notification at least 30 days before taking effect. Your continued use of the Services after any modification constitutes acceptance of the revised Terms. You are encouraged to review these Terms periodically.`,
  },
];

export default function Terms() {
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: "#fff" }}>
      <HomeNavbar />

      <div style={{ background: "#0F172A", padding: "80px 24px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", marginBottom: 12 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Last updated: April 9, 2026 · Vault Wealth Management LLC</p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px 96px" }}>
        <div style={{ padding: "20px 24px", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, marginBottom: 48 }}>
          <p style={{ fontSize: 13.5, color: "#92400E", lineHeight: 1.7 }}>
            <strong>Important:</strong> Please read these Terms of Service carefully before using the INT Brokers platform. By creating an account or using our services, you agree to be bound by these terms.
          </p>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={s.title} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: i < SECTIONS.length - 1 ? "1px solid #F5F6F7" : "none" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>{s.title}</h2>
            <p style={{ fontSize: 14.5, color: "#374151", lineHeight: 1.85 }}>{s.body}</p>
          </div>
        ))}

        <div style={{ padding: "28px", background: "#F5F6F7", border: "1px solid #E6E8EB", borderRadius: 12, marginTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Contact Legal</h3>
          <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.7 }}>
            For questions about these Terms, contact our legal team at <strong>legal@intbrokers.com</strong> or write to:<br />
            Vault Wealth Management LLC, Legal Department, One Pickwick Plaza, Greenwich, CT 06830
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
