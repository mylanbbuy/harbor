"use client";

import { C } from "@/lib/tokens";

export function Badge({ children, color = C.blue }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] rounded uppercase tracking-wider"
      style={{ background: `${color}22`, color, fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${color}55` }}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div style={{ width: 24, height: 2, background: C.blueBright }} />
      <span className="text-xs uppercase tracking-widest" style={{ color: C.blueBright, fontFamily: "'JetBrains Mono', monospace" }}>
        {children}
      </span>
    </div>
  );
}

export function PrimaryButton({ children, onClick, icon: Icon, full, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded px-5 py-3 font-medium transition-transform hover:-translate-y-0.5 ${full ? "w-full" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${C.blue}, ${C.blueBright})`,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        boxShadow: `0 4px 20px ${C.blue}44`,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

export function GhostButton({ children, onClick, icon: Icon, full, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded px-5 py-3 font-medium transition-colors ${full ? "w-full" : ""}`}
      style={{ background: "transparent", color: C.white, border: `1px solid ${C.lineStrong}`, fontFamily: "'Inter', sans-serif" }}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded px-3 py-2.5 text-sm bg-transparent outline-none ${props.className || ""}`}
      style={{ border: `1px solid ${C.line}`, color: C.white, fontFamily: "'Inter', sans-serif", ...(props.style || {}) }}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded px-3 py-2.5 text-sm bg-transparent outline-none resize-none ${props.className || ""}`}
      style={{ border: `1px solid ${C.line}`, color: C.white, fontFamily: "'Inter', sans-serif", ...(props.style || {}) }}
    />
  );
}
