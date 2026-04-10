"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface WishlistContextType {
    wishlist: string[];
    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    isWishlisted: (productId: string) => boolean;
    toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const LS_KEY = "hm_wishlist";
function getLocal(): string[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function setLocal(ids: string[]) {
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<string[]>([]);

    const fetchWishlist = useCallback(async () => {
        if (user) {
            const res = await fetch("/api/wishlist");
            if (res.ok) {
                const data = await res.json();
                setWishlist(Array.isArray(data) ? data.map((row: { product_id: string }) => row.product_id) : []);
            }
        } else {
            setWishlist(getLocal());
        }
    }, [user]);

    useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

    const addToWishlist = async (productId: string) => {
        if (user) {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
            });
            setWishlist((prev) => prev.includes(productId) ? prev : [...prev, productId]);
        } else {
            const updated = wishlist.includes(productId) ? wishlist : [...wishlist, productId];
            setLocal(updated);
            setWishlist(updated);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (user) {
            await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
            setWishlist((prev) => prev.filter((id) => id !== productId));
        } else {
            const updated = wishlist.filter((id) => id !== productId);
            setLocal(updated);
            setWishlist(updated);
        }
    };

    const isWishlisted = (productId: string) => wishlist.includes(productId);
    const toggleWishlist = (productId: string) =>
        isWishlisted(productId) ? removeFromWishlist(productId) : addToWishlist(productId);

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
};
