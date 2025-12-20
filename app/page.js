"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { 
  Search, ShoppingCart, User, Menu, X, 
  ChevronRight, Star, Truck, Shield, RefreshCw,
  Shirt, Footprints, Watch, Bag, Glasses, Smartphone
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    { id: 1, name: "T-Shirts", icon: <Shirt />, color: "#3b82f6" },
    { id: 2, name: "Jeans", icon: <Footprints />, color: "#8b5cf6" },
    { id: 3, name: "Shirts", icon: <Shirt />, color: "#10b981" },
    { id: 4, name: "Jackets", icon: <Shirt />, color: "#f59e0b" },
    { id: 5, name: "Shoes", icon: <Footprints />, color: "#ef4444" },
    { id: 6, name: "Watches", icon: <Watch />, color: "#ec4899" },
    { id: 7, name: "Bags", icon: <Bag />, color: "#6366f1" },
    { id: 8, name: "Accessories", icon: <Glasses />, color: "#14b8a6" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const addToCart = (product, size = "M", color = "Black") => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.size === size && 
        item.color === color
      );
      
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { 
        ...product, 
        quantity: 1, 
        size, 
        color,
        selectedSize: size,
        selectedColor: color
      }];
    });
  };

  return (
    <div className="store-container">
      {/* Header */}
      <header className="store-header">
        <div className="header-container">
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Brand Logo */}
          <Link href="/" className="brand-logo">
            SIXSEVEN
          </Link>

          {/* Desktop Search (hidden on mobile) */}
          <div className="search-container hidden md:block">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn bg-primary text-white px-4">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Mobile Search Button */}
            <button 
              className="mobile-search-btn md:hidden"
              onClick={() => setShowSearch(true)}
            >
              <Search size={24} />
            </button>

            {/* Cart */}
            <button 
              className="header-icon-btn"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>

            {/* User Account */}
            <Link href="/dashboard" className="header-icon-btn">
              <User size={24} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <div className={`search-container md:hidden ${showSearch ? 'active' : ''}`}>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button 
            type="button" 
            className="search-close-btn"
            onClick={() => setShowSearch(false)}
          >
            <X size={24} />
          </button>
        </form>
      </div>

      {/* Mobile Menu Sidebar */}
      <div className={`mobile-sidebar-overlay ${showMobileMenu ? 'active' : ''}`}
           onClick={() => setShowMobileMenu(false)}>
      </div>
      
      <div className={`mobile-sidebar ${showMobileMenu ? 'active' : ''}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="brand-logo">SIXSEVEN</div>
            <button onClick={() => setShowMobileMenu(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="text-sm text-gray-500">Premium Streetwear & Minimalist Fashion</div>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.name.toLowerCase()}`}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span>{cat.name}</span>
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <Link href="/dashboard" className="flex items-center gap-3 py-2">
              <User size={20} />
              My Account
            </Link>
            <Link href="/orders" className="flex items-center gap-3 py-2">
              <ShoppingCart size={20} />
              My Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content container">
        {/* Categories Grid */}
        <div className="category-grid">
          {categories.map(category => (
            <Link 
              key={category.id}
              href={`/category/${category.name.toLowerCase()}`}
              className="category-card"
            >
              <div className="category-icon" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                {category.icon}
              </div>
              <div className="category-name">{category.name}</div>
            </Link>
          ))}
        </div>

        {/* Products Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Popular Products</h2>
            <Link href="/products" className="text-primary font-medium text-sm flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(10)].map((_, i) => (
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
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-lg p-4 shadow mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Truck size={24} className="text-blue-600" />
              </div>
              <div className="text-sm font-medium">Free Shipping</div>
              <div className="text-xs text-gray-500">Above ₹999</div>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <RefreshCw size={24} className="text-green-600" />
              </div>
              <div className="text-sm font-medium">Easy Returns</div>
              <div className="text-xs text-gray-500">30 Day Returns</div>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Shield size={24} className="text-purple-600" />
              </div>
              <div className="text-sm font-medium">Secure Payment</div>
              <div className="text-xs text-gray-500">100% Secure</div>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Star size={24} className="text-orange-600" />
              </div>
              <div className="text-sm font-medium">Best Quality</div>
              <div className="text-xs text-gray-500">Premium Products</div>
            </div>
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        setCart={setCart}
      />

      {/* Footer */}
      <footer className="store-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>SIXSEVEN</h3>
              <ul className="footer-links">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/press">Press</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Help</h3>
              <ul className="footer-links">
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/shipping">Shipping</Link></li>
                <li><Link href="/returns">Returns</Link></li>
                <li><Link href="/size-guide">Size Guide</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Shop</h3>
              <ul className="footer-links">
                <li><Link href="/products">All Products</Link></li>
                <li><Link href="/category/men">Men</Link></li>
                <li><Link href="/category/women">Women</Link></li>
                <li><Link href="/category/sale">Sale</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Legal</h3>
              <ul className="footer-links">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="copyright">
            © 2024 SIXSEVEN. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleProductClick = () => {
    router.push(`/product/${product.id}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div 
      className="product-card fade-in"
      onClick={handleProductClick}
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
            <Shirt size={48} className="text-gray-400" />
          </div>
        )}
        
        {product.tag === 'sale' && (
          <div className="product-badge">Sale</div>
        )}
        
        {product.tag === 'new' && (
          <div className="product-badge" style={{ backgroundColor: '#10b981' }}>New</div>
        )}
        
        <button 
          className="product-wishlist-btn"
          onClick={handleWishlist}
        >
          <svg 
            className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
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
    </div>
  );
}

function CartSidebar({ isOpen, onClose, cart, setCart }) {
  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(index);
      return;
    }
    
    setCart(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = totalPrice > 999 ? 0 : 49;
  const finalTotal = totalPrice + deliveryCharge;

  return (
    <>
      <div className={`mobile-sidebar-overlay ${isOpen ? 'active' : ''}`}
           onClick={onClose}>
      </div>
      
      <div className={`cart-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h3 className="text-lg font-bold">Shopping Cart ({cart.length})</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <ShoppingCart size={64} className="text-gray-300 mb-4" />
              <h4 className="text-lg font-medium mb-2">Your cart is empty</h4>
              <p className="text-gray-500 mb-6">Add items to get started</p>
              <button 
                onClick={onClose}
                className="btn btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <img 
                  src={item.images?.[0]} 
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.name}</h4>
                  <div className="cart-item-size">
                    Size: {item.size} | Color: {item.color}
                  </div>
                  <div className="cart-item-price">
                    ₹{item.price?.toLocaleString()}
                  </div>
                  <div className="cart-item-actions">
                    <button 
                      className="quantity-btn-small"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="cart-item-quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn-small"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="remove-item-btn"
                      onClick={() => removeFromCart(index)}
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
            <div className="price-summary">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>Delivery</span>
                <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <button className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}