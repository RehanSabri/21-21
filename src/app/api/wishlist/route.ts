import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json([]);

    const { data, error } = await supabase
        .from("wishlist_items")
        .select("*, products(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = await req.json();
    const { error } = await supabase
        .from("wishlist_items")
        .upsert({ user_id: user.id, product_id: productId }, { onConflict: "user_id,product_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

    return NextResponse.json({ success: true });
}
