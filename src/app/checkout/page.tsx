"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    Check,
    CreditCard,
    MapPin,
    Truck,
    Package,
    ChevronRight,
    Lock,
} from "lucide-react";

// Extend the global window for the Razorpay script
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

type Step = "address" | "shipping" | "payment" | "confirmation";

const STEPS: { id: Step; label: string; Icon: React.ElementType }[] = [
    { id: "address", label: "Address", Icon: MapPin },
    { id: "shipping", label: "Shipping", Icon: Truck },
    { id: "payment", label: "Payment", Icon: CreditCard },
    { id: "confirmation", label: "Confirm", Icon: Package },
];

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState<Step>("address");
    const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [payError, setPayError] = useState<string | null>(null);

    const [addressForm, setAddressForm] = useState({
        firstName: "",
        lastName: "",
        line1: "",
        line2: "",
        city: "",
        postcode: "",
        country: "India",
        phone: "",
    });

    const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

    const delivery = shippingMethod === "express" ? 599 : subtotal >= 4000 ? 0 : 399;
    const total = subtotal + delivery;

    const stepIdx = STEPS.findIndex((s) => s.id === step);
    const nextStep = () => {
        const steps: Step[] = ["address", "shipping", "payment", "confirmation"];
        const next = steps[steps.indexOf(step) + 1];
        if (next) setStep(next);
    };

    const loadRazorpayScript = (): Promise<boolean> =>
        new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handlePayment = async () => {
        setProcessing(true);
        setPayError(null);

        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const hasRazorpay = razorpayKey && !razorpayKey.startsWith("rzp_test_xxx");

        try {
            if (hasRazorpay) {
                // ── Real Razorpay flow ──────────────────────────────
                const loaded = await loadRazorpayScript();
                if (!loaded) throw new Error("Could not load Razorpay. Please check your connection.");

                const orderRes = await fetch("/api/payments/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: total }),
                });
                const orderData = await orderRes.json();
                if (!orderRes.ok) throw new Error(orderData.error || "Failed to create payment order");

                await new Promise<void>((resolve, reject) => {
                    const rzp = new window.Razorpay({
                        key: razorpayKey,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: "H&M Clone",
                        description: `Order – ${items.length} item(s)`,
                        order_id: orderData.orderId,
                        prefill: {
                            name: `${addressForm.firstName} ${addressForm.lastName}`,
                            email: user?.email ?? "",
                            contact: addressForm.phone,
                        },
                        theme: { color: "#222222" },
                        handler: async (response: {
                            razorpay_order_id: string;
                            razorpay_payment_id: string;
                            razorpay_signature: string;
                        }) => {
                            try {
                                const verifyRes = await fetch("/api/payments/verify", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        razorpayOrderId: response.razorpay_order_id,
                                        razorpayPaymentId: response.razorpay_payment_id,
                                        razorpaySignature: response.razorpay_signature,
                                        items: items.map((item) => ({
                                            productId: item.productId,
                                            name: item.name,
                                            image: item.image,
                                            price: item.price,
                                            quantity: item.quantity,
                                            size: item.size,
                                            color: item.color,
                                        })),
                                        shippingMethod,
                                        subtotal,
                                        deliveryFee: delivery,
                                        total,
                                        address: addressForm,
                                    }),
                                });
                                const verifyData = await verifyRes.json();
                                if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
                                await clearCart();
                                setConfirmedOrderId(verifyData.orderId);
                                setStep("confirmation");
                                resolve();
                            } catch (err) {
                                reject(err);
                            }
                        },
                        modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
                    });
                    rzp.open();
                });
            } else {
                // ── Fallback: save order directly (no payment) ──────
                const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        items: items.map((item) => ({
                            productId: item.productId,
                            name: item.name,
                            image: item.image,
                            price: item.price,
                            quantity: item.quantity,
                            size: item.size,
                            color: item.color,
                        })),
                        shippingMethod,
                        subtotal,
                        deliveryFee: delivery,
                        total,
                        address: addressForm,
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to place order");
                await clearCart();
                setConfirmedOrderId(data.id);
                setStep("confirmation");
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Payment failed";
            if (msg !== "Payment cancelled") setPayError(msg);
        } finally {
            setProcessing(false);
        }
    };

    if (items.length === 0 && step !== "confirmation") {
        return (
            <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
                <p className="text-hm-gray mb-4">Your bag is empty.</p>
                <Link href="/" className="btn-primary text-sm">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1100px] mx-auto px-4 py-8">
            {/* Stepper */}
            <div className="stepper mb-10" aria-label="Checkout steps">
                {STEPS.map((s, idx) => {
                    const isCompleted = idx < stepIdx;
                    const isActive = idx === stepIdx;
                    return (
                        <React.Fragment key={s.id}>
                            <div className={`stepper-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}>
                                <div className="stepper-circle">
                                    {isCompleted ? <Check size={12} /> : idx + 1}
                                </div>
                                <span className="hidden sm:inline">{s.label}</span>
                            </div>
                            {idx < STEPS.length - 1 && <div className="stepper-line" />}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Area */}
                <div className="lg:col-span-2">

                    {/* Step 1: Address */}
                    {step === "address" && (
                        <div className="animate-fadeIn">
                            <h2 className="text-xl font-bold mb-6">Delivery Address</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block" htmlFor="firstName">First Name *</label>
                                    <input id="firstName" className="input-field" value={addressForm.firstName} onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block" htmlFor="lastName">Last Name *</label>
                                    <input id="lastName" className="input-field" value={addressForm.lastName} onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block" htmlFor="line1">Address Line 1 *</label>
                                    <input id="line1" className="input-field" value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block" htmlFor="line2">Address Line 2</label>
                                    <input id="line2" className="input-field" value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block" htmlFor="city">City *</label>
                                    <input id="city" className="input-field" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block" htmlFor="postcode">Postcode *</label>
                                    <input id="postcode" className="input-field" value={addressForm.postcode} onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block" htmlFor="country">Country</label>
                                    <select id="country" className="input-field" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}>
                                        <option>India</option>
                                        <option>United Kingdom</option>
                                        <option>United States</option>
                                        <option>Germany</option>
                                        <option>France</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block" htmlFor="phone">Phone Number</label>
                                    <input id="phone" type="tel" className="input-field" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
                                </div>
                            </div>
                            <button
                                onClick={nextStep}
                                disabled={!addressForm.firstName || !addressForm.line1 || !addressForm.city || !addressForm.postcode}
                                className="btn-primary mt-6 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue to Shipping <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Shipping */}
                    {step === "shipping" && (
                        <div className="animate-fadeIn">
                            <h2 className="text-xl font-bold mb-6">Shipping Method</h2>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${shippingMethod === "standard" ? "border-hm-dark" : "border-hm-border hover:border-hm-gray"}`}>
                                    <input type="radio" name="shipping" value="standard" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")} className="accent-hm-dark" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">Standard Delivery</p>
                                        <p className="text-xs text-hm-gray">3–5 business days</p>
                                    </div>
                                    <span className="font-semibold text-sm">
                                        {subtotal >= 4000 ? <span className="text-green-600">FREE</span> : "₹399"}
                                    </span>
                                </label>
                                <label className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${shippingMethod === "express" ? "border-hm-dark" : "border-hm-border hover:border-hm-gray"}`}>
                                    <input type="radio" name="shipping" value="express" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} className="accent-hm-dark" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">Express Delivery</p>
                                        <p className="text-xs text-hm-gray">1–2 business days</p>
                                    </div>
                                    <span className="font-semibold text-sm">₹599</span>
                                </label>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setStep("address")} className="btn-secondary text-sm">Back</button>
                                <button onClick={nextStep} className="btn-primary gap-2 text-sm">
                                    Continue to Payment <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step === "payment" && (
                        <div className="animate-fadeIn">
                            <h2 className="text-xl font-bold mb-6">Review & Place Order</h2>
                            <div className="border-2 border-hm-border p-6 mb-6 bg-hm-light">
                                {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith("rzp_test_xxx") ? (
                                    <>
                                        <p className="font-semibold mb-2">Secure Checkout via Razorpay</p>
                                        <p className="text-sm text-hm-gray mb-4">
                                            Supports UPI, Credit/Debit Cards, Net Banking, Wallets &amp; EMI.
                                        </p>
                                        <div className="flex gap-2 flex-wrap text-xs text-hm-gray">
                                            {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "Wallets"].map((m) => (
                                                <span key={m} className="border border-hm-border px-2 py-1 rounded">{m}</span>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold mb-2">Review your order</p>
                                        <p className="text-sm text-hm-gray">
                                            Click &ldquo;Place Order&rdquo; to confirm. Payment integration will be added soon.
                                        </p>
                                    </>
                                )}
                            </div>

                            {payError && (
                                <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded">
                                    {payError}
                                </p>
                            )}

                            <p className="flex items-center gap-2 text-xs text-hm-gray mb-6">
                                <Lock size={12} /> Your payment information is encrypted and secure.
                            </p>

                            <div className="flex gap-3">
                                <button onClick={() => setStep("shipping")} className="btn-secondary text-sm" disabled={processing}>Back</button>
                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="btn-red gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {processing ? "Processing…" : (
                                        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith("rzp_test_xxx")
                                            ? `Pay ₹${total.toLocaleString("en-IN")} via Razorpay`
                                            : `Place Order — ₹${total.toLocaleString("en-IN")}`
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === "confirmation" && (
                        <div className="animate-fadeIn text-center py-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={36} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                            <p className="text-hm-gray mb-4">
                                Thank you for your purchase. Your order has been received.
                            </p>
                            {confirmedOrderId && (
                                <p className="text-sm font-mono font-bold text-hm-red mb-6 break-all">
                                    Order ID: {confirmedOrderId}
                                </p>
                            )}
                            <p className="text-sm text-hm-gray mb-8 max-w-sm mx-auto">
                                You can track your order in your account. Your items will be delivered within{" "}
                                {shippingMethod === "express" ? "1–2" : "3–5"} business days.
                            </p>
                            <div className="flex justify-center gap-3">
                                <Link href="/" className="btn-primary text-sm">Continue Shopping</Link>
                                <Link href="/account?tab=orders" className="btn-secondary text-sm">View Orders</Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                {step !== "confirmation" && (
                    <div className="order-last lg:order-none">
                        <div className="border border-hm-border p-5 sticky top-24">
                            <h2 className="font-bold mb-4">Your Order ({items.length} items)</h2>
                            <div className="space-y-3 mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-2 text-sm">
                                        <div className="relative w-12 h-14 flex-shrink-0 bg-hm-light overflow-hidden">
                                            <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-xs leading-snug line-clamp-2">{item.name}</p>
                                            <p className="text-xs text-hm-gray">{item.size} · x{item.quantity}</p>
                                        </div>
                                        <span className="text-xs font-semibold flex-shrink-0">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-hm-border pt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-hm-gray">Subtotal</span>
                                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-hm-gray">Delivery</span>
                                    <span className={delivery === 0 ? "text-green-600" : ""}>
                                        {delivery === 0 ? "FREE" : `₹${delivery.toLocaleString("en-IN")}`}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-base pt-2 border-t border-hm-border">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
