import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") return null;
    return user;
}

/** Map camelCase form fields → snake_case DB columns */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbRow(body: any) {
    return {
        name:           body.name,
        category:       body.category,
        subcategory:    body.subcategory ?? "",
        price:          body.price,
        original_price: body.originalPrice ?? body.original_price ?? null,
        description:    body.description ?? "",
        images:         body.images ?? [],
        colors:         body.colors ?? [],
        sizes:          body.sizes ?? [],
        details:        body.details ?? [],
        care:           body.care ?? [],
        tags:           body.tags ?? [],
        rating:         body.rating ?? 0,
        reviews:        body.reviews ?? 0,
        is_new:         body.isNew ?? body.is_new ?? false,
        is_sale:        body.isSale ?? body.is_sale ?? false,
        is_best_seller: body.isBestSeller ?? body.is_best_seller ?? false,
        stock:          body.stock ?? 100,
    };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
    if (error) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const row = toDbRow(body);
    const serviceClient = await createServiceClient();
    const { data, error } = await serviceClient.from("products").update(row).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const serviceClient = await createServiceClient();
    const { error } = await serviceClient.from("products").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
