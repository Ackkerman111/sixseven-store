// js/auth.js

// Simple admin login using "admins" table
async function loginAdmin() {
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const errEl = document.getElementById("errorMsg");

  const email = emailEl.value.trim();
  const password = passEl.value.trim();

  errEl.textContent = "";

  if (!email || !password) {
    errEl.textContent = "Please enter email and password.";
    return;
  }

  const { data, error } = await db
    .from("admins")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .maybeSingle();

  if (error || !data) {
    errEl.textContent = "Invalid credentials.";
    return;
  }

  // Store simple flag in localStorage
  localStorage.setItem("adminLogged", "yes");
  window.location.href = "admin-dashboard.html";
}

// Check admin is logged in; use in admin pages
function checkAdmin() {
  const ok = localStorage.getItem("adminLogged") === "yes";
  if (!ok) {
    window.location.href = "admin-login.html";
  }
}

function logoutAdmin() {
  localStorage.removeItem("adminLogged");
  window.location.href = "admin-login.html";
}