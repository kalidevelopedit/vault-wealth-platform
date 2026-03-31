import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck, TrendingUp, Globe, LineChart, Building } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground mb-6 leading-tight">
              Invest across crypto, stocks, and commodities in <span className="text-muted-foreground">one secure platform.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Institutional-grade tools, deep liquidity, and bank-level security. Built for the modern wealth manager and serious investor.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-8 py-6 text-base w-full sm:w-auto">
                <Link href="/register">Open an Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-base w-full sm:w-auto">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Mockup Image */}
        <div className="container mx-auto px-4 mt-20">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-card max-w-5xl mx-auto">
            <img 
              src="/hero-mockup.png" 
              alt="Platform Dashboard" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Platform Highlights (6 cards) */}
      <section id="solutions" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">A sophisticated platform for sophisticated investors</h2>
            <p className="text-muted-foreground">Everything you need to execute your strategy, managed from a single unified interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: TrendingUp, title: "Deep Liquidity", desc: "Access global markets with institutional-grade pricing and minimal slippage." },
              { icon: ShieldCheck, title: "Bank-Level Security", desc: "Multi-sig cold storage and rigorous operational security protocols." },
              { icon: LineChart, title: "Advanced Charting", desc: "Professional charting tools and real-time data integrations." },
              { icon: Globe, title: "Global Access", desc: "Trade assets across multiple jurisdictions from one account." },
              { icon: Building, title: "Wealth Management", desc: "Dedicated private client services and portfolio advisory." },
              { icon: ArrowRight, title: "Fast Execution", desc: "Low-latency trading engine built for high-frequency strategies." },
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <feature.icon className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asset Classes Section */}
      <section id="assets" className="py-24 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-semibold tracking-tight">Diversify across every asset class.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Build a truly diversified portfolio without managing multiple brokers or wallets. Move seamlessly between traditional and digital markets.
              </p>
              <ul className="space-y-4">
                {[
                  { title: "Equities & ETFs", desc: "Direct market access to US and international equities." },
                  { title: "Digital Assets", desc: "Spot trading for 50+ vetted cryptocurrencies." },
                  { title: "Commodities", desc: "Gold, silver, and energy products." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <img src="/feature-growth.png" alt="Market Growth" className="w-full rounded-2xl shadow-lg border" />
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section id="security" className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 max-w-6xl mx-auto">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-semibold tracking-tight">Trust is our foundation.</h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                We operate under strict regulatory frameworks to ensure your assets are protected. Our custody solutions use industry-leading cryptography.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div>
                  <h4 className="text-3xl font-semibold mb-2">$500M+</h4>
                  <p className="text-sm text-primary-foreground/70">Insurance Coverage</p>
                </div>
                <div>
                  <h4 className="text-3xl font-semibold mb-2">SOC 2</h4>
                  <p className="text-sm text-primary-foreground/70">Type II Certified</p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
               <img src="/feature-security.png" alt="Security Vault" className="w-full rounded-2xl shadow-2xl opacity-90" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 text-center border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-semibold tracking-tight mb-6">Ready to elevate your portfolio?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of serious investors who trust Vault Wealth with their capital.
          </p>
          <Button asChild size="lg" className="rounded-full px-10 py-6 text-lg">
            <Link href="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
