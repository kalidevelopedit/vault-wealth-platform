import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { AlertTriangle } from "lucide-react";

const DISCLOSURES = [
  {
    title: "General Investment Risk",
    body: `All investments involve risk, including the potential loss of principal. There is no guarantee that any investment strategy will achieve its objectives. Past performance is not indicative of future results. The value of securities can and does decrease as well as increase. You should only invest money that you can afford to lose without affecting your lifestyle or financial security. Before investing, you should carefully consider your financial situation, investment objectives, risk tolerance, and time horizon.`,
  },
  {
    title: "Equities and Exchange-Traded Funds (ETFs)",
    body: `Stocks and ETFs are subject to market risk, meaning their prices can fluctuate due to company-specific factors (earnings, management changes, competitive pressures) and broader market conditions (economic cycles, geopolitical events, interest rate changes). ETFs may trade at a premium or discount to their net asset value. Leveraged and inverse ETFs are subject to compounding effects and are not suitable for long-term buy-and-hold strategies. International investments carry additional risks including currency fluctuation, political instability, and different accounting standards.`,
  },
  {
    title: "Options Trading Risk",
    body: `Options are complex derivative instruments and are not suitable for all investors. Buying options: you may lose your entire premium paid if the option expires worthless. Selling (writing) options: your potential losses are theoretically unlimited for uncovered calls and substantial for uncovered puts. Options strategies involving multiple legs carry risks from all component positions simultaneously. The value of options is affected by time decay (theta), changes in implied volatility, and the price movement of the underlying asset. You should read and understand the Options Disclosure Document (ODD) — "Characteristics and Risks of Standardized Options" — before trading options.`,
  },
  {
    title: "Futures Trading Risk",
    body: `Futures trading involves substantial risk of loss and is not appropriate for all investors. Futures are leveraged instruments — a small adverse price move can result in losses exceeding your initial margin deposit. You may be required to make additional margin payments on short notice. Futures markets can be illiquid and subject to large, rapid price moves, particularly around economic announcements. Commodity futures are additionally subject to supply/demand factors, weather events, geopolitical risk, and regulatory changes.`,
  },
  {
    title: "Margin Trading Risk",
    body: `Trading on margin involves significant risk. Using borrowed funds to purchase securities amplifies both potential gains and losses. If the value of your portfolio declines, you may be required to deposit additional funds immediately or face forced liquidation of your positions — potentially at unfavourable prices and without prior notice. In volatile markets, your positions may be closed at a loss greater than your initial investment. Margin interest is charged daily and can erode your portfolio returns. You are obligated to repay all margin debit balances regardless of investment performance.`,
  },
  {
    title: "Foreign Exchange (Forex) Risk",
    body: `Foreign currency trading involves high risk and may not be suitable for all investors. Currency values fluctuate constantly due to political, economic, and speculative factors. Leverage available in forex trading can magnify losses. There is no central exchange for forex; liquidity can vary and spreads can widen significantly during periods of market stress. Changes in interest rates, political stability, inflation expectations, and trade policy can cause rapid and substantial currency moves. You can lose more than your initial deposit in leveraged forex trading.`,
  },
  {
    title: "Cryptocurrency Risk",
    body: `Cryptocurrencies are highly speculative, extremely volatile, and largely unregulated. Prices can drop by 50% or more within days or hours. There is no central authority to provide protection or recourse if something goes wrong. Cryptocurrencies are not covered by SIPC or FDIC insurance. Regulatory developments globally can significantly impact crypto valuations. Smart contract bugs, exchange hacks, and network failures can result in total loss of assets. Crypto assets may have limited liquidity, and you may be unable to exit positions at desired prices. Only invest in cryptocurrency what you can afford to lose entirely.`,
  },
  {
    title: "Bond and Fixed Income Risk",
    body: `Fixed income securities are subject to interest rate risk (bond prices fall when interest rates rise), credit risk (issuer default), reinvestment risk, and liquidity risk (some bonds trade infrequently). High-yield (junk) bonds carry significantly higher credit risk and should be considered speculative. International bonds carry additional sovereign, currency, and political risks. Callable bonds may be redeemed before maturity, potentially at unfavourable times for the investor. Municipal bonds, while often tax-advantaged, are not risk-free and are subject to the credit quality of the issuing municipality.`,
  },
  {
    title: "Regulatory Disclosures",
    body: `Vault Wealth Management LLC is a registered broker-dealer with the Securities and Exchange Commission (SEC) and is a member of the Financial Industry Regulatory Authority (FINRA) and the Securities Investor Protection Corporation (SIPC). Securities and investment products offered through INT Brokers are: Not FDIC Insured · Not Bank Guaranteed · May Lose Value. SIPC protects customer accounts up to $500,000 (including up to $250,000 for cash) in the event of a broker-dealer failure. SIPC does not protect against investment losses. For more information about SIPC, visit www.sipc.org. The FINRA BrokerCheck tool is available at www.finra.org/investors/brokercheck.`,
  },
];

export default function RiskDisclosures() {
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: "#fff" }}>
      <HomeNavbar />

      <div style={{ background: "#0F172A", padding: "80px 24px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", marginBottom: 12 }}>Risk Disclosures</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Last updated: April 9, 2026 · Vault Wealth Management LLC</p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px 96px" }}>
        <div style={{ padding: "20px 24px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 48, display: "flex", alignItems: "flex-start", gap: 14 }}>
          <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13.5, color: "#991B1B", lineHeight: 1.7 }}>
            <strong>Risk Warning:</strong> Trading in financial instruments involves significant risk, including the possible loss of the full amount invested. These disclosures are provided to ensure you understand the risks associated with each product category before investing.
          </p>
        </div>

        {DISCLOSURES.map((s, i) => (
          <div key={s.title} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: i < DISCLOSURES.length - 1 ? "1px solid #F5F6F7" : "none" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>{s.title}</h2>
            <p style={{ fontSize: 14.5, color: "#374151", lineHeight: 1.85 }}>{s.body}</p>
          </div>
        ))}

        <div style={{ padding: "28px", background: "#0F172A", borderRadius: 16, marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            <strong style={{ color: "#fff" }}>Regulatory Notice:</strong> Vault Wealth Management LLC is a registered broker-dealer, member FINRA/SIPC. Securities and investment products: Not FDIC Insured · Not Bank Guaranteed · May Lose Value. This material is for informational purposes only and does not constitute investment advice. Please consult a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
