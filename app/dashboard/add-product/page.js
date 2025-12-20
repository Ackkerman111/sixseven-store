"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { 
  ArrowLeft, Upload, X, Plus, 
  Package, DollarSign, Palette, 
  Ruler, Tag, FileText
} from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    sku: "",
    color: "",
    size: "",
    tag: "",
    stock: "100"
  });

  const handleImageUpload = (files) => {
    const filesArray = Array.from(files);
    setImages(filesArray);
    
    const urls = filesArray.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
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
        description: form.description,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        sku: form.sku,
        color: form.color,
        size: form.size,
        tag: form.tag,
        stock: parseInt(form.stock),
        images: imageUrls,
        availableSizes: form.size ? form.size.split(',').map(s => s.trim()) : [],
        availableColors: form.color ? form.color.split(',').map(c => c.trim()) : []
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
      alert("Failed to add product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="store-header bg-white">
        <div className="header-container">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Add New Product</h1>
          <div></div> {/* Empty div for spacing */}
        </div>
      </header>

      <main className="container py-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Upload size={20} />
              Product Images
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className="text-gray-400" />
                </div>
                <div className="font-medium mb-2">Click to upload images</div>
                <div className="text-sm text-gray-500">
                  Upload at least 1 image. Max 5 images.
                </div>
              </label>
            </div>
            
            {previewUrls.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-medium mb-3">Uploaded Images ({previewUrls.length})</div>
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
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package size={20} />
              Product Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Package size={16} />
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                  placeholder="Enter product description"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="₹999"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Original Price
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="₹1499"
                    value={form.originalPrice}
                    onChange={(e) => setForm({...form, originalPrice: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="SKU-001"
                  value={form.sku}
                  onChange={(e) => setForm({...form, sku: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Palette size={16} />
                    Colors (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Black, White, Blue"
                    value={form.color}
                    onChange={(e) => setForm({...form, color: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Ruler size={16} />
                    Sizes (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="S, M, L, XL"
                    value={form.size}
                    onChange={(e) => setForm({...form, size: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag size={16} />
                    Category / Tag
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg"
                    value={form.tag}
                    onChange={(e) => setForm({...form, tag: e.target.value})}
                  >
                    <option value="">Select category</option>
                    <option value="new">New Arrival</option>
                    <option value="bestseller">Best Seller</option>
                    <option value="sale">On Sale</option>
                    <option value="limited">Limited Edition</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="100"
                    value={form.stock}
                    onChange={(e) => setForm({...form, stock: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
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
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                "Adding Product..."
              ) : (
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
