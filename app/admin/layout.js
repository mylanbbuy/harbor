"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Package, Wrench, FileText, ShoppingBag } from "lucide-react";
import { C } from "@/lib/tokens";
import { useAuth } from "@/components/AuthContext";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/policies", label: "Policies", icon: FileText },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

export default function AdminLayout({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/account");
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 text-center" style={{ color: C.dimmer }}>
        {loading ? "Loading..." : "Checking admin access..."}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row gap-8">
      <div className="md:w-52 flex-shrink-0">
        <div className="text-xs uppercase tracking-widest mb-4" style={{ color: C.blueBright, fontFamily: "'JetBrains Mono', monospace" }}>
          Admin
        </div>
        <div className="flex md:flex-col gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm whitespace-nowrap"
              style={{
                background: pathname === item.href ? `${C.blue}22` : "transparent",
                color: pathname === item.href ? C.blueBright : C.dim,
                border: `1px solid ${pathname === item.href ? C.blue + "55" : "transparent"}`,
              }}
            >
              <item.icon size={15} /> {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
