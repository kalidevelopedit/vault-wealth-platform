import { ReactNode } from "react";
import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import {
  JsonLd,
  organizationSchema,
  breadcrumbSchema,
  Breadcrumb,
} from "@/components/seo/JsonLd";

export const DOT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`;
export const DOTL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`;
export const W = "100%";
export const INNER = { maxWidth: 1100, margin: "0 auto", padding: "0 24px" };

interface Stat { value: string; label: string }

export interface RelatedLink {
  title: string;
  href: string;
  desc: string;
}

interface MarketingPageProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle: string;
  heroImage?: string;
  heroImageAlt?: string;
  stats?: Stat[];
  ctaTitle?: string;
  ctaText?: string;
  breadcrumbs?: Breadcrumb[];
  relatedLinks?: RelatedLink[];
  children: ReactNode;
}

export function MarketingPage({
  eyebrow,
  title,
  subtitle,
  heroImage,
  heroImageAlt = "",
  stats,
  ctaTitle = "Open an Account Today",
  ctaText = "Join 4.4 million investors worldwide. Commission-free on US stocks. 170+ global markets. No minimum balance required.",
  breadcrumbs,
  relatedLinks,
  children,
}: MarketingPageProps) {
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: "#fff", overflowX: "hidden" }}>
      <JsonLd data={organizationSchema()} />
      {breadcrumbs && breadcrumbs.length > 0 && (
        <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      )}

      <HomeNavbar />

      <section style={{ background: "#080a0f", padding: "108px 24px 88px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT, zIndex: 0 }} />
        <div style={{ position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)", width: 1100, height: 560, background: "radial-gradient(ellipse,rgba(255,255,255,0.03) 0%,transparent 62%)", zIndex: 0, pointerEvents: "none" }} />
        {heroImage && (
          <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
            <img
              src={heroImage}
              alt={heroImageAlt}
              aria-hidden={heroImageAlt === "" ? "true" : undefined}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.07 }}
            />
          </div>
        )}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto" }}>
          {eyebrow && (
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
              {eyebrow}
            </p>
          )}
          <h1 style={{ fontSize: "clamp(36px,6vw,68px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.06, marginBottom: 24 }}>
            {title}
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.48)", lineHeight: 1.82, maxWidth: 620, margin: "0 auto 40px" }}>
            {subtitle}
          </p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 44px", borderRadius: 12, background: "#0d1520", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
            Open Account Free <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {stats && stats.length > 0 && (
        <div style={{ background: "#0d1017", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "32px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 36, justifyContent: "center" }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {children}

      {relatedLinks && relatedLinks.length > 0 && (
        <section style={{ background: "#F5F6F7", padding: "72px 24px", borderTop: "1px solid #E6E8EB" }}>
          <div style={{ ...INNER }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 8 }}>Related Resources</p>
              <h2 style={{ fontSize: "clamp(18px,3vw,28px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>Explore more from INT Brokers</h2>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {relatedLinks.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={{ display: "block", background: "#fff", border: "1px solid #E6E8EB", borderRadius: 12, padding: "18px 20px", textDecoration: "none", transition: "border-color 0.15s" }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 4 }}>{l.title}</span>
                    <span style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.6 }}>{l.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section style={{ background: "#080a0f", padding: "104px 24px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "absolute", bottom: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse,rgba(255,255,255,0.03) 0%,transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>Get Started — Free</p>
          <h2 style={{ fontSize: "clamp(30px,5vw,56px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 20 }}>{ctaTitle}</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 40 }}>{ctaText}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 42px", borderRadius: 12, background: "#0d1520", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
              Open Account Free <ArrowUpRight size={16} />
            </Link>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 38px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              Log In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
