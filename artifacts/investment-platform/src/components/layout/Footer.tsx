import { Link } from "wouter";

export function Footer() {
  const cols = [
    {
      title: "Platform",
      links: [
        { label: "Digital Assets", href: "/assets/crypto" },
        { label: "Equities", href: "/assets/stocks" },
        { label: "Commodities", href: "/assets/commodities" },
        { label: "Private Wealth", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Security", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Risk Disclosures", href: "#" },
        { label: "Regulatory Licenses", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-[#0d0f14] border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-6 h-6 bg-white flex items-center justify-center">
                <span className="text-[#0a1628] font-bold text-[10px] tracking-tighter">VW</span>
              </div>
              <span className="text-white font-semibold text-sm tracking-wide uppercase">Vault Wealth</span>
            </Link>
            <p className="text-xs text-white/30 leading-relaxed max-w-xs">
              Institutional-grade investment platform bridging traditional finance and digital assets. Regulated, secure, and built for serious investors.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs text-white/40 hover:text-white/80 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/20">
            © {new Date().getFullYear()} Vault Wealth Management LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "Bloomberg"].map((s) => (
              <a key={s} href="#" className="text-[10px] text-white/25 hover:text-white/60 transition-colors uppercase tracking-widest">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
