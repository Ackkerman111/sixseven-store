"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { 
  ArrowLeft, ShoppingCart, Heart, Share2, 
  Star, Truck, Shield, RefreshCw, Check,
  ChevronRight, Minus, Plus
} from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();
    
    if (!error && data) {
      setProduct(data);
      if (data.availableSizes?.length > 0) {
        setSelectedSize(data.availableSizes[0]);
      }
      if (data.availableColors?.length > 0) {
        setSelectedColor(data.availableColors[0]);
      }
    }
    setLoading(false);
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find(item => 
      item.id === product.id && 
      item.selectedSize === selectedSize && 
      item.selectedColor === selectedColor
    );
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, {
        ...product,
        quantity,
        selectedSize,
        selectedColor
      }];
    }
    
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert('Added to cart successfully!');
  };

  const buyNow = () => {
    addToCart();
    router.push('/checkout');
  };

  const sizes = ["28", "30", "32", "34", "36", "38"];
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Gray", value: "#6b7280" },
    { name: "White", value: "#ffffff", border: "1px solid #d1d5db" }
  ];

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="p-4">
          <div className="loading mb-4" style={{ height: '300px' }}></div>
          <div className="space-y-3">
            <div className="loading" style={{ height: '30px', width: '80%' }}></div>
            <div className="loading" style={{ height: '20px', width: '60%' }}></div>
            <div className="loading" style={{ height: '20px', width: '40%' }}></div>
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
    <div className="product-detail-container">
      {/* Header */}
      <header className="store-header">
        <div className="header-container">
          <button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft size={24} />
          </button>
          <Link href="/" className="brand-logo">
            SIXSEVEN
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart size={24} />
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container py-3">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={16} />
          <Link href="/products">Products</Link>
          <ChevronRight size={16} />
          <span>{product.name}</span>
        </div>
      </div>

      {/* Product Gallery */}
      <div className="product-gallery">
        <div className="container">
          <img 
            src={product.images?.[selectedImage] || '/placeholder.jpg'} 
            alt={product.name}
            className="main-image"
          />
          
          {product.images && product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info-detail container">
        <h1 className="product-title-detail">{product.name}</h1>
        
        <div className="product-rating-detail">
          <div className="rating-box">
            <Star size={14} fill="white" />
            <span>4.2</span>
          </div>
          <span className="text-gray-500">2,458 Ratings & 589 Reviews</span>
        </div>
        
        <div className="price-section">
          <div className="flex items-center gap-3 mb-2">
            <span className="current-price-detail">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="original-price-detail">₹{product.originalPrice?.toLocaleString()}</span>
                <span className="discount-percent-detail">
                  {Math.round((1 - product.price/product.originalPrice) * 100)}% off
                </span>
              </>
            )}
          </div>
          <div className="tax-info">Inclusive of all taxes</div>
        </div>
        
        {/* Size Selection */}
        <div className="size-section">
          <div className="section-title">Select Size</div>
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
        <div className="color-section">
          <div className="section-title">Select Color</div>
          <div className="color-options">
            {colors.map(color => (
              <button
                key={color.name}
                className={`color-option ${selectedColor === color.name ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: color.value,
                  border: color.border || 'none'
                }}
                onClick={() => setSelectedColor(color.name)}
                title={color.name}
              />
            ))}
          </div>
        </div>
        
        {/* Quantity Selector */}
        <div className="quantity-selector">
          <div className="section-title">Quantity</div>
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
            className="btn btn-primary flex items-center justify-center gap-2"
            onClick={addToCart}
          >
            <ShoppingCart size={20} />
            ADD TO CART
          </button>
          <button 
            className="btn btn-secondary"
            onClick={buyNow}
          >
            BUY NOW
          </button>
        </div>
        
        {/* Delivery Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <Truck size={20} className="text-gray-500 mt-1" />
            <div>
              <div className="font-medium mb-1">Delivery</div>
              <div className="text-sm text-gray-600">
                Enter pincode for delivery options
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  maxLength={6}
                />
                <button className="btn bg-primary text-white text-sm px-4">
                  Check
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              <span className="text-sm">7 Days Return</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-green-600" />
              <span className="text-sm">Free Shipping</span>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="product-tabs">
          <div className="tab-headers">
            <button 
              className={`tab-header ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button 
              className={`tab-header ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications
            </button>
            <button 
              className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'details' && (
              <div className="tab-panel active">
                <div className="space-y-3">
                  <p>{product.description || "Premium quality product with excellent craftsmanship and attention to detail."}</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      <span>Premium Quality Material</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      <span>Durable and Long Lasting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      <span>Easy to Maintain</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'specs' && (
              <div className="tab-panel active">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Material</span>
                    <span className="font-medium">100% Cotton</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Fit</span>
                    <span className="font-medium">Regular Fit</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Wash Care</span>
                    <span className="font-medium">Machine Wash</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="tab-panel active">
                <div className="text-center py-8 text-gray-500">
                  No reviews yet. Be the first to review!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}