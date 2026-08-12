"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, LogOut, Package } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { C, money } from "@/lib/tokens";
import { SectionLabel, PrimaryButton, GhostButton, Input } from "@/components/UI";
import { useAuth } from "@/components/AuthContext";

function LoginSignup() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(form.email, form.password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUp(form.email, form.password, form.name, form.phone);
        if (error) setError(error.message);
        else setInfo("Account created. Check your email to confirm, then log in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <SectionLabel>{mode === "login" ? "Welcome back" : "Create account"}</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-3xl mb-6">
        {mode === "login" ? "Log In" : "Sign Up"}
      </h1>
      <div className="flex rounded mb-6 overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
        <button onClick={() => setMode("login")} className="flex-1 py-2.5 text-sm" style={{ background: mode === "login" ? C.blue : "transparent", color: mode === "login" ? "#fff" : C.dim }}>Log In</button>
        <button onClick={() => setMode("signup")} className="flex-1 py-2.5 text-sm" style={{ background: mode === "signup" ? C.blue : "transparent", color: mode === "signup" ? "#fff" : C.dim }}>Sign Up</button>
      </div>
      <form onSubmit={submit} className="rounded-lg p-6 space-y-4" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
        {mode === "signup" && (
          <>
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </>
        )}
        <Input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        {error && <p className="text-xs" style={{ color: "#F26D6D" }}>{error}</p>}
        {info && <p className="text-xs" style={{ color: C.cyan }}>{info}</p>}
        <PrimaryButton type="submit" full disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
        </PrimaryButton>
      </form>
    </div>
  );
}

function AccountDashboard() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
    })();
  }, [user.id]);

  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <SectionLabel>Your account</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-3xl mb-6">
        {profile?.full_name || user.email}
      </h1>

      {isAdmin && (
        <Link href="/admin" className="flex items-center gap-2 rounded-lg p-4 mb-6" style={{ background: `${C.blue}22`, border: `1px solid ${C.blue}55` }}>
          <ShieldCheck size={18} color={C.blueBright} />
          <span className="text-sm" style={{ color: C.white }}>You are an Admin — open the Admin Dashboard</span>
        </Link>
      )}

      <div className="rounded-lg p-6 mb-6" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
        <h3 className="text-sm uppercase tracking-wide mb-4" style={{ color: C.blueBright, fontFamily: "'JetBrains Mono', monospace" }}>Order history</h3>
        {orders.length === 0 ? (
          <p className="text-sm" style={{ color: C.dimmer }}>No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`} className="flex items-start gap-3 rounded p-3" style={{ border: `1px solid ${C.line}` }}>
                <Package size={16} color={C.dim} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-sm" style={{ color: C.white }}>{money(o.total)}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[10px] uppercase px-2 py-0.5 rounded"
                        style={{ color: o.payment_status === "paid" ? C.cyan : C.dim, border: `1px solid ${o.payment_status === "paid" ? C.cyan : C.line}` }}
                      >
                        {o.payment_status}
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded" style={{ color: C.blueBright, border: `1px solid ${C.blueBright}55` }}>{o.status}</span>
                    </div>
                  </div>
                  <div className="text-xs mt-1" style={{ color: C.dimmer }}>
                    {o.order_items?.map((it) => `${it.qty}x ${it.product_name}`).join(", ")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <GhostButton onClick={signOut} icon={LogOut} full>Log Out</GhostButton>
    </div>
  );
}

export default function AccountPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="max-w-6xl mx-auto px-5 py-24 text-center" style={{ color: C.dimmer }}>Loading...</div>;
  }

  return user ? <AccountDashboard /> : <LoginSignup />;
}
