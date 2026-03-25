"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    ArrowLeft,
    Lock,
    Tag,
    X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const PROMO_CODES: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {
    SAVE10: { type: "percent", value: 10, label: "10% off" },
    WELCOME: { type: "fixed", value: 5, label: "£5 off" },
    HNM20: { type: "percent", value: 20, label: "20% off" },
};

export default function CartPage() {
    const { items, removeItem, updateQty, subtotal, clearCart } = useCart();
    const [promoInput, setPromoInput] = useState("");
    const [appliedPromo, setAppliedPromo] = useState<null | { code: string; type: "percent" | "fixed"; value: number; label: string }>(null);
    const [promoError, setPromoError] = useState("");

    const applyPromo = () => {
        const code = promoInput.trim().toUpperCase();
        const promo = PROMO_CODES[code];
        if (promo) {
            setAppliedPromo({ code, ...promo });
            setPromoError("");
            setPromoInput("");
        } else {
            setPromoError("Invalid promo code. Try SAVE10, WELCOME, or HNM20.");
        }
    };

    const removePromo = () => {
        setAppliedPromo(null);
        setPromoError("");
    };

    const discount = appliedPromo
        ? appliedPromo.type === "percent"
            ? parseFloat((subtotal * (appliedPromo.value / 100)).toFixed(2))
            : Math.min(appliedPromo.value, subtotal)
        : 0;

    const delivery = subtotal - discount >= 40 ? 0 : 3.99;
    const total = subtotal - discount + delivery;

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Shopping Bag</h1>

            {items.length === 0 ? (
                <div className="text-center py-20">
                    <ShoppingBag size={56} className="mx-auto mb-4 text-hm-border" />
                    <h2 className="text-xl font-semibold mb-2">Your bag is empty</h2>
                    <p className="text-hm-gray mb-8">
                        Looks like you haven't added anything yet.
                    </p>
                    <Link href="/" className="btn-primary text-sm">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 py-4 border-b border-hm-border animate-fadeIn"
                            >
                                <Link href={`/${item.productId.slice(0, 1) === 'w' ? 'women' : item.productId.slice(0, 1) === 'm' ? 'men' : item.productId.slice(0, 1) === 'k' ? 'kids' : 'home'}/${item.productId}`} className="relative w-24 h-32 flex-shrink-0 bg-hm-light overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        sizes="96px"
                                    />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm leading-snug mb-1">{item.name}</h3>
                                    <p className="text-xs text-hm-gray mb-3">
                                        Colour: {item.color} · Size: {item.size}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center border border-hm-border">
                                            <button
                                                onClick={() => updateQty(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-hm-light transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQty(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-hm-light transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <p className="font-semibold">
                                            £{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-hm-gray hover:text-hm-red transition-colors self-start"
                                    aria-label={`Remove ${item.name}`}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <div className="flex justify-between pt-2">
                            <Link href="/" className="flex items-center gap-2 text-sm text-hm-gray hover:text-hm-dark transition-colors">
                                <ArrowLeft size={14} /> Continue Shopping
                            </Link>
                            <button onClick={clearCart} className="text-sm text-hm-gray hover:text-hm-red transition-colors">
                                Clear Bag
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="border border-hm-border p-6 sticky top-24">
                            <h2 className="font-bold text-lg mb-5">Order Summary</h2>
                            <div className="space-y-3 mb-5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-hm-gray">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                    <span>£{subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="flex items-center gap-1">
                                            <Tag size={12} /> Discount ({appliedPromo?.label})
                                        </span>
                                        <span className="font-medium">-£{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-hm-gray">Delivery</span>
                                    <span className={delivery === 0 ? "text-green-600 font-medium" : ""}>
                                        {delivery === 0 ? "FREE" : `£${delivery.toFixed(2)}`}
                                    </span>
                                </div>
                                {delivery > 0 && (
                                    <p className="text-xs text-hm-gray bg-hm-light p-2">
                                        Add £{(40 - (subtotal - discount)).toFixed(2)} more for free delivery
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-4 border-t border-hm-border mb-6">
                                <span>Total</span>
                                <span>£{total.toFixed(2)}</span>
                            </div>

                            {/* Promo Code */}
                            {appliedPromo ? (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 mb-5 animate-fadeIn">
                                    <div className="flex items-center gap-2 text-green-700 text-sm">
                                        <Tag size={14} />
                                        <span className="font-semibold">{appliedPromo.code}</span>
                                        <span className="text-xs text-green-600">({appliedPromo.label})</span>
                                    </div>
                                    <button onClick={removePromo} className="text-green-600 hover:text-green-800 transition-colors" aria-label="Remove promo code">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-5">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Promo code"
                                            className="input-field text-xs py-2"
                                            aria-label="Enter promo code"
                                            value={promoInput}
                                            onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                                            onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                                        />
                                        <button onClick={applyPromo} className="btn-secondary text-xs px-3 py-2 whitespace-nowrap">Apply</button>
                                    </div>
                                    {promoError && (
                                        <p className="text-xs text-hm-red mt-2 animate-fadeIn">{promoError}</p>
                                    )}
                                </div>
                            )}

                            <Link href="/checkout" className="btn-primary w-full gap-2 py-4 text-sm text-center block">
                                <Lock size={14} className="inline mr-1" />
                                Secure Checkout
                            </Link>
                            <p className="text-xs text-hm-gray text-center mt-3">
                                Taxes and final shipping calculated at checkout
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
