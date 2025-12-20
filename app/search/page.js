"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, Search, X } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all products initially
  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setProducts(data);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadAllProducts();
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${searchQuery}%,color.ilike.%${searchQuery}%,tag.ilike.%${searchQuery}%`);
    
    setLoading(false);
    if (data) {
      setProducts(data);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    loadAllProducts();
  };

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-header">
        <button onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        
        <form onSubmit={handleSearch} className="search-input-container">
          <input
            type="text"
            placeholder="Search SIXSEVEN products..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X size={20} className="text-gray-400" />
            </button>
          )}
        </form>
      </div>

      {/* Search Results */}
      <main className="main-content container">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-4">
            {searchQuery 
              ? `Search results for "${searchQuery}" (${products.length} items)`
              : `All products (${products.length} items)`
            }
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-card">
                  <div className="product-image-container loading" style={{ height: '300px' }}></div>
                  <div className="product-info">
                    <div className="loading mb-2" style={{ height: '16px', width: '40%' }}></div>
                    <div className="loading mb-2" style={{ height: '20px', width: '60%' }}></div>
                    <div className="loading" style={{ height: '24px', width: '30%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="product-grid">
              {products.map(product => (
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
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Search size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <div className="product-brand">SIXSEVEN</div>
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-price">₹{product.price?.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? `No products found for "${searchQuery}"`
                  : "No products available yet"
                }
              </p>
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="btn btn-outline"
                >
                  View all products
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}