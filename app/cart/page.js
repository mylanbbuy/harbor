"use client";

import Link from "next/link";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { C, money } from "@/lib/tokens";
import { SectionLabel, PrimaryButton } from "@/components/UI";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";

export default function CartPage() {
  const { cart, updateQty, removeItem, cartTotal } = useCart();
  const { user } = useAuth();

  if (cart.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 text-center">
        <ShoppingCart size={40} color={C.dimmer} className="mx-auto mb-4" />
        <h2 style={{ color: C.white, fontFamily: "'Space Grotesk', sans-serif" }} className="text-xl mb-2">Your cart is empty</h2>
        <p style={{ color: C.dimmer }} className="text-sm mb-6">Add some products to get started.</p>
        <Link href="/products"><PrimaryButton>Browse Products</PrimaryButton></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <SectionLabel>Your order</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-3xl mb-8">Cart</h1>
      <div className="space-y-3 mb-8">
        {cart.map((i) => (
          <div key={i.id} className="flex items-center gap-4 rounded-lg p-4" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: C.white }}>{i.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: C.blueBright }} className="text-xs mt-1">{money(i.price)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(i.id, -1)} className="flex items-center justify-center rounded w-7 h-7" style={{ border: `1px solid ${C.line}`, color: C.white }}><Minus size={13} /></button>
              <span className="w-5 text-center text-sm" style={{ color: C.white }}>{i.qty}</span>
              <button onClick={() => updateQty(i.id, 1)} className="flex items-center justify-center rounded w-7 h-7" style={{ border: `1px solid ${C.line}`, color: C.white }}><Plus size={13} /></button>
            </div>
            <button onClick={() => removeItem(i.id)} className="flex items-center justify-center rounded w-8 h-8" style={{ color: "#F26D6D" }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <div className="rounded-lg p-6" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm" style={{ color: C.dim }}>Subtotal</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.white }} className="text-lg font-semibold">{money(cartTotal)}</span>
        </div>
        {!user && (
          <p className="text-xs mb-3" style={{ color: C.dimmer }}>
            <Link href="/account" style={{ color: C.blueBright }}>Log in or create an account</Link> to check out — Harbor accounts let you pay securely and track your order.
          </p>
        )}
        <p className="text-xs mb-5" style={{ color: C.dimmer }}>Payment is processed securely by Selcom (Card & Mobile Money).</p>
        <Link href="/checkout">
          <PrimaryButton icon={ArrowRight} full>Proceed to Checkout</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
