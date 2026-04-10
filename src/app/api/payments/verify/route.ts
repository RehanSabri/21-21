import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        // Order details to save after verification
        items,
        shippingMethod,
        subtotal,
        deliveryFee,
        total,
        address,
    } = await req.json();

    // 1. Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // 2. Create order in DB
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            user_id: user.id,
            shipping_method: shippingMethod,
            subtotal,
            delivery_fee: deliveryFee,
            total,
            address_snapshot: address,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            payment_status: "paid",
            status: "Processing",
        })
        .select()
        .single();

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

    // 3. Create order items
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

    await supabase.from("order_items").insert(orderItems);

    // 4. Clear the user's cart
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    return NextResponse.json({ success: true, orderId: order.id });
}
