// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function PUT(request, { params }) {
  const id = Number(params.id);
  const body = await request.json();
  const { name, price, color, size, tag, image_url } = body;

  const { data, error } = await supabaseAdmin
    .from("products")
    .update({ name, price, color, size, tag, image_url })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request, { params }) {
  const id = Number(params.id);

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}