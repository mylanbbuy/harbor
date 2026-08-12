"use client";

import * as Icons from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { C, money } from "@/lib/tokens";
import { Badge } from "./UI";
import { useCart } from "./CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const Icon = Icons[product.category_icon] || Icons.Cpu;
  const outOfStock = (product.stock ?? 0) <= 0;

  return (
    <div className="group rounded-lg overflow-hidden flex flex-col" style={{ background: C.bgCard, border: `1px solid ${C.line}`, opacity: outOfStock ? 0.6 : 1 }}>
      <div className="relative flex items-center justify-center py-10" style={{ background: C.bgElevated }}>
        <Icon size={44} color={C.dim} strokeWidth={1.3} />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.tag && !outOfStock && <Badge color={product.tag === "New" ? C.cyan : C.blueBright}>{product.tag}</Badge>}
          {outOfStock && <Badge color="#F26D6D">Out of Stock</Badge>}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: C.dimmer, fontFamily: "'JetBrains Mono', monospace" }}>
          {product.category_label || product.category_id}
        </span>
        <h3 className="mt-1 text-sm font-semibold" style={{ color: C.white }}>{product.name}</h3>
        <p className="mt-1 text-xs" style={{ color: C.dimmer }}>{product.specs}</p>
        <div className="mt-4 flex items-center justify-between">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.blueBright }} className="text-sm font-semibold">{money(product.price)}</span>
        </div>
        <button
          onClick={() => addToCart(product)}
          disabled={outOfStock}
          className="mt-3 flex items-center justify-center gap-2 rounded py-2 text-xs font-medium disabled:cursor-not-allowed"
          style={{ border: `1px solid ${C.lineStrong}`, color: outOfStock ? C.dimmer : C.white }}
        >
          <ShoppingCart size={13} /> {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
