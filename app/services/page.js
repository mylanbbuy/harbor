"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { C } from "@/lib/tokens";
import { SectionLabel } from "@/components/UI";

export default function ServicesPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
      setServices(data || []);
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <SectionLabel>What we do</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-3xl mb-3">Services</h1>
      <p className="max-w-lg mb-10 text-sm" style={{ color: C.dim }}>
        From cracked screens to full network installs, our technicians keep your devices and business running.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((s, i) => {
          const Icon = Icons[s.icon] || Icons.Wrench;
          return (
            <div key={s.id} className="rounded-lg p-6" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center rounded w-11 h-11" style={{ background: `${C.blue}22`, border: `1px solid ${C.blue}55` }}>
                  <Icon size={20} color={C.blueBright} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.dimmer }} className="text-xs">SVC-0{i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: C.dim }}>{s.description}</p>
              <Link href="/contact" className="flex items-center gap-1 text-sm font-medium" style={{ color: C.blueBright }}>
                Request this service <ChevronRight size={15} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
