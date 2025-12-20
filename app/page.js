"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { ShoppingBag, User, Search, Menu } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load products and cart count
  useEffect(() => {
    loadProducts();
    updateCartCount();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('sixseven_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  return (
    <div className="store-container">
      {/* Header */}
      <header className="store-header">
        <div className="header-container">
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Brand */}
          <Link href="/" className="flex flex-col">
            <div className="brand-logo">SIXSEVEN</div>
            <div className="brand-tagline">PREMIUM STREETWEAR</div>
          </Link>

          {/* Header Actions */}
          <div className="header-actions">
            <Link href="/search" className="header-icon-btn">
              <Search size={24} />
            </Link>
            
            <Link href="/cart" className="header-icon-btn">
              <ShoppingBag size={24} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
            
            <Link href="/dashboard" className="header-icon-btn">
              <User size={24} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sidebar */}
      <div className={`mobile-sidebar-overlay ${showMobileMenu ? 'active' : ''}`}
           onClick={() => setShowMobileMenu(false)}>
      </div>
      
      <div className={`mobile-sidebar ${showMobileMenu ? 'active' : ''}`}>
        <div className="p-6">
          <div className="mb-8">
            <div className="brand-logo mb-2">SIXSEVEN</div>
            <div className="brand-tagline">PREMIUM STREETWEAR</div>
          </div>
          
          <nav className="space-y-4">
            <Link 
              href="/" 
              className="block py-3 font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
            <Link 
              href="/search" 
              className="block py-3 font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Search Products
            </Link>
            <Link 
              href="/cart" 
              className="block py-3 font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            <Link 
              href="/dashboard" 
              className="block py-3 font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner">
        <h1 className="hero-title">SIXSEVEN COLLECTION</h1>
        <p className="hero-subtitle">Minimalist streetwear essentials for the modern individual</p>
      </div>

      {/* Main Content */}
      <main className="main-content container">
        {/* Products Section */}
        <div>
          <div className="flex justify-between items-center mb-6 px-4 md:px-0">
            <h2 className="text-xl font-bold">LATEST DROPS</h2>
            <div className="text-sm text-gray-500">
              Showing {products.length} products
            </div>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(8)].map((_, i) => (
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
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available yet.</p>
              <Link href="/dashboard" className="btn btn-primary mt-4">
                Add Products
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="store-footer">
        <div className="footer-content">
          <div className="footer-logo">SIXSEVEN</div>
          <div className="footer-tagline">Premium Streetwear & Minimalist Fashion</div>
          
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/search">Search</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
          
          <div className="copyright">
            © 2024 SIXSEVEN. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <Link 
      href={`/product/${product.id}`}
      className="product-card fade-in"
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
            <ShoppingBag size={48} className="text-gray-400" />
          </div>
        )}
        
        {product.tag === 'new' && (
          <div className="product-badge">NEW</div>
        )}
        
        {product.tag === 'sale' && (
          <div className="product-badge">SALE</div>
        )}
      </div>
      
      <div className="product-info">
        <div className="product-brand">SIXSEVEN</div>
        <h3 className="product-title">{product.name}</h3>
        <div className="product-price">₹{product.price?.toLocaleString()}</div>
        {product.color && (
          <div className="product-color">{product.color}</div>
        )}
      </div>
    </Link>
  );
}