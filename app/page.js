"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { C } from "@/lib/tokens";
import { Badge, SectionLabel, PrimaryButton, GhostButton } from "@/components/UI";
import ProductCard from "@/components/ProductCard";

function CircuitBg() {
  return (
    <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.blueBright} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="800" height="400" fill="url(#grid)" />
      <path d="M0 120 H180 V60 H400" fill="none" stroke={C.blueBright} strokeWidth="1.2" />
      <path d="M800 260 H600 V340 H340" fill="none" stroke={C.cyan} strokeWidth="1.2" />
      <circle cx="180" cy="120" r="4" fill={C.blueBright} />
      <circle cx="400" cy="60" r="4" fill={C.blueBright} />
      <circle cx="600" cy="260" r="4" fill={C.cyan} />
      <circle cx="340" cy="340" r="4" fill={C.cyan} />
    </svg>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
      const { data: prods } = await supabase.from("products").select("*").eq("active", true).eq("tag", "Best Seller").limit(3);
      const { data: svcs } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
      setCategories(cats || []);
      setFeatured(prods || []);
      setServices(svcs || []);
    })();
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden" style={{ background: `radial-gradient(ellipse at top right, ${C.bgElevated}, ${C.bg})` }}>
        <CircuitBg />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
          <Badge>Zanzibar's Technology Partner</Badge>
          <h1 className="mt-5 text-4xl md:text-6xl leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }}>
            Devices, repairs,<br />and IT support —<br />
            <span style={{ color: C.blueBright }}>all in one place.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base" style={{ color: C.dim, fontFamily: "'Inter', sans-serif" }}>
            Harbor sells laptops, smartphones, and networking gear, and keeps them running with expert repair and IT support — right here in Zanzibar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products"><PrimaryButton icon={ArrowRight}>Shop Products</PrimaryButton></Link>
            <Link href="/services"><GhostButton>Book a Service</GhostButton></Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16">
        <SectionLabel>Shop by category</SectionLabel>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 600 }} className="text-2xl mb-6">Find what you need</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = Icons[cat.icon] || Icons.Cpu;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex flex-col items-center justify-center gap-2 rounded-lg py-6 transition-transform hover:-translate-y-1"
                style={{ background: C.bgCard, border: `1px solid ${C.line}` }}
              >
                <Icon size={22} color={C.blueBright} />
                <span className="text-xs text-center" style={{ color: C.dim, fontFamily: "'Inter', sans-serif" }}>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <SectionLabel>Featured</SectionLabel>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 600 }} className="text-2xl">Popular right now</h2>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-sm" style={{ color: C.blueBright }}>
              View all <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section style={{ background: C.bgElevated, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto px-5 py-16">
          <SectionLabel>Our services</SectionLabel>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 600 }} className="text-2xl mb-8">Beyond the sale</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => {
              const Icon = Icons[s.icon] || Icons.Wrench;
              return (
                <div key={s.id} className="rounded-lg p-5" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
                  <Icon size={22} color={C.cyan} />
                  <h3 className="mt-3 text-sm font-semibold" style={{ color: C.white }}>{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: C.dimmer }}>{s.description}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8">
            <Link href="/services"><GhostButton icon={ArrowRight}>See all services</GhostButton></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
