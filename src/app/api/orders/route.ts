import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
        items,
        shippingMethod,
        subtotal,
        deliveryFee,
        total,
        address,
        razorpayOrderId,
        razorpayPaymentId,
    } = body;

    // Create the order
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            user_id: user.id,
            shipping_method: shippingMethod,
            subtotal,
            delivery_fee: deliveryFee,
            total,
            address_snapshot: address,
            razorpay_order_id: razorpayOrderId ?? null,
            razorpay_payment_id: razorpayPaymentId ?? null,
            payment_status: razorpayPaymentId ? "paid" : "pending",
            status: "Processing",
        })
        .select()
        .single();

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

    // Create order items
    const orderItems = items.map((item: {
        productId: string;
        name: string;
        image: string;
        price: number;
        quantity: number;
        size: string;
        color: string;
    }) => ({
        order_id: order.id,
        product_id: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

    return NextResponse.json(order, { status: 201 });
}
