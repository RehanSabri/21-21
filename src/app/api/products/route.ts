import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** Map camelCase product fields → snake_case DB columns */
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

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const category = req.nextUrl.searchParams.get("category");
    const search = req.nextUrl.searchParams.get("search");

    let query = supabase.from("products").select("*").order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (search) {
        const q = `%${search}%`;
        query = query.or(`name.ilike.${q},description.ilike.${q}`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const row = { id: `prod_${Date.now()}`, ...toDbRow(body) };
    const serviceClient = await createServiceClient();
    const { data, error } = await serviceClient.from("products").insert(row).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
