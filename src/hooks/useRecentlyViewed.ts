"use client";

import { useState, useEffect } from "react";
import { Product, getProductById } from "@/data/products";

const STORAGE_KEY = "2121_recently_viewed";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const ids = JSON.parse(stored) as string[];
                const products = ids
                    .map(id => getProductById(id))
                    .filter(Boolean) as Product[];
                setRecentlyViewed(products);
            }
        } catch (e) {
            console.error("Failed to load recently viewed", e);
        }
    }, []);

    const addViewedProduct = (productId: string) => {
        setRecentlyViewed(prev => {
            const currentIds = prev.map(p => p.id);
            if (currentIds[0] === productId) return prev; // Already newest

            const newIds = [
                productId,
                ...currentIds.filter(id => id !== productId)
            ].slice(0, MAX_ITEMS);

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
            } catch (e) {
                console.error("Failed to save recently viewed", e);
            }

            const products = newIds
                .map(id => getProductById(id))
                .filter(Boolean) as Product[];
            return products;
        });
    };

    return { recentlyViewed, addViewedProduct };
}
