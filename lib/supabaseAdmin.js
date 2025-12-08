// lib/supabaseAdmin.js
import { createClient } from "@supabase/supabase-js";

/**
 * IMPORTANT:
 * This client uses the SERVICE ROLE key.
 * Only import this file in SERVER code (API routes, server components).
 * Never in a "use client" component.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
