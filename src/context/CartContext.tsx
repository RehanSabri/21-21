"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
    addItem: (item: Omit<CartItem, "id">) => void;
    removeItem: (id: string) => void;
    updateQty: (id: string, qty: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("hm_cart");
        if (saved) setItems(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("hm_cart", JSON.stringify(items));
    }, [items]);

    const addItem = (item: Omit<CartItem, "id">) => {
        setItems((prev) => {
            const existing = prev.find(
                (i) =>
                    i.productId === item.productId &&
                    i.color === item.color &&
                    i.size === item.size
            );
            if (existing) {
                return prev.map((i) =>
                    i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prev, { ...item, id: `${item.productId}-${item.color}-${item.size}-${Date.now()}` }];
        });
    };

    const removeItem = (id: string) =>
        setItems((prev) => prev.filter((i) => i.id !== id));

    const updateQty = (id: string, qty: number) => {
        if (qty <= 0) return removeItem(id);
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
