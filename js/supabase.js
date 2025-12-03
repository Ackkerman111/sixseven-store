// js/supabase.js
// Load AFTER the Supabase CDN in each HTML file.

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// This creates the client we use everywhere
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);