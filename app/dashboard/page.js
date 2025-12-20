"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { 
  Package, Users, TrendingUp, DollarSign, 
  Plus, Edit, Trash2, Upload, Image as ImageIcon,
  BarChart3, ShoppingBag, Settings, LogOut,
  Menu, X, Search, Filter
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 4.2
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setProducts(data);
      setStats({
        totalProducts: data.length,
        totalOrders: 125,
        totalRevenue: data.reduce((sum, p) => sum + (p.price || 0), 0) * 10,
        avgRating: 4.2
      });
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <header className="store-header md:hidden">
        <div className="header-container">
          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="brand-logo">Dashboard</div>
          <Link href="/" className="header-icon-btn">
            <ShoppingBag size={24} />
          </Link>
        </div>
      </header>

      {/* Mobile Menu Sidebar */}
      <div className={`mobile-sidebar-overlay ${showMobileMenu ? 'active' : ''}`}
           onClick={() => setShowMobileMenu(false)}>
      </div>
      
      <div className={`mobile-sidebar ${showMobileMenu ? 'active' : ''}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold">Dashboard</div>
            <button onClick={() => setShowMobileMenu(false)}>
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <nav className="sidebar-nav">
            <button className="nav-item active">
              <Package size={20} />
              Products
            </button>
            <button className="nav-item">
              <ShoppingBag size={20} />
              Orders
            </button>
            <button className="nav-item">
              <Users size={20} />
              Customers
            </button>
            <button className="nav-item">
              <BarChart3 size={20} />
              Analytics
            </button>
            <button className="nav-item">
              <Settings size={20} />
              Settings
            </button>
            <button className="nav-item">
              <LogOut size={20} />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar hidden md:flex">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            SIXSEVEN
          </Link>
          <div className="text-sm text-gray-500 mt-1">Admin Dashboard</div>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <Package size={20} />
            Products
          </button>
          <button className="nav-item">
            <ShoppingBag size={20} />
            Orders
          </button>
          <button className="nav-item">
            <Users size={20} />
            Customers
          </button>
          <button className="nav-item">
            <BarChart3 size={20} />
            Analytics
          </button>
          <button className="nav-item">
            <Settings size={20} />
            Settings
          </button>
        </nav>
        
        <div className="mt-auto p-4">
          <button className="nav-item">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <Link href="/dashboard/add-product" className="btn bg-primary text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus size={20} />
            Add Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="stat-value">{stats.totalProducts}</div>
                <div className="stat-label">Total Products</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBag size={24} className="text-green-600" />
              </div>
              <div>
                <div className="stat-value">{stats.totalOrders}</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-purple-600" />
              </div>
              <div>
                <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-orange-600" />
              </div>
              <div>
                <div className="stat-value">{stats.avgRating}</div>
                <div className="stat-label">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Products ({products.length})</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border rounded text-sm"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 border rounded text-sm">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      No products found. Add your first product!
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="product-row-image"
                            />
                          ) : (
                            <div className="product-row-image bg-gray-100 flex items-center justify-center">
                              <ImageIcon size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.color || 'Multiple colors'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-medium">
                        ₹{product.price?.toLocaleString()}
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-sm ${
                          (product.stock || 0) > 10 ? 'bg-green-100 text-green-800' :
                          (product.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock || 0} in stock
                        </span>
                      </td>
                      <td>
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {product.tag || 'Uncategorized'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn edit">
                            <Edit size={16} />
                          </button>
                          <button className="action-btn delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}