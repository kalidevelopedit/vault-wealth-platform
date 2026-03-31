import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-background border-t py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-lg tracking-tighter">
                V
              </div>
              <span className="font-semibold text-lg tracking-tight">Vault Wealth</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Institutional-grade investment platform bridging traditional finance and digital assets.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/assets/crypto" className="hover:text-foreground transition-colors">Crypto Trading</Link></li>
              <li><Link href="/assets/stocks" className="hover:text-foreground transition-colors">Equities</Link></li>
              <li><Link href="/assets/commodities" className="hover:text-foreground transition-colors">Commodities</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Private Wealth</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Risk Disclosures</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Licenses</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Vault Wealth Management LLC. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
