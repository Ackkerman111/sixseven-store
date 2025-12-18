"use client";

import { useEffect, useState } from "react";
import { supabaseStorage } from "../../lib/supabaseStorage";

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
  const [images, setImages] = useState([]);

  const loadProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (!data.error) setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const uploadImages = async (files) => {
    const urls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabaseStorage.storage
        .from("products")
        .upload(fileName, file);

      if (error) {
        alert("Image upload failed");
        return [];
      }

      const { data } = supabaseStorage.storage
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
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages([...e.target.files])}
      />

      <button onClick={saveProduct} disabled={loading}>
        {loading ? "Saving..." : editingId ? "Update" : "Add"}
      </button>

      <hr />

      {products.map((p) => (
        <div key={p.id}>
          <b>{p.name}</b> – ₹{p.price}
          <button onClick={() => deleteProduct(p.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
