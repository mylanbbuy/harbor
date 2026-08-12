import { Check } from "lucide-react";
import { C } from "@/lib/tokens";
import { SectionLabel } from "@/components/UI";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <SectionLabel>Who we are</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-3xl mb-6">About Harbor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: C.dim }}>
            Harbor is an electronics and IT company based in Zanzibar, Tanzania. We sell technology products — from laptops and smartphones to networking equipment and smart watches — and back every sale with hands-on repair and IT services.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: C.dim }}>
            Whether you're a family that needs a phone screen fixed, or a business that needs a full office network and CCTV system installed, our team handles it with the same attention to detail.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: C.dim }}>
            We believe good technology support should be local, honest, and fast — that's the standard we hold ourselves to every day.
          </p>
        </div>
        <div className="rounded-lg p-6" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
          <h3 className="text-sm uppercase tracking-wide mb-4" style={{ color: C.blueBright, fontFamily: "'JetBrains Mono', monospace" }}>Why choose us</h3>
          <ul className="space-y-3">
            {[
              "Genuine products with warranty",
              "Skilled, experienced technicians",
              "Fast turnaround on repairs",
              "Ongoing IT support, not just one-off fixes",
              "Based locally in Zanzibar",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm" style={{ color: C.white }}>
                <Check size={16} color={C.cyan} className="mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
