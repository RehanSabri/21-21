import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// GET /api/admin/users — list all users (admin only)
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Use service client — can read all auth users + profiles
    const serviceClient = await createServiceClient();

    // Get all auth users
    const { data: authData, error: authError } = await serviceClient.auth.admin.listUsers();
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

    // Get all profiles for role/phone info
    const { data: profiles } = await serviceClient.from("profiles").select("id, role, phone");
    const profileMap = new Map((profiles ?? []).map((p: { id: string; role: string; phone?: string }) => [p.id, p]));

    const users = (authData.users ?? []).map((u) => {
        const prof = profileMap.get(u.id);
        return {
            id: u.id,
            name: u.user_metadata?.name ?? u.email?.split("@")[0] ?? "Unknown",
            role: prof?.role ?? "user",
            phone: prof?.phone ?? null,
            created_at: u.created_at,
        };
    });

    return NextResponse.json(users);
}
