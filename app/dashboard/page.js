"use client";

import { useEffect, useState } from "react";
import { supabaseStorage } from "../../lib/supabaseStorage";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const uploadImages = async () => {
    const urls = [];

    for (const file of images) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabaseStorage
        .storage
        .from("product-images")
        .upload(fileName, file);

      if (error) {
        alert("Upload failed");
        return [];
      }

      const { data } = supabaseStorage
        .storage
        .from("product-images")
        .getPublicUrl(fileName);

      urls.push(data.publicUrl);
    }

    return urls;
  };

  const saveProduct = async () => {
    if (!form.name || !form.price) {
      alert("Name & price required");
      return;
    }

    if (images.length > 9) {
      alert("Max 9 images allowed");
      return;
    }

    setLoading(true);

    const imageUrls = images.length ? await uploadImages() : [];

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        images: imageUrls
      })
    });

    setForm({ name: "", price: "" });
    setImages([]);
    setLoading(false);
    loadProducts();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Seller Dashboard</h2>

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages(Array.from(e.target.files))}
      />

      <button onClick={saveProduct} disabled={loading}>
        {loading ? "Saving..." : "Add Product"}
      </button>

      <hr />

      {products.map((p) => (
        <div key={p.id}>
          {p.name} – ₹{p.price}
        </div>
      ))}
    </div>
  );
}
