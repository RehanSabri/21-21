"use client";

import React from "react";
import Link from "next/link";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

interface MiniCartProps {
    onClose: () => void;
}

export default function MiniCart({ onClose }: MiniCartProps) {
    const { items, removeItem, updateQty, subtotal } = useCart();

    return (
        <>
            <div className="overlay" onClick={onClose} />
            <div className="mini-cart">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-hm-border">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={20} />
                        <span className="font-semibold text-sm uppercase tracking-wider">
                            Shopping Bag ({items.length})
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:text-hm-red transition-colors"
                        aria-label="Close cart"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                            <ShoppingBag size={48} className="text-hm-border mb-4" />
                            <p className="font-semibold mb-2">Your bag is empty</p>
                            <p className="text-sm text-hm-gray mb-6">Start shopping to fill it up</p>
                            <button onClick={onClose} className="btn-primary text-xs">
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <div className="relative w-20 h-24 flex-shrink-0 bg-hm-light overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        sizes="80px"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-snug mb-1 line-clamp-2">{item.name}</p>
                                    <p className="text-xs text-hm-gray mb-1">
                                        {item.color} · {item.size}
                                    </p>
                                    <p className="text-sm font-semibold">₹{item.price.toLocaleString('en-IN')}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => updateQty(item.id, item.quantity - 1)}
                                            className="w-6 h-6 border border-hm-border flex items-center justify-center hover:border-hm-dark transition-colors"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQty(item.id, item.quantity + 1)}
                                            className="w-6 h-6 border border-hm-border flex items-center justify-center hover:border-hm-dark transition-colors"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-hm-gray hover:text-hm-red transition-colors self-start mt-1"
                                    aria-label={`Remove ${item.name}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-5 border-t border-hm-border space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-hm-gray">Subtotal</span>
                            <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-hm-gray">Delivery</span>
                            <span className="font-semibold text-green-600">
                                {subtotal >= 4000 ? "FREE" : "₹399"}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t border-hm-border pt-3">
                            <span>Total</span>
                            <span>₹{(subtotal + (subtotal >= 4000 ? 0 : 399)).toLocaleString('en-IN')}</span>
                        </div>
                        <Link href="/cart" onClick={onClose} className="btn-secondary w-full text-xs text-center block">
                            View Bag
                        </Link>
                        <Link href="/checkout" onClick={onClose} className="btn-primary w-full text-xs text-center block">
                            Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
