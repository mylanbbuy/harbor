"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { C } from "@/lib/tokens";
import { SectionLabel } from "@/components/UI";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
      const { data: prods } = await supabase
        .from("products")
        .select("*, categories(label, icon)")
        .eq("active", true)
        .order("created_at", { ascending: false });

      setCategories(cats || []);
      setProducts(
        (prods || []).map((p) => ({
          ...p,
          category_label: p.categories?.label,
          category_icon: p.categories?.icon,
        }))
      );
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === "all" || p.category_id === categoryFilter;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, categoryFilter, search]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <SectionLabel>Catalog</SectionLabel>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.white, fontWeight: 700 }} className="text-3xl mb-6">Products</h1>

      <div className="flex items-center gap-2 mb-6 max-w-sm rounded px-3 py-2" style={{ border: `1px solid ${C.line}`, background: C.bgCard }}>
        <Search size={15} color={C.dimmer} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="bg-transparent outline-none text-sm w-full"
          style={{ color: C.white }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <button
          onClick={() => setCategoryFilter("all")}
          className="px-3 py-1.5 rounded text-xs whitespace-nowrap"
          style={{
            background: categoryFilter === "all" ? C.blue : "transparent",
            color: categoryFilter === "all" ? "#fff" : C.dim,
            border: `1px solid ${categoryFilter === "all" ? C.blue : C.line}`,
          }}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className="px-3 py-1.5 rounded text-xs whitespace-nowrap"
            style={{
              background: categoryFilter === c.id ? C.blue : "transparent",
              color: categoryFilter === c.id ? "#fff" : C.dim,
              border: `1px solid ${categoryFilter === c.id ? C.blue : C.line}`,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: C.dimmer }}>Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: C.dimmer }}>No products match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
