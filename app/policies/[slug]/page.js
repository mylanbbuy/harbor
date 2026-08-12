"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { C } from "@/lib/tokens";
import { SectionLabel } from "@/components/UI";

export default function PolicyPage() {
  const { slug } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("policies").select("*").eq("slug", slug).single();
      setPolicy(data);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <SectionLabel>Policy</SectionLabel>
      {loading ? (
        <p style={{ color: C.dimmer }}>Loading...</p>
      ) : policy ? (
        <>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-3xl mb-6">{policy.title}</h1>
          <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.dim }}>{policy.content}</div>
        </>
      ) : (
        <p style={{ color: C.dimmer }}>This policy has not been published yet.</p>
      )}
    </div>
  );
}
