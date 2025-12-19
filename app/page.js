"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { supabase } from "../lib/supabaseClient";
import { Search, ShoppingCart, Heart, Filter, TrendingUp, Package, Users, Sparkles } from "lucide-react";

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
    // Load wishlist and cart from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setWishlist(savedWishlist);
    setCart(savedCart);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Search filter
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.color?.toLowerCase().includes(term) ||
        p.tag?.toLowerCase().includes(term)
      );
    }
    
    // Category filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(p => p.tag === activeFilter);
    }
    
    // Sort
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "popular":
        filtered = [...filtered].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      default:
        filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return filtered;
  }, [products, search, activeFilter, sortBy]);

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = ["all", "new", "bestseller", "sale", "limited"];

  return (
    <>
      {/* Header */}
      <header className="store-header">
        <div className="brand">
          <div className="brand-logo">SIXSEVEN</div>
          <div className="brand-tagline">Premium Streetwear & Minimalist Fashion</div>
        </div>

        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            className="search-input"
            placeholder="Search products, collections, styles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button 
            className="action-btn"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={20} />
            Cart
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
          <button className="action-btn">
            <Heart size={20} />
            Wishlist
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </button>
          <button className="action-btn">
            Account
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="store-main">
        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>
              <Package size={24} />
            </div>
            <div className="stat-info">
              <h3>{products.length}</h3>
              <span>Total Products</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: 'white' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3>{products.filter(p => p.tag === 'bestseller').length}</h3>
              <span>Best Sellers</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white' }}>
              <Sparkles size={24} />
            </div>
            <div className="stat-info">
              <h3>{products.filter(p => p.tag === 'new').length}</h3>
              <span>New Arrivals</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', color: 'white' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>1.2k</h3>
              <span>Active Users</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <Filter size={20} />
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card loading" style={{ height: '400px' }} />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWished={wishlist.includes(product.id)}
                onWishlistToggle={() => toggleWishlist(product.id)}
                onAddToCart={() => addToCart(product)}
              />
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="store-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SIXSEVEN</h3>
            <p>Premium streetwear and minimalist fashion for the modern individual.</p>
          </div>
          <div className="footer-section">
            <h3>Shop</h3>
            <ul className="footer-links">
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Best Sellers</a></li>
              <li><a href="#">Sale</a></li>
              <li><a href="#">Collections</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        total={cartTotal}
      />
    </>
  );
}

function ProductCard({ product, isWished, onWishlistToggle, onAddToCart }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="product-card fade-in">
      {product.tag && (
        <span className="product-badge">{product.tag}</span>
      )}
      
      <div className="product-img-container">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className={`product-img ${imageLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="product-img loading" />
        )}
      </div>
      
      <div className="product-info">
        <div className="product-category">SIXSEVEN</div>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">
          {product.color && `${product.color} • `}{product.size || 'One Size'}
        </p>
        
        <div className="product-meta">
          <div className="product-price">₹{product.price.toLocaleString()}</div>
          {product.originalPrice && (
            <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginLeft: '0.5rem' }}>
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        <div className="product-actions">
          <button className="btn btn-primary" onClick={onAddToCart}>
            Add to Cart
          </button>
          <button 
            className={`btn btn-secondary ${isWished ? 'active' : ''}`}
            onClick={onWishlistToggle}
          >
            <Heart size={18} fill={isWished ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CartSidebar({ isOpen, onClose, cart, onUpdateQuantity, onRemove, total }) {
  return (
    <div className={`cart-sidebar ${isOpen ? 'active' : ''}`}>
      <div className="cart-header">
        <h3>Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>×</button>
      </div>
      
      <div className="cart-items">
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <ShoppingCart size={48} color="#9ca3af" />
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Your cart is empty</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.images?.[0]} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {item.color} • {item.size || 'One Size'}
                </p>
                <div className="cart-item-price">₹{item.price.toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                  >
                    +
                  </button>
                  <button 
                    onClick={() => onRemove(item.id)}
                    style={{ marginLeft: 'auto', color: '#ef4444', fontSize: '0.875rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}