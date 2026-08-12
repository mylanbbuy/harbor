"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { C, money } from "@/lib/tokens";
import { SectionLabel, PrimaryButton, GhostButton, Input, Textarea } from "@/components/UI";

const emptyForm = { id: null, name: "", category_id: "", price: "", stock: "", specs: "", tag: "", active: true };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data: prods } = await supabase.from("products").select("*, categories(label)").order("created_at", { ascending: false });
    const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
    setProducts(prods || []);
    setCategories(cats || []);
  };

  useEffect(() => { load(); }, []);

  const startAdd = () => { setForm(emptyForm); setShowForm(true); };
  const startEdit = (p) => { setForm({ id: p.id, name: p.name, category_id: p.category_id, price: p.price, stock: p.stock, specs: p.specs || "", tag: p.tag || "", active: p.active }); setShowForm(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      category_id: form.category_id,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      specs: form.specs,
      tag: form.tag || null,
      active: form.active,
    };
    if (form.id) {
      await supabase.from("products").update(payload).eq("id", form.id);
    } else {
      await supabase.from("products").insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const toggleActive = async (p) => {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionLabel>Catalog</SectionLabel>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-2xl">Products</h1>
        </div>
        <PrimaryButton onClick={startAdd} icon={Plus}>Add Product</PrimaryButton>
      </div>

      {showForm && (
        <form onSubmit={save} className="rounded-lg p-5 mb-6 space-y-3" style={{ background: C.bgCard, border: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: C.white }}>{form.id ? "Edit product" : "New product"}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={16} color={C.dimmer} /></button>
          </div>
          <Input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            required
            className="w-full rounded px-3 py-2.5 text-sm bg-transparent outline-none"
            style={{ border: `1px solid ${C.line}`, color: C.white }}
          >
            <option value="" style={{ color: "#000" }}>Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id} style={{ color: "#000" }}>{c.label}</option>)}
          </select>
          <Input type="number" placeholder="Price (TZS)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input type="number" placeholder="Stock quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          <Textarea placeholder="Specs (e.g. Core i5 · 16GB RAM · 512GB SSD)" rows={2} value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} />
          <Input placeholder="Tag (optional: New, Best Seller)" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
          <label className="flex items-center gap-2 text-sm" style={{ color: C.dim }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Visible on the site
          </label>
          <PrimaryButton type="submit" full disabled={saving}>{saving ? "Saving..." : "Save Product"}</PrimaryButton>
        </form>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-lg p-4" style={{ background: C.bgCard, border: `1px solid ${C.line}`, opacity: p.active ? 1 : 0.5 }}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: C.white }}>{p.name}</div>
              <div className="text-xs" style={{ color: C.dimmer }}>{p.categories?.label} · {p.specs}</div>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded whitespace-nowrap"
              style={{ color: p.stock > 0 ? C.dim : "#F26D6D", border: `1px solid ${p.stock > 0 ? C.line : "#F26D6D55"}` }}
            >
              {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.blueBright }} className="text-sm">{money(p.price)}</span>
            <button onClick={() => toggleActive(p)} className="text-xs px-2 py-1 rounded" style={{ border: `1px solid ${C.line}`, color: C.dim }}>
              {p.active ? "Hide" : "Show"}
            </button>
            <button onClick={() => startEdit(p)}><Edit2 size={15} color={C.blueBright} /></button>
            <button onClick={() => remove(p.id)}><Trash2 size={15} color="#F26D6D" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
