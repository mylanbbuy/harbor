"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X, Anchor, ShieldCheck } from "lucide-react";
import { C } from "@/lib/tokens";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background: C.bg, borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 40 }}>
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded"
            style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`, boxShadow: `0 0 20px ${C.blue}55` }}
          >
            <Anchor size={19} color="#0A0D12" strokeWidth={2.5} />
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-lg">
            <span style={{ color: C.white, fontWeight: 700 }}>HARBOR</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: pathname === l.href ? C.white : C.dim,
                fontWeight: pathname === l.href ? 600 : 400,
                borderBottom: pathname === l.href ? `2px solid ${C.blueBright}` : "2px solid transparent",
                paddingBottom: 4,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 rounded px-3 h-9 text-xs font-medium"
              style={{ border: `1px solid ${C.blue}55`, color: C.blueBright, fontFamily: "'Inter', sans-serif" }}
            >
              <ShieldCheck size={14} /> Admin
            </Link>
          )}
          <Link
            href={user ? "/account" : "/account"}
            className="hidden sm:flex items-center justify-center rounded w-9 h-9"
            style={{ border: `1px solid ${C.line}`, color: pathname === "/account" ? C.blueBright : C.dim }}
          >
            <User size={17} />
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded w-9 h-9"
            style={{ border: `1px solid ${C.line}`, color: pathname === "/cart" ? C.blueBright : C.dim }}
          >
            <ShoppingCart size={17} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-[10px]"
                style={{ width: 17, height: 17, background: C.blueBright, color: "#0A0D12", fontWeight: 700 }}
              >
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden flex items-center justify-center rounded w-9 h-9"
            style={{ border: `1px solid ${C.line}`, color: C.dim }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-5 pb-4 flex flex-col gap-3" style={{ borderTop: `1px solid ${C.line}` }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-sm py-1" style={{ color: pathname === l.href ? C.blueBright : C.dim }}>
              {l.label}
            </Link>
          ))}
          <Link href="/account" onClick={() => setMenuOpen(false)} className="text-sm py-1" style={{ color: C.dim }}>Account / Login</Link>
          {isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm py-1" style={{ color: C.blueBright }}>Admin Dashboard</Link>
          )}
        </div>
      )}
    </div>
  );
}
