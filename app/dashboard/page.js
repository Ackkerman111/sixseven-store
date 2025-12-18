"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyProduct = {
  name: "",
  price: "",
  color: "",
  size: "",
  tag: ""
};

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const loadProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (!data.error) setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 🔥 IMAGE UPLOAD
  const uploadImages = async (files) => {
    const urls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (error) {
        alert("Image upload failed: " + error.message);
        return [];
      }

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      urls.push(data.publicUrl);
    }

    return urls;
  };

  const saveProduct = async () => {
    if (!form.name || !form.price) {
      alert("Name and price required");
      return;
    }

    setLoading(true);

    let imageUrls = [];
    if (images.length > 0) {
      imageUrls = await uploadImages(images);
    }

    const payload = {
      ...form,
      price: Number(form.price),
      images: imageUrls
    };

    const res = await fetch(
      editingId ? `/api/products/${editingId}` : "/api/products",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      alert(data.error);
      return;
    }

    setForm(emptyProduct);
    setImages([]);
    setEditingId(null);
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }

    loadProducts();
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin Dashboard</h1>

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Price"
        type="number"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <input
        placeholder="Color"
        value={form.color}
        onChange={(e) => setForm({ ...form, color: e.target.value })}
      />
      <input
        placeholder="Size"
        value={form.size}
        onChange={(e) => setForm({ ...form, size: e.target.value })}
      />
      <input
        placeholder="Tag"
        value={form.tag}
        onChange={(e) => setForm({ ...form, tag: e.target.value })}
      />

      {/* 🔥 IMAGE PICKER */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages([...e.target.files])}
      />

      <button onClick={saveProduct} disabled={loading}>
        {loading ? "Saving..." : editingId ? "Update" : "Add Product"}
      </button>

      <hr />

      <h3>All Products</h3>
      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: 10 }}>
          <b>{p.name}</b> – ₹{p.price}
          <button
            style={{ marginLeft: 10 }}
            onClick={() => deleteProduct(p.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
          }
