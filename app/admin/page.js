"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { C, money } from "@/lib/tokens";
import { SectionLabel } from "@/components/UI";

export default function AdminOverview() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, customers: 0 });

  useEffect(() => {
    (async () => {
      const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: customerCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer");
      const { data: orders } = await supabase.from("orders").select("total");
      const revenue = (orders || []).reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        products: productCount || 0,
        orders: orders?.length || 0,
        revenue,
        customers: customerCount || 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Products", value: stats.products },
    { label: "Orders", value: stats.orders },
    { label: "Total revenue", value: money(stats.revenue) },
    { label: "Customers", value: stats.customers },
  ];

  return (
    <div>
      <SectionLabel>Dashboard</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-2xl mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg p-5" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: C.blueBright }} className="text-xl font-semibold">{c.value}</div>
            <div className="text-xs mt-1" style={{ color: C.dim }}>{c.label}</div>
          </div>
        ))}
      </div>
      <p className="text-sm mt-8" style={{ color: C.dimmer }}>
        Use the menu on the left to manage products, services, policies, and view customer orders.
      </p>
    </div>
  );
}
