import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await req.json(); // amount in rupees

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    try {
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // convert rupees to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });
        return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create Razorpay order";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
