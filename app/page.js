
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return products;
    return products.filter((p) =>
      (p.name + " " + (p.color || "") + " " + (p.tag || ""))
        .toLowerCase()
        .includes(term)
    );
  }, [products, search]);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="store-header">
        <div>
          <div className="store-title">Six Seven Clothing</div>
          <div className="brand-badge">Streetwear • Minimal • Daily Fits</div>
        </div>

        <div className="search-wrapper">
          <input
            className="search-input"
            placeholder="Search tees, hoodies, cargos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <div className="chip">Cart: {cartCount}</div>
          <div className="chip">Wishlist: {wishlist.length}</div>
        </div>
      </header>

      <main className="store-main">
        <div className="info-bar">
          <span>
            Showing{" "}
            <span className="info-highlight">
              {filteredProducts.length}
            </span>{" "}
            products
          </span>
          <span>Tap ♥ to save, “Buy” adds to cart (no payment yet).</span>
        </div>

        <section className="product-grid">
          {filteredProducts.map((p) => {
            const wished = wishlist.includes(p.id);
            return (
              <article key={p.id} className="product-card">
                <div className="product-img">
  {p.images && p.images.length > 0 ? (
    <img
      src={p.images[0]}
      alt={p.name}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "10px"
      }}
    />
  ) : (
    <span>No Image</span>
  )}
</div>

                <div className="product-brand">Six Seven</div>
                <div className="product-name">{p.name}</div>

                <div className="product-meta">
                  <div>
                    <div className="product-price">₹{p.price}</div>
                    <div
                      style={{ fontSize: "0.75rem", color: "#6b7280" }}
                    >
                      {p.color || "Color free"} • {p.size || "Free size"}
                    </div>
                  </div>
                  {p.tag && <span className="product-tag">{p.tag}</span>}
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => addToCart(p)}
                  >
                    Buy
                  </button>
                  <button
                    className={
                      "btn btn-ghost" + (wished ? " active" : "")
                    }
                    onClick={() => toggleWishlist(p.id)}
                  >
                    {wished ? "♥" : "♡"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <div className="footer-summary">
          <div>
            <span className="badge">Cart items: {cartCount}</span>{" "}
            <span className="badge">Wishlist: {wishlist.length}</span>
          </div>
          <div>
            Later we can connect wishlist/cart to Supabase & add payments.
          </div>
        </div>
      </main>
    </>
  );
}
