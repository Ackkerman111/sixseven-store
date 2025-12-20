"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { 
  Search, ArrowLeft, Filter, SlidersHorizontal,
  Grid3x3, List, ChevronDown, Star
} from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    if (query) {
      searchProducts(query);
    }
  }, [searchParams]);

  const searchProducts = async (query) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tag.ilike.%${query}%`)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="store-header bg-white sticky top-0 z-10">
        <div className="header-container">
          <button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft size={24} />
          </button>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </form>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white border-b">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {products.length} results for "{searchQuery}"
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 text-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Filters
              </button>
              <div className="relative">
                <select 
                  className="appearance-none pl-3 pr-8 py-2 border rounded text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="popular">Popularity</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="container py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="font-medium mb-3">Category</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">T-Shirts</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Jeans</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Shirts</span>
                  </label>
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-3">Price</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="price" className="rounded-full" />
                    <span className="text-sm">Under ₹500</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="price" className="rounded-full" />
                    <span className="text-sm">₹500 - ₹1000</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="price" className="rounded-full" />
                    <span className="text-sm">₹1000 - ₹2000</span>
                  </label>
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-3">Brand</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">SIXSEVEN</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Premium</span>
                  </label>
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-3">Rating</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <div className="flex items-center gap-1">
                      <Star size={14} fill="#ffb400" />
                      <Star size={14} fill="#ffb400" />
                      <Star size={14} fill="#ffb400" />
                      <Star size={14} fill="#ffb400" />
                      <Star size={14} fill="#ffb400" />
                      <span className="text-sm ml-1">& above</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <div className="flex items-center gap-1">
                      <Star size={14} fill="#ffb400" />
                      <Star size={14} fill="#ffb400" />
                      <Star size={14} fill="#ffb400" />
                      <Star size={14} fill="#ffb400" />
                      <span className="text-sm ml-1">& above</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button 
                className="px-4 py-2 border rounded text-sm"
                onClick={() => setShowFilters(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded text-sm">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <main className="container py-6">
        {loading ? (
          <div className="product-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="product-card">
                <div className="product-image-container loading" style={{ height: '200px' }}></div>
                <div className="product-info">
                  <div className="loading mb-2" style={{ height: '20px', width: '80%' }}></div>
                  <div className="loading mb-2" style={{ height: '20px', width: '60%' }}></div>
                  <div className="loading" style={{ height: '20px', width: '40%' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try different keywords or filters</p>
            <button 
              onClick={() => router.push('/')}
              className="btn btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-gray-400">No Image</div>
                    </div>
                  )}
                  
                  {product.tag === 'sale' && (
                    <div className="product-badge">Sale</div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  
                  <div className="product-rating">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < 4 ? "#ffb400" : "none"} />
                      ))}
                    </div>
                    <span className="rating-count">(4.2)</span>
                  </div>
                  
                  <div className="product-price">
                    <span className="current-price">₹{product.price?.toLocaleString()}</span>
                    {product.originalPrice && (
                      <>
                        <span className="original-price">₹{product.originalPrice?.toLocaleString()}</span>
                        <span className="discount-percent">
                          {Math.round((1 - product.price/product.originalPrice) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="product-delivery">
                    Free delivery
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
