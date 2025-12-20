"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    color: "",
    size: "S,M,L,XL",
    tag: "",
    stock: "100",
    description: ""
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    
    setImages([...images, ...files]);
    
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...urls]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newUrls = [...previewUrls];
    
    newImages.splice(index, 1);
    newUrls.splice(index, 1);
    
    setImages(newImages);
    setPreviewUrls(newUrls);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.price) {
      alert("Product name and price are required");
      return;
    }
    
    if (images.length === 0) {
      alert("Please upload at least one product image");
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload images
      const imageUrls = await uploadImages();
      
      // Prepare product data
      const productData = {
        name: form.name,
        price: parseFloat(form.price),
        color: form.color,
        availableSizes: form.size.split(',').map(s => s.trim()),
        availableColors: form.color ? form.color.split(',').map(c => c.trim()) : [],
        tag: form.tag,
        stock: parseInt(form.stock) || 100,
        description: form.description,
        images: imageUrls
      };
      
      // Save to database
      const { error } = await supabase
        .from("products")
        .insert([productData]);
      
      if (error) throw error;
      
      alert("Product added successfully!");
      router.push("/dashboard");
      
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="store-header bg-white">
        <div className="header-container">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Add New Product</h1>
          <div></div>
        </div>
      </div>

      <main className="container py-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Product Images</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer block">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <div className="font-medium mb-2">Click to upload images</div>
                <div className="text-sm text-gray-500">Max 5 images. Recommended: 1000x1200px</div>
              </label>
            </div>
            
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Preview ${index}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Product Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="SIXSEVEN Premium T-Shirt"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="999"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="100"
                    value={form.stock}
                    onChange={(e) => setForm({...form, stock: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Colors (comma separated)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Black, White, Gray"
                  value={form.color}
                  onChange={(e) => setForm({...form, color: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Sizes (comma separated)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="S, M, L, XL"
                  value={form.size}
                  onChange={(e) => setForm({...form, size: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category Tag</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={form.tag}
                  onChange={(e) => setForm({...form, tag: e.target.value})}
                >
                  <option value="">Select tag</option>
                  <option value="new">New Arrival</option>
                  <option value="bestseller">Best Seller</option>
                  <option value="sale">On Sale</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                  placeholder="Product description..."
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border rounded-lg font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-lg font-medium flex items-center gap-2"
              disabled={loading}
            >
              {loading ? "Adding..." : (
                <>
                  <Plus size={20} />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}