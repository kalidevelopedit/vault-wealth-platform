import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us, including: (a) Identity information: full legal name, date of birth, government-issued ID numbers (Social Security Number, passport, national ID), tax identification numbers; (b) Contact information: email address, phone number, mailing address; (c) Financial information: income, net worth, investment experience, employment status, source of funds; (d) Biometric data: facial recognition and liveness verification video collected during KYC onboarding; (e) Device and usage data: IP address, browser type, operating system, access times, pages viewed, order history, and interaction data; (f) Payment information: bank account numbers and routing numbers for ACH transfers (we do not store full card numbers).`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the information we collect to: (a) Open, maintain, and service your brokerage account; (b) Verify your identity and comply with KYC/AML obligations under the Bank Secrecy Act and applicable FINRA and SEC rules; (c) Process orders, transactions, and fund transfers; (d) Generate required regulatory reports, tax documents (1099-B, 1099-DIV, etc.), and account statements; (e) Detect and prevent fraud, market manipulation, and unauthorized account access; (f) Improve our products, platforms, and services through usage analytics; (g) Communicate with you about your account, service updates, and marketing (where permitted by law); (h) Comply with applicable laws, regulations, and legal processes.`,
  },
  {
    title: "3. Information Sharing",
    body: `We do not sell your personal information to third parties. We may share your information with: (a) Regulatory bodies: FINRA, SEC, CFTC, FinCEN, IRS, and other regulators as required by law; (b) Clearing and custody partners: for trade settlement, position reporting, and asset safekeeping; (c) Technology service providers: cloud hosting, cybersecurity, identity verification, and analytics services under strict data processing agreements; (d) Legal and law enforcement: in response to valid subpoenas, court orders, or regulatory requests; (e) Affiliates: within the Interactive Brokers Group for operational and compliance purposes. All third parties handling your data are bound by contractual confidentiality obligations.`,
  },
  {
    title: "4. Data Security",
    body: `We implement industry-standard security measures including: AES-256 encryption for data at rest; TLS 1.3 for data in transit; multi-factor authentication for all account access; hardware security modules (HSMs) for cryptographic key management; 24/7 security operations centre monitoring; regular third-party penetration testing and vulnerability assessments; ISO 27001 certification for our information security management system. However, no method of electronic transmission or storage is 100% secure. We encourage you to use a strong, unique password and enable two-factor authentication on your account.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your personal information for as long as your account is active and for at least seven years after account closure, as required by applicable securities laws and regulations. Biometric verification data (liveness check videos) is retained for 90 days after account approval and then permanently deleted. Tax documents and regulatory records may be retained for up to ten years. You may request deletion of certain personal data, subject to our legal retention obligations.`,
  },
  {
    title: "6. Your Rights (GDPR and CCPA)",
    body: `Depending on your jurisdiction, you may have the following rights: (a) Right to access: request a copy of the personal data we hold about you; (b) Right to rectification: request correction of inaccurate data; (c) Right to erasure: request deletion of data (subject to legal retention requirements); (d) Right to data portability: receive your data in a structured, machine-readable format; (e) Right to object: object to certain processing activities; (f) Right to restrict processing: request that we limit how we use your data. California residents have additional rights under the CCPA, including the right to know, right to delete, and right to opt-out of data sales (we do not sell personal data). To exercise any of these rights, contact us at privacy@intbrokers.com.`,
  },
  {
    title: "7. Cookies and Tracking Technologies",
    body: `We use cookies and similar tracking technologies on our website and mobile applications to: authenticate your session; remember your preferences; analyse usage patterns; serve relevant marketing content (subject to your consent where required). You can control cookies through your browser settings. Disabling cookies may affect the functionality of our platform. We do not use third-party advertising cookies that track you across unaffiliated websites.`,
  },
  {
    title: "8. Children's Privacy",
    body: `Our Services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child under 18 has provided us with personal information, we will promptly delete such information from our records. If you believe your child has provided us with personal information, please contact us at privacy@intbrokers.com.`,
  },
  {
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by email or through a prominent notice on our platform at least 30 days before the changes take effect. The date of the most recent revision is indicated at the top of this policy.`,
  },
  {
    title: "10. Contact Us",
    body: `For privacy-related questions, complaints, or requests, contact our Data Protection Officer at privacy@intbrokers.com or by mail at: Data Protection Officer, Vault Wealth Management LLC, One Pickwick Plaza, Greenwich, CT 06830, USA. For EU residents, our EU representative can be contacted at: EU Privacy, Interactive Brokers Ireland Limited, 10 Earlsfort Terrace, Dublin 2, Ireland. For UK residents: Interactive Brokers (U.K.) Limited, Level 20 Heron Tower, 110 Bishopsgate, London EC2N 4AY.`,
  },
];

export default function Privacy() {
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: "#fff" }}>
      <HomeNavbar />

      <div style={{ background: "#0F172A", padding: "80px 24px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", marginBottom: 12 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Last updated: April 9, 2026 · Vault Wealth Management LLC</p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px 96px" }}>
        <div style={{ padding: "20px 24px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, marginBottom: 48 }}>
          <p style={{ fontSize: 13.5, color: "#1E40AF", lineHeight: 1.7 }}>
            <strong>Your privacy matters.</strong> This policy explains what information we collect, how we use it, and your rights regarding your personal data. We never sell your personal information to third parties.
          </p>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={s.title} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: i < SECTIONS.length - 1 ? "1px solid #F5F6F7" : "none" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>{s.title}</h2>
            <p style={{ fontSize: 14.5, color: "#374151", lineHeight: 1.85 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
