"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { C, money } from "@/lib/tokens";
import { SectionLabel, PrimaryButton, Input, Textarea } from "@/components/UI";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: profile?.full_name || "",
    phone: profile?.phone || "",
    address: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-5 py-24 text-center" style={{ color: C.dimmer }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <h2 style={{ color: C.white, fontFamily: "'Space Grotesk', sans-serif" }} className="text-xl mb-3">Please log in to check out</h2>
        <p className="text-sm mb-6" style={{ color: C.dimmer }}>You need a Harbor account so we can confirm and track your order.</p>
        <Link href="/account"><PrimaryButton full>Log In / Sign Up</PrimaryButton></Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <p className="text-sm" style={{ color: C.dimmer }}>Your cart is empty.</p>
        <Link href="/products" className="text-sm" style={{ color: C.blueBright }}>Browse products</Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map((c) => ({ id: c.id, qty: c.qty })),
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: user.email,
          deliveryAddress: form.address,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push(`/orders/${data.orderId}`);
      }
    } catch (err) {
      setError("Could not reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <SectionLabel>Checkout</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-3xl mb-8">Delivery Details</h1>

      <form onSubmit={submit} className="rounded-lg p-6 space-y-4 mb-6" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
        <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input placeholder="Phone number (for delivery & Mobile Money)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <Textarea placeholder="Delivery address" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />

        <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          <span className="text-sm" style={{ color: C.dim }}>Total</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.white }} className="text-lg font-semibold">{money(cartTotal)}</span>
        </div>

        {error && <p className="text-xs" style={{ color: "#F26D6D" }}>{error}</p>}

        <PrimaryButton type="submit" icon={CreditCard} full disabled={submitting}>
          {submitting ? "Preparing payment..." : "Pay with Selcom"}
        </PrimaryButton>
        <p className="flex items-center gap-1.5 text-xs justify-center" style={{ color: C.dimmer }}>
          <ShieldCheck size={13} /> Card & Mobile Money — secured by Selcom
        </p>
      </form>
    </div>
  );
}
