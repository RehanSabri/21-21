"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    color: string;
    size: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "id">) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    updateQty: (id: string, qty: number) => Promise<void>;
    clearCart: () => Promise<void>;
    totalItems: number;
    subtotal: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

// ── Local storage helpers (guest cart) ──────────────────────
const LS_KEY = "2121_cart";

function getLocalCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function setLocalCart(items: CartItem[]) {
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(items));
}

// Convert DB row → CartItem
function dbRowToCartItem(row: {
    id: string;
    product_id: string;
    quantity: number;
    size: string;
    color: string;
    products: { name: string; price: number; images: string[] };
}): CartItem {
    return {
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        size: row.size,
        color: row.color,
        name: row.products?.name ?? "",
        price: row.products?.price ?? 0,
        image: row.products?.images?.[0] ?? "",
    };
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch cart from DB (authenticated) or localStorage (guest)
    const fetchCart = useCallback(async () => {
        setIsLoading(true);
        if (user) {
            const res = await fetch("/api/cart");
            if (res.ok) {
                const data = await res.json();
                setItems(Array.isArray(data) ? data.map(dbRowToCartItem) : []);
            }
        } else {
            setItems(getLocalCart());
        }
        setIsLoading(false);
    }, [user]);

    // On auth state change: merge local cart into DB, then refetch
    useEffect(() => {
        if (user) {
            const local = getLocalCart();
            if (local.length > 0) {
                // Merge local cart into DB, then clear local
                Promise.all(
                    local.map((item) =>
                        fetch("/api/cart", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                productId: item.productId,
                                quantity: item.quantity,
                                size: item.size,
                                color: item.color,
                            }),
                        })
                    )
                ).then(() => {
                    localStorage.removeItem(LS_KEY);
                    fetchCart();
                });
            } else {
                fetchCart();
            }
        } else {
            setItems(getLocalCart());
            setIsLoading(false);
        }
    }, [user, fetchCart]);

    const addItem = async (item: Omit<CartItem, "id">) => {
        if (user) {
            await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                }),
            });
            await fetchCart();
        } else {
            const local = getLocalCart();
            const existing = local.find(
                (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
            );
            const updated = existing
                ? local.map((i) => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i)
                : [...local, { ...item, id: `${item.productId}-${item.color}-${item.size}-${Date.now()}` }];
            setLocalCart(updated);
            setItems(updated);
        }
    };

    const removeItem = async (id: string) => {
        if (user) {
            await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
            await fetchCart();
        } else {
            const updated = items.filter((i) => i.id !== id);
            setLocalCart(updated);
            setItems(updated);
        }
    };

    const updateQty = async (id: string, qty: number) => {
        if (user) {
            await fetch("/api/cart", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, quantity: qty }),
            });
            await fetchCart();
        } else {
            if (qty <= 0) return removeItem(id);
            const updated = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
            setLocalCart(updated);
            setItems(updated);
        }
    };

    const clearCart = async () => {
        if (user) {
            await fetch("/api/cart?clear=true", { method: "DELETE" });
            setItems([]);
        } else {
            setLocalCart([]);
            setItems([]);
        }
    };

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal, isLoading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
