"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft, ShoppingBag, Plus, Minus, Check } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadProduct();
    updateCartCount();
  }, [params.id]);

  const loadProduct = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();
    
    if (data) {
      setProduct(data);
      if (data.availableSizes?.[0]) {
        setSelectedSize(data.availableSizes[0]);
      }
      if (data.availableColors?.[0]) {
        setSelectedColor(data.availableColors[0]);
      }
    }
    setLoading(false);
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('sixseven_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const addToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    const cart = JSON.parse(localStorage.getItem('sixseven_cart') || '[]');
    
    // Check if same product with same size and color already exists
    const existingIndex = cart.findIndex(item => 
      item.id === product.id && 
      item.selectedSize === selectedSize && 
      item.selectedColor === selectedColor
    );

    let newCart;
    if (existingIndex > -1) {
      newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart = [...cart, {
        ...product,
        quantity,
        selectedSize,
        selectedColor
      }];
    }

    localStorage.setItem('sixseven_cart', JSON.stringify(newCart));
    updateCartCount();
    alert('Added to cart successfully!');
  };

  const buyNow = () => {
    addToCart();
    router.push('/cart');
  };

  const sizes = product?.availableSizes || ["S", "M", "L", "XL"];
  const colors = product?.availableColors || ["Black", "White", "Gray"];

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="p-4">
          <div className="loading mb-6" style={{ height: '400px' }}></div>
          <div className="space-y-4">
            <div className="loading" style={{ height: '32px', width: '70%' }}></div>
            <div className="loading" style={{ height: '40px', width: '40%' }}></div>
            <div className="loading" style={{ height: '24px', width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Product not found</h2>
        <Link href="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* Header */}
      <div className="store-header">
        <div className="header-container">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <Link href="/" className="brand-logo">SIXSEVEN</Link>
          <Link href="/cart" className="header-icon-btn">
            <ShoppingBag size={24} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Product Gallery */}
      <div className="product-gallery">
        <img 
          src={product.images?.[0] || '/placeholder.jpg'} 
          alt={product.name}
          className="main-image"
        />
      </div>

      {/* Product Info */}
      <div className="product-info-section">
        <h1 className="product-title">{product.name}</h1>
        <div className="product-price">₹{product.price?.toLocaleString()}</div>
        
        {/* Size Selection */}
        <div className="size-section">
          <div className="section-title">SELECT SIZE</div>
          <div className="size-options">
            {sizes.map(size => (
              <button
                key={size}
                className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        {/* Color Selection */}
        {colors.length > 0 && (
          <div className="color-section">
            <div className="section-title">SELECT COLOR</div>
            <div className="color-options">
              {colors.map(color => (
                <button
                  key={color}
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: color.toLowerCase(),
                    border: color.toLowerCase() === 'white' ? '1px solid #d1d5db' : 'none'
                  }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Quantity Selector */}
        <div className="quantity-selector">
          <div className="section-title">QUANTITY</div>
          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus size={20} />
            </button>
            <input
              type="number"
              className="quantity-input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
            <button 
              className="quantity-btn"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={addToCart}
          >
            ADD TO CART
          </button>
          <button 
            className="btn btn-outline"
            onClick={buyNow}
          >
            BUY NOW
          </button>
        </div>
        
        {/* Product Description */}
        <div className="product-description">
          <h2 className="description-title">PRODUCT DETAILS</h2>
          <div className="description-content">
            {product.description || "Premium quality SIXSEVEN streetwear. Made with attention to detail and designed for comfort and style."}
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>100% Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>Free Shipping on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>Easy Returns & Exchanges</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}