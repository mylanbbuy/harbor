"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, CheckCircle2, XCircle, Clock, Truck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { C, money } from "@/lib/tokens";
import { SectionLabel, GhostButton } from "@/components/UI";

const STATUS_STEPS = ["confirmed", "processing", "shipped", "completed"];

function StatusBadge({ status, paymentStatus }) {
  const map = {
    pending: { label: "Awaiting payment", color: C.dim, icon: Clock },
    confirmed: { label: "Confirmed", color: C.blueBright, icon: CheckCircle2 },
    processing: { label: "Processing", color: C.blueBright, icon: Package },
    shipped: { label: "Shipped", color: C.cyan, icon: Truck },
    completed: { label: "Completed", color: C.cyan, icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "#F26D6D", icon: XCircle },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded" style={{ color: s.color, border: `1px solid ${s.color}55` }}>
      <Icon size={13} /> {s.label}
    </span>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const paymentReturn = searchParams.get("payment");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).single();
    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Payment confirmation can arrive a few seconds after redirect —
    // poll briefly so the page updates without a manual refresh.
    const interval = setInterval(load, 4000);
    const timeout = setTimeout(() => clearInterval(interval), 30000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-5 py-24 text-center" style={{ color: C.dimmer }}>Loading order...</div>;
  }

  if (!order) {
    return <div className="max-w-2xl mx-auto px-5 py-24 text-center" style={{ color: C.dimmer }}>Order not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <SectionLabel>Order</SectionLabel>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-2xl">
          #{order.payment_reference || order.id.slice(0, 8)}
        </h1>
        <StatusBadge status={order.status} paymentStatus={order.payment_status} />
      </div>

      {paymentReturn === "cancelled" && order.payment_status !== "paid" && (
        <p className="text-sm mb-4" style={{ color: "#F26D6D" }}>Payment was cancelled. Your items were released back into stock.</p>
      )}
      {order.payment_status === "unpaid" && paymentReturn !== "cancelled" && (
        <p className="text-sm mb-4" style={{ color: C.dim }}>Waiting for payment confirmation from Selcom...</p>
      )}
      {order.payment_status === "paid" && (
        <p className="text-sm mb-4" style={{ color: C.cyan }}>Payment received — thank you! Harbor is preparing your order.</p>
      )}

      <div className="rounded-lg p-5 mb-4" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
        <h3 className="text-xs uppercase tracking-wide mb-3" style={{ color: C.blueBright, fontFamily: "'JetBrains Mono', monospace" }}>Items</h3>
        <div className="space-y-2">
          {order.order_items?.map((it) => (
            <div key={it.id} className="flex items-center justify-between text-sm">
              <span style={{ color: C.white }}>{it.qty} x {it.product_name}</span>
              <span style={{ color: C.dim, fontFamily: "'JetBrains Mono', monospace" }}>{money(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
          <span className="text-sm" style={{ color: C.dim }}>Total</span>
          <span className="text-lg font-semibold" style={{ color: C.white, fontFamily: "'JetBrains Mono', monospace" }}>{money(order.total)}</span>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-lg p-5 mb-6" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
          <h3 className="text-xs uppercase tracking-wide mb-2" style={{ color: C.blueBright, fontFamily: "'JetBrains Mono', monospace" }}>Delivery address</h3>
          <p className="text-sm" style={{ color: C.dim }}>{order.notes}</p>
          <p className="text-sm mt-1" style={{ color: C.dim }}>{order.customer_phone}</p>
        </div>
      )}

      <Link href="/account"><GhostButton full>Back to your account</GhostButton></Link>
    </div>
  );
}
