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
    const [orderNumber] = useState(
        `HM${Math.floor(Math.random() * 900000) + 100000}`
    );

    const [addressForm, setAddressForm] = useState({
        firstName: "",
        lastName: "",
        line1: "",
        line2: "",
        city: "",
        postcode: "",
        country: "United Kingdom",
        phone: "",
    });

    const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
    const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
    const [cardForm, setCardForm] = useState({
        name: "",
        number: "",
        expiry: "",
        cvc: "",
    });

    const delivery = shippingMethod === "express" ? 5.99 : subtotal >= 40 ? 0 : 3.99;
    const total = subtotal + delivery;

    const stepIdx = STEPS.findIndex((s) => s.id === step);

    const nextStep = () => {
        const steps: Step[] = ["address", "shipping", "payment", "confirmation"];
        const next = steps[steps.indexOf(step) + 1];
        if (next) setStep(next);
    };

    const placeOrder = () => {
        // Save the order to localStorage before clearing the cart
        const newOrder = {
            id: orderNumber,
            userId: user?.id ?? "guest",
            date: new Date().toISOString().split("T")[0],
            status: "Processing",
            total: parseFloat(total.toFixed(2)),
            shippingMethod,
            address: `${addressForm.line1}, ${addressForm.city}, ${addressForm.postcode}`,
            items: items.map((item) => ({
                id: item.id,
                productId: item.productId,
                name: item.name,
                image: item.image,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        if (typeof window !== "undefined") {
            try {
                const existing = JSON.parse(localStorage.getItem("hm_orders") || "[]");
                localStorage.setItem("hm_orders", JSON.stringify([newOrder, ...existing]));
            } catch {
                // ignore storage errors
            }
        }

        clearCart();
        setStep("confirmation");
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
                                        <option>United Kingdom</option>
                                        <option>United States</option>
                                        <option>Germany</option>
                                        <option>France</option>
                                        <option>India</option>
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
                                        {subtotal >= 40 ? <span className="text-green-600">FREE</span> : "£3.99"}
                                    </span>
                                </label>
                                <label className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${shippingMethod === "express" ? "border-hm-dark" : "border-hm-border hover:border-hm-gray"}`}>
                                    <input type="radio" name="shipping" value="express" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} className="accent-hm-dark" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">Express Delivery</p>
                                        <p className="text-xs text-hm-gray">1–2 business days</p>
                                    </div>
                                    <span className="font-semibold text-sm">£5.99</span>
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
                            <h2 className="text-xl font-bold mb-6">Payment</h2>
                            <div className="flex gap-3 mb-6">
                                <button onClick={() => setPaymentMethod("card")} className={`flex-1 py-3 text-sm font-medium border-2 transition-colors ${paymentMethod === "card" ? "border-hm-dark" : "border-hm-border"}`}>
                                    💳 Credit / Debit Card
                                </button>
                                <button onClick={() => setPaymentMethod("paypal")} className={`flex-1 py-3 text-sm font-medium border-2 transition-colors ${paymentMethod === "paypal" ? "border-hm-dark" : "border-hm-border"}`}>
                                    🅿 PayPal
                                </button>
                            </div>

                            {paymentMethod === "card" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block" htmlFor="cardName">Name on Card *</label>
                                        <input id="cardName" className="input-field" placeholder="Jane Doe" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block" htmlFor="cardNumber">Card Number *</label>
                                        <input id="cardNumber" className="input-field" placeholder="1234 5678 9012 3456" maxLength={19} value={cardForm.number} onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                                            const formatted = v.replace(/(\d{4})(?=\d)/g, "$1 ");
                                            setCardForm({ ...cardForm, number: formatted });
                                        }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block" htmlFor="cardExpiry">Expiry Date *</label>
                                            <input id="cardExpiry" className="input-field" placeholder="MM/YY" maxLength={5} value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block" htmlFor="cardCvc">CVC *</label>
                                            <input id="cardCvc" className="input-field" placeholder="123" maxLength={3} value={cardForm.cvc} onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === "paypal" && (
                                <div className="bg-[#FFC439]/20 border-2 border-[#FFC439] p-6 text-center rounded">
                                    <p className="font-semibold mb-2">You will be redirected to PayPal</p>
                                    <p className="text-sm text-hm-gray">Complete your payment securely through PayPal.</p>
                                </div>
                            )}

                            <p className="flex items-center gap-2 text-xs text-hm-gray mt-4">
                                <Lock size={12} /> Your payment information is encrypted and secure.
                            </p>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setStep("shipping")} className="btn-secondary text-sm">Back</button>
                                <button
                                    onClick={placeOrder}
                                    className="btn-red gap-2 text-sm"
                                    disabled={paymentMethod === "card" && (!cardForm.name || !cardForm.number || !cardForm.expiry || !cardForm.cvc)}
                                >
                                    Place Order · £{total.toFixed(2)}
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
                                Thank you for your purchase. Your order number is:
                            </p>
                            <p className="text-2xl font-mono font-bold text-hm-red mb-6">
                                {orderNumber}
                            </p>
                            <p className="text-sm text-hm-gray mb-8 max-w-sm mx-auto">
                                You'll receive an email confirmation shortly. Your items will be delivered within{" "}
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
                                        <span className="text-xs font-semibold flex-shrink-0">£{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-hm-border pt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-hm-gray">Subtotal</span>
                                    <span>£{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-hm-gray">Delivery</span>
                                    <span className={delivery === 0 ? "text-green-600" : ""}>
                                        {delivery === 0 ? "FREE" : `£${delivery.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-base pt-2 border-t border-hm-border">
                                    <span>Total</span>
                                    <span>£{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
