"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Check } from "lucide-react";
import { C, WHATSAPP_NUMBER, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/tokens";
import { SectionLabel, PrimaryButton, Input, Textarea } from "@/components/UI";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const sendViaWhatsApp = () => {
    const text = `Hello Harbor,%0A%0AName: ${form.name}%0AEmail: ${form.email}%0AMessage: ${form.message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    setSent(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <SectionLabel>Get in touch</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-3xl mb-8">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-5">
          {[
            { icon: MapPin, label: "Location", value: "Zanzibar, Tanzania" },
            { icon: Phone, label: "Phone / WhatsApp", value: CONTACT_PHONE },
            { icon: Mail, label: "Email", value: CONTACT_EMAIL },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-3 rounded-lg p-4" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-center rounded w-10 h-10 flex-shrink-0" style={{ background: `${C.blue}22` }}>
                <c.icon size={17} color={C.blueBright} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide" style={{ color: C.dimmer, fontFamily: "'JetBrains Mono', monospace" }}>{c.label}</div>
                <div className="text-sm mt-0.5" style={{ color: C.white }}>{c.value}</div>
              </div>
            </div>
          ))}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded px-5 py-3 font-medium"
            style={{ background: "#25D366", color: "#08290F" }}
          >
            <MessageCircle size={17} /> Chat on WhatsApp
          </a>
        </div>

        <div className="rounded-lg p-6" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
          <h3 className="text-sm uppercase tracking-wide mb-4" style={{ color: C.blueBright, fontFamily: "'JetBrains Mono', monospace" }}>Send a message</h3>
          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Check size={30} color={C.cyan} />
              <p className="mt-3 text-sm" style={{ color: C.white }}>Opening WhatsApp with your message...</p>
              <button onClick={() => setSent(false)} className="mt-4 text-xs" style={{ color: C.blueBright }}>Send another message</button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Textarea placeholder="How can we help?" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <PrimaryButton onClick={sendViaWhatsApp} icon={MessageCircle} full>Send via WhatsApp</PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
