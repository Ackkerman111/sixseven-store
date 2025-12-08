"use client";

import { useEffect, useState } from "react";

const emptyProduct = {
  name: "",
  price: "",
  color: "",
  size: "",
  tag: "",
  image_url: ""
};

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (!data.error) setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const saveProduct = async () => {
    if (!form.name || !form.price) {
      alert("Name and price required");
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price)
    };

    let res;
    if (editingId) {
      res = await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      alert(data.error);
      return;
    }

    setForm(emptyProduct);
    setEditingId(null);
    loadProducts();
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      color: p.color || "",
      size: p.size || "",
      tag: p.tag || "",
      image_url: p.image_url || ""
    });
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    loadProducts();
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Admin Dashboard</h1>
      <p style={{ marginBottom: 20, color: "#6b7280" }}>
        Manage products for your Six Seven clothing store.
      </p>

      {/* Form */}
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          background: "#ffffff",
          boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
          marginBottom: 24
        }}
      >
        <h2 style={{ marginBottom: 12, fontSize: 18 }}>
          {editingId ? "Edit product" : "Add new product"}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: 10,
            marginBottom: 12
          }}
        >
          <input
            placeholder="Name"
            value={form.name}
            onChange={onChange("name")}
          />
          <input
            placeholder="Price"
            value={form.price}
            onChange={onChange("price")}
            type="number"
          />
          <input
            placeholder="Color"
            value={form.color}
            onChange={onChange("color")}
          />
          <input
            placeholder="Size"
            value={form.size}
            onChange={onChange("size")}
          />
          <input
            placeholder="Tag (New, Best Seller...)"
            value={form.tag}
            onChange={onChange("tag")}
          />
          <input
            placeholder="Image URL (optional)"
            value={form.image_url}
            onChange={onChange("image_url")}
          />
        </div>

        <button onClick={saveProduct} disabled={loading}>
          {loading
            ? "Saving..."
            : editingId
            ? "Save changes"
            : "Add product"}
        </button>
        {editingId && (
          <button
            style={{ marginLeft: 10 }}
            onClick={() => {
              setEditingId(null);
              setForm(emptyProduct);
            }}
          >
            Cancel edit
          </button>
        )}
      </div>

      {/* List */}
      <h2 style={{ marginBottom: 10, fontSize: 18 }}>All products</h2>
      {products.length === 0 && (
        <p style={{ color: "#6b7280" }}>No products yet. Add your first one.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#ffffff",
              padding: 10,
              borderRadius: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 10px rgba(15,23,42,0.05)"
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                ₹{p.price} • {p.color || "No color"} •{" "}
                {p.size || "No size"} {p.tag ? "• " + p.tag : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => startEdit(p)}>Edit</button>
              <button onClick={() => deleteProduct(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
