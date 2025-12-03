// js/admin.js

// Upload image to Supabase Storage bucket "product-images"
async function uploadImage(file) {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await db
    .storage
    .from("product-images")
    .upload(fileName, file);

  if (error) {
    alert("Image upload failed");
    console.error(error);
    return null;
  }

  const { data: publicUrlData } = db
    .storage
    .from("product-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

// Add new product
async function addProduct() {
  const nameEl = document.getElementById("pName");
  const priceEl = document.getElementById("pPrice");
  const categoryEl = document.getElementById("pCategory");
  const descEl = document.getElementById("pDescription");
  const sizesEl = document.getElementById("pSizes");
  const imageEl = document.getElementById("pImage");

  const name = nameEl.value.trim();
  const price = Number(priceEl.value);
  const category = categoryEl.value.trim();
  const description = descEl.value.trim();
  const sizes = sizesEl.value.trim();
  const file = imageEl.files[0];

  if (!name || !price) {
    alert("Name and price are required.");
    return;
  }

  let imageUrl = null;
  if (file) {
    imageUrl = await uploadImage(file);
    if (!imageUrl) return;
  }

  const { error } = await db.from("products").insert([
    {
      name,
      price,
      category,
      description,
      sizes,
      image: imageUrl
    }
  ]);

  if (error) {
    alert("Failed to add product");
    console.error(error);
    return;
  }

  alert("Product added!");
  nameEl.value = "";
  priceEl.value = "";
  categoryEl.value = "";
  descEl.value = "";
  sizesEl.value = "";
  imageEl.value = "";

  loadProductsAdmin();
}

// Load products for admin
async function loadProductsAdmin() {
  const container = document.getElementById("adminProducts");
  if (!container) return;

  container.innerHTML = "Loading...";

  const { data, error } = await db.from("products").select("*").order("id", { ascending: false });

  if (error) {
    container.innerHTML = "Failed to load products.";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "No products in store yet.";
    return;
  }

  container.innerHTML = "";
  data.forEach(p => {
    container.innerHTML += `
      <div class="card admin-card">
        <img src="${p.image || "https://via.placeholder.com/400x400?text=No+Image"}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>
        <p class="text-muted">${p.category || ""}</p>
        <button class="btn btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    `;
  });
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  const { error } = await db.from("products").delete().eq("id", id);
  if (error) {
    alert("Failed to delete product");
    console.error(error);
    return;
  }
  loadProductsAdmin();
}