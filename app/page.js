"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeImage, setActiveImage] = useState({});

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setProducts(data);
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

  const nextImage = (id, total) => {
    setActiveImage((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 0) + 1) % total
    }));
  };

  const prevImage = (id, total) => {
    setActiveImage((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 0) - 1 + total) % total
    }));
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <header className="store-header">
        <div>
          <div className="store-title">Six Seven Clothing Store</div>
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
        <section className="product-grid">
          {filteredProducts.map((p) => {
            const images = p.images || [];
            const index = activeImage[p.id] ?? 0;

            return (
              <article key={p.id} className="product-card">
                {/* IMAGE SLIDER */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    borderRadius: 12
                  }}
                >
                  {images.length > 0 ? (
                    <img
                      src={images[index]}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", paddingTop: 60 }}>
                      No Image
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => prevImage(p.id, images.length)}
                        style={sliderBtn("left")}
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => nextImage(p.id, images.length)}
                        style={sliderBtn("right")}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {/* DOTS */}
                {images.length > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 6 }}>
                    {images.map((_, i) => (
                      <span
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: i === index ? "#111" : "#ccc"
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="product-name">{p.name}</div>
                <div className="product-price">₹{p.price}</div>
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}

const sliderBtn = (side) => ({
  position: "absolute",
  top: "50%",
  [side]: 8,
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 30,
  height: 30,
  cursor: "pointer"
});
