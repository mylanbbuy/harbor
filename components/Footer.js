import Link from "next/link";
import { C, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/tokens";

export default function Footer() {
  return (
    <div style={{ borderTop: `1px solid ${C.line}`, background: C.bgElevated }}>
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-base">HARBOR</div>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: C.dimmer, fontFamily: "'Inter', sans-serif" }}>
            Electronics, IT products, and technical services based in Zanzibar, Tanzania.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wide mb-3" style={{ color: C.dim, fontFamily: "'JetBrains Mono', monospace" }}>Navigate</h4>
          <div className="flex flex-col gap-2">
            {[["/", "Home"], ["/products", "Products"], ["/services", "Services"], ["/about", "About Us"], ["/contact", "Contact"]].map(([href, label]) => (
              <Link key={href} href={href} className="text-xs" style={{ color: C.dimmer }}>{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wide mb-3" style={{ color: C.dim, fontFamily: "'JetBrains Mono', monospace" }}>Contact</h4>
          <div className="flex flex-col gap-2 text-xs" style={{ color: C.dimmer }}>
            <span>Zanzibar, Tanzania</span>
            <span>{CONTACT_PHONE}</span>
            <span>{CONTACT_EMAIL}</span>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wide mb-3" style={{ color: C.dim, fontFamily: "'JetBrains Mono', monospace" }}>Legal</h4>
          <div className="flex flex-col gap-2">
            {[["privacy", "Privacy Policy"], ["returns", "Returns & Warranty"], ["terms", "Terms of Service"]].map(([slug, label]) => (
              <Link key={slug} href={`/policies/${slug}`} className="text-xs" style={{ color: C.dimmer }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center py-4 text-[11px]" style={{ color: C.dimmer, borderTop: `1px solid ${C.line}`, fontFamily: "'JetBrains Mono', monospace" }}>
        © {new Date().getFullYear()} HARBOR — ZANZIBAR, TANZANIA
      </div>
    </div>
  );
}
