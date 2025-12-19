"use client";

import "./dashboard.css";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { 
  Package, Users, TrendingUp, DollarSign, 
  Plus, Edit, Trash2, Upload, Image as ImageIcon,
  BarChart3, ShoppingBag, Settings, LogOut
} from "lucide-react";

const emptyProduct = {
  name: "",
  price: "",
  color: "",
  size: "",
  tag: "",
  description: "",
  stock: "",
  sku: ""
};

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  });

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error) {
      setProducts(data);
      
      // Calculate stats
      const totalValue = data.reduce((sum, p) => sum + (p.price || 0), 0);
      const lowStock = data.filter(p => p.stock < 10 && p.stock > 0).length;
      const outOfStock = data.filter(p => p.stock <= 0).length;
      
      setStats({
        totalProducts: data.length,
        totalValue,
        lowStock,
        outOfStock
      });
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleImageUpload = (files) => {
    const filesArray = Array.from(files);
    setImages(filesArray);
    
    // Create preview URLs
    const urls = filesArray.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const uploadImages = async () => {
    const urls = [];
    
    for (const file of images) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
      
      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, file);
      
      if (error) {
        console.error("Upload error:", error);
        continue;
      }
      
      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);
      
      urls.push(data.publicUrl);
    }
    
    return urls;
  };

  const saveProduct = async () => {
    if (!form.name || !form.price) {
      alert("Name and price are required");
      return;
    }
    
    setLoading(true);
    
    let imageUrls = [];
    if (images.length > 0) {
      imageUrls = await uploadImages();
    }
    
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      images: imageUrls.length > 0 ? imageUrls : form.images || []
    };
    
    const endpoint = editingId 
      ? `/api/products/${editingId}`
      : "/api/products";
    
    const method = editingId ? "PUT" : "POST";
    
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Reset form
      setForm(emptyProduct);
      setImages([]);
      setPreviewUrls([]);
      setEditingId(null);
      
      // Reload products
      await loadProducts();
      
      alert(editingId ? "Product updated!" : "Product added!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const editProduct = (product) => {
    setForm(product);
    setEditingId(product.id);
    setPreviewUrls(product.images || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE"
    });
    
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    
    loadProducts();
    alert("Product deleted!");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>SIXSEVEN</h2>
          <div className="sidebar-subtitle">Admin Dashboard</div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={20} />
            Products
          </button>
          
          <button 
            className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 size={20} />
            Analytics
          </button>
          
          <button 
            className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={20} />
            Orders
          </button>
          
          <button 
            className={`nav-item ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            <Users size={20} />
            Customers
          </button>
          
          <button 
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={20} />
            Settings
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Overview */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>₹{stats.totalValue.toLocaleString()}</h3>
              <p>Inventory Value</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.lowStock}</h3>
              <p>Low Stock</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.outOfStock}</h3>
              <p>Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Product Form */}
        <div className="dashboard-card">
          <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="SKU-001"
              />
            </div>
            
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="999"
              />
            </div>
            
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="50"
              />
            </div>
            
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="Black, White, etc."
              />
            </div>
            
            <div className="form-group">
              <label>Size</label>
              <input
                type="text"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder="S, M, L, XL"
              />
            </div>
            
            <div className="form-group">
              <label>Tag/Category</label>
              <select
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="new">New Arrival</option>
                <option value="bestseller">Best Seller</option>
                <option value="sale">On Sale</option>
                <option value="limited">Limited Edition</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>
            
            <div className="form-group full-width">
              <label>Product Images</label>
              <div className="image-upload-area">
                <label className="upload-label">
                  <Upload size={24} />
                  <span>Click to upload images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
                
                {previewUrls.length > 0 && (
                  <div className="image-previews">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="image-preview">
                        <img src={url} alt={`Preview ${index}`} />
                        <button 
                          type="button"
                          onClick={() => {
                            const newUrls = [...previewUrls];
                            newUrls.splice(index, 1);
                            setPreviewUrls(newUrls);
                            const newImages = [...images];
                            newImages.splice(index, 1);
                            setImages(newImages);
                          }}
                          className="remove-image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyProduct);
                  setEditingId(null);
                  setImages([]);
                  setPreviewUrls([]);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
            <button
              onClick={saveProduct}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                "Saving..."
              ) : editingId ? (
                <>
                  <Edit size={16} />
                  Update Product
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Product
                </>
              )}
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="dashboard-card">
          <div className="table-header">
            <h2>All Products ({products.length})</h2>
          </div>
          
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="product-thumb"
                        />
                      ) : (
                        <div className="product-thumb-placeholder">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <div className="product-meta">
                        {product.color && <span>{product.color}</span>}
                        {product.size && <span>{product.size}</span>}
                      </div>
                    </td>
                    <td>{product.sku || "N/A"}</td>
                    <td>₹{product.price?.toLocaleString()}</td>
                    <td>
                      <span className={`stock-badge ${
                        product.stock <= 0 ? "out" : 
                        product.stock < 10 ? "low" : "in"
                      }`}>
                        {product.stock <= 0 ? "Out of Stock" : `${product.stock} units`}
                      </span>
                    </td>
                    <td>
                      {product.tag && (
                        <span className="category-tag">{product.tag}</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => editProduct(product)}
                          className="action-btn edit"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="action-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}