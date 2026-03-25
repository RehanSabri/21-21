"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface WishlistContextType {
    wishlist: string[];
    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    isWishlisted: (productId: string) => boolean;
    toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const [wishlist, setWishlist] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("hm_wishlist");
        if (saved) setWishlist(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("hm_wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (id: string) =>
        setWishlist((prev) => (prev.includes(id) ? prev : [...prev, id]));

    const removeFromWishlist = (id: string) =>
        setWishlist((prev) => prev.filter((i) => i !== id));

    const isWishlisted = (id: string) => wishlist.includes(id);

    const toggleWishlist = (id: string) =>
        isWishlisted(id) ? removeFromWishlist(id) : addToWishlist(id);

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
