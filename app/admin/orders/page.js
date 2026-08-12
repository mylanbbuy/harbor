"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { C, money } from "@/lib/tokens";
import { SectionLabel } from "@/components/UI";

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <SectionLabel>Fulfillment</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-2xl mb-6">Orders</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded text-xs whitespace-nowrap capitalize"
            style={{
              background: filter === s ? C.blue : "transparent",
              color: filter === s ? "#fff" : C.dim,
              border: `1px solid ${filter === s ? C.blue : C.line}`,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: C.dimmer }}>Loading orders...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: C.dimmer }}>No orders in this view.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-lg p-4" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div>
                  <span className="text-sm font-medium" style={{ color: C.white }}>{o.customer_name || "Guest"}</span>
                  <span className="text-xs ml-2" style={{ color: C.dimmer }}>{o.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] uppercase px-2 py-0.5 rounded"
                    style={{ color: o.payment_status === "paid" ? C.cyan : "#F26D6D", border: `1px solid ${o.payment_status === "paid" ? C.cyan : "#F26D6D"}55` }}
                  >
                    {o.payment_status}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="text-xs rounded px-2 py-1 bg-transparent outline-none"
                    style={{ border: `1px solid ${C.line}`, color: C.blueBright }}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s} style={{ color: "#000" }}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="text-xs mb-2" style={{ color: C.dimmer }}>
                {o.order_items?.map((it) => `${it.qty}x ${it.product_name}`).join(", ")}
              </div>
              {o.notes && <div className="text-xs mb-2" style={{ color: C.dimmer }}>Delivery: {o.notes}</div>}
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: C.dimmer, fontFamily: "'JetBrains Mono', monospace" }}>{o.payment_reference}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.blueBright }} className="text-sm font-semibold">{money(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
