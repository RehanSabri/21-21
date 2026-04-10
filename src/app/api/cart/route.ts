import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json([], { status: 200 }); // guest — return empty

    const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, quantity, size, color } = await req.json();

    // Upsert: if same product+size+color exists, update quantity
    const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("size", size)
        .eq("color", color)
        .single();

    if (existing) {
        const { error } = await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + quantity })
            .eq("id", existing.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
        const { error } = await supabase
            .from("cart_items")
            .insert({ user_id: user.id, product_id: productId, quantity, size, color });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    const clear = req.nextUrl.searchParams.get("clear");

    if (clear === "true") {
        await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else if (id) {
        await supabase.from("cart_items").delete().eq("id", id).eq("user_id", user.id);
    }

    return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, quantity } = await req.json();
    if (quantity <= 0) {
        await supabase.from("cart_items").delete().eq("id", id).eq("user_id", user.id);
    } else {
        await supabase.from("cart_items").update({ quantity }).eq("id", id).eq("user_id", user.id);
    }
    return NextResponse.json({ success: true });
}
