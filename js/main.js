// js/main.js

// ---------- CART HELPERS ----------
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
  let cart = getCart();
  const existing = cart.find(item => item.product_id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ product_id: productId, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  alert("Added to cart");
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  el.textContent = totalQty;
}

// ---------- INDEX: LOAD PRODUCTS ----------
async function loadProducts() {
  const grid = document.getElementById("productList");
  if (!grid) return;

  grid.innerHTML = "Loading products...";

  const { data, error } = await db.from("products").select("*").order("id", { ascending: false });

  if (error) {
    grid.innerHTML = "Failed to load products.";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    grid.innerHTML = "No products yet.";
    return;
  }

  grid.innerHTML = "";
  data.forEach(p => {
    grid.innerHTML += `
      <div class="card">
        <span class="badge">${p.category || "Clothing"}</span>
        <img src="${p.image || "https://via.placeholder.com/400x400?text=No+Image"}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>
        <div style="display:flex;justify-content:space-between;gap:8px;margin-top:auto;">
          <button class="btn btn-outline" onclick="window.location.href='product.html?id=${p.id}'">View</button>
          <button class="btn btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    `;
  });
}

// ---------- PRODUCT PAGE ----------
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadSingleProduct() {
  const wrap = document.getElementById("productPage");
  if (!wrap) return;

  const id = getQueryParam("id");
  if (!id) {
    wrap.innerHTML = "<p>Product not found.</p>";
    return;
  }

  wrap.innerHTML = "Loading product...";

  const { data, error } = await db
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    wrap.innerHTML = "<p>Failed to load product.</p>";
    console.error(error);
    return;
  }

  const p = data;

  wrap.innerHTML = `
    <div class="product-page">
      <div>
        <img src="${p.image || "https://via.placeholder.com/600x600?text=No+Image"}" alt="${p.name}">
      </div>
      <div class="product-meta">
        <span class="badge">${p.category || "Clothing"}</span>
        <h1>${p.name}</h1>
        <p class="price" style="font-size:20px;">₹${p.price}</p>
        <p>${p.description || ""}</p>
        <div class="chip-row">
          ${(p.sizes || "").split(",").filter(Boolean).map(s => `<span class="badge">${s.trim()}</span>`).join("")}
        </div>
        <button class="btn btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>
  `;
}

// ---------- CART PAGE ----------
async function loadCartPage() {
  const listWrap = document.getElementById("cartItems");
  const summaryWrap = document.getElementById("cartSummary");
  if (!listWrap || !summaryWrap) return;

  const cart = getCart();
  if (cart.length === 0) {
    listWrap.innerHTML = "<p>Your cart is empty.</p>";
    summaryWrap.innerHTML = "";
    return;
  }

  const ids = cart.map(item => item.product_id);
  const { data, error } = await db
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) {
    listWrap.innerHTML = "<p>Failed to load cart products.</p>";
    console.error(error);
    return;
  }

  // Join products with cart rows
  let total = 0;
  listWrap.innerHTML = "";
  cart.forEach(item => {
    const product = data.find(p => p.id === item.product_id);
    if (!product) return;

    const lineTotal = product.price * item.qty;
    total += lineTotal;

    listWrap.innerHTML += `
      <div class="cart-item">
        <img src="${product.image || "https://via.placeholder.com/80"}" alt="${product.name}">
        <div style="flex:1;">
          <h4 style="margin:0 0 4px;">${product.name}</h4>
          <p class="text-muted">Qty: ${item.qty}</p>
          <p>₹${product.price} × ${item.qty} = <strong>₹${lineTotal}</strong></p>
        </div>
      </div>
    `;
  });

  summaryWrap.innerHTML = `
    <div class="cart-summary">
      <h3>Order Summary</h3>
      <p>Total: <strong>₹${total}</strong></p>
      <p class="text-muted" style="margin-top:8px;">Enter your details to place order (no payment yet).</p>
      <input id="custName" placeholder="Your name">
      <input id="custPhone" placeholder="Phone number">
      <button class="btn btn-primary" style="margin-top:8px;" onclick="placeOrder()">Place Order</button>
      <p id="orderMsg" class="text-muted" style="margin-top:6px;"></p>
    </div>
  `;
}

async function placeOrder() {
  const nameEl = document.getElementById("custName");
  const phoneEl = document.getElementById("custPhone");
  const msgEl = document.getElementById("orderMsg");

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const cart = getCart();

  if (!name || !phone || cart.length === 0) {
    msgEl.textContent = "Please fill details and ensure cart is not empty.";
    msgEl.classList.add("text-danger");
    return;
  }

  // Recalculate total amount
  const ids = cart.map(item => item.product_id);
  const { data, error } = await db
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) {
    msgEl.textContent = "Failed to place order.";
    msgEl.classList.add("text-danger");
    console.error(error);
    return;
  }

  let total = 0;
  const lineItems = cart.map(item => {
    const product = data.find(p => p.id === item.product_id);
    if (!product) return null;
    const lineTotal = product.price * item.qty;
    total += lineTotal;
    return {
      product_id: product.id,
      name: product.name,
      price: product.price,
      qty: item.qty
    };
  }).filter(Boolean);

  const { error: insertError } = await db.from("orders").insert([
    {
      customer_name: name,
      phone: phone,
      total: total,
      status: "pending",
      items_json: JSON.stringify(lineItems)
    }
  ]);

  if (insertError) {
    msgEl.textContent = "Failed to place order.";
    msgEl.classList.add("text-danger");
    console.error(insertError);
    return;
  }

  // Clear cart
  saveCart([]);
  updateCartCount();
  msgEl.textContent = "Order placed! We'll contact you soon.";
  msgEl.classList.remove("text-danger");
  nameEl.value = "";
  phoneEl.value = "";
}

// On every page load, update cart count if header exists
document.addEventListener("DOMContentLoaded", updateCartCount);