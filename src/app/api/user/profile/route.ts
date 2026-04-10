import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const updates: Record<string, string> = {};
    if (body.name) updates.name = body.name;
    if (body.phone !== undefined) updates.phone = body.phone;

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
