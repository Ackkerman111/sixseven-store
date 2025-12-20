"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Search, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
    if (q) searchProducts(q);
  }, [searchParams]);

  const searchProducts = async (q) => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,tag.ilike.%${q}%`)
      .order("created_at", { ascending: false });

    setProducts(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="store-header bg-white sticky top-0 z-10">
        <div className="header-container">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>

          <div className="flex-1 mx-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                readOnly
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="container py-6">
        {loading ? (
          <p>Loading…</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium">No products found</h3>
            <p className="text-gray-500">Try another search</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="product-card"
              >
                <div className="product-image-container">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <div className="bg-gray-100 h-full flex items-center justify-center">
                      No Image
                    </div>
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>

                  <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < 4 ? "#ffb400" : "none"} />
                    ))}
                  </div>

                  <div className="product-price">
                    ₹{product.price?.toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
