"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { products as staticProducts, Product } from "@/data/products";

const STORAGE_KEY = "hm_custom_products";

interface ProductsContextType {
    products: Product[];
    isHydrated: boolean;
    addProduct: (p: Omit<Product, "id">) => void;
    updateProduct: (id: string, p: Omit<Product, "id">) => void;
    deleteProduct: (id: string) => void;
    getProductById: (id: string) => Product | undefined;
    getProductsByCategory: (category: string) => Product[];
    getRelatedProducts: (product: Product, limit?: number) => Product[];
    searchProducts: (query: string) => Product[];
}

const ProductsContext = createContext<ProductsContextType | null>(null);

function loadCustomProducts(): Product[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function mergeProducts(customProducts: Product[]): Product[] {
    // Custom products override static ones with the same ID; new custom additions are appended
    const customIds = new Set(customProducts.map((p) => p.id));
    const filteredStatic = staticProducts.filter((p) => !customIds.has(p.id));
    return [...filteredStatic, ...customProducts];
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
    const [customProducts, setCustomProducts] = useState<Product[]>([]);
    const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setCustomProducts(loadCustomProducts());
        const deletedKey = "hm_deleted_products";
        try {
            const raw = localStorage.getItem(deletedKey);
            if (raw) setDeletedProductIds(JSON.parse(raw));
        } catch {}
        setIsHydrated(true);

        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                try {
                    setCustomProducts(e.newValue ? JSON.parse(e.newValue) : []);
                } catch {}
            }
            if (e.key === deletedKey) {
                try {
                    setDeletedProductIds(e.newValue ? JSON.parse(e.newValue) : []);
                } catch {}
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const saveCustomProducts = useCallback((updated: Product[]) => {
        setCustomProducts(updated);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
    }, []);

    const allProducts = isHydrated ? mergeProducts(customProducts) : staticProducts;

    const addProduct = useCallback(
        (data: Omit<Product, "id">) => {
            const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            const newProduct: Product = { ...data, id };
            saveCustomProducts([...customProducts, newProduct]);
        },
        [customProducts, saveCustomProducts]
    );

    const updateProduct = useCallback(
        (id: string, data: Omit<Product, "id">) => {
            const updated = { ...data, id };
            // Check if it's a custom product
            const existingCustom = customProducts.find((p) => p.id === id);
            if (existingCustom) {
                saveCustomProducts(customProducts.map((p) => (p.id === id ? updated : p)));
            } else {
                // It's a static product — add an override in customProducts
                saveCustomProducts([...customProducts, updated]);
            }
        },
        [customProducts, saveCustomProducts]
    );

    const deleteProduct = useCallback(
        (id: string) => {
            const existingCustom = customProducts.find((p) => p.id === id);
            if (existingCustom) {
                // Remove from custom list
                saveCustomProducts(customProducts.filter((p) => p.id !== id));
            } else {
                // It's a static product — add a tombstone (store with a __deleted flag)
                // We use a simpler approach: store the id in a separate deleted set
                if (!deletedProductIds.includes(id)) {
                    const newDeleted = [...deletedProductIds, id];
                    localStorage.setItem("hm_deleted_products", JSON.stringify(newDeleted));
                    setDeletedProductIds(newDeleted);
                }
            }
        },
        [customProducts, saveCustomProducts, deletedProductIds]
    );

    // Build final list respecting deletions of static products
    const getFinalProducts = (): Product[] => {
        if (!isHydrated) return staticProducts;
        const merged = mergeProducts(customProducts);
        return merged.filter((p) => !deletedProductIds.includes(p.id));
    };

    const finalProducts = getFinalProducts();

    const getProductById = useCallback(
        (id: string) => finalProducts.find((p) => p.id === id),
        [finalProducts]
    );

    const getProductsByCategory = useCallback(
        (category: string) => finalProducts.filter((p) => p.category === category),
        [finalProducts]
    );

    const getRelatedProducts = useCallback(
        (product: Product, limit = 4) =>
            finalProducts
                .filter((p) => p.category === product.category && p.id !== product.id)
                .slice(0, limit),
        [finalProducts]
    );

    const searchProducts = useCallback(
        (query: string) => {
            const q = query.toLowerCase();
            return finalProducts.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.tags.some((t) => t.includes(q)) ||
                    p.category.includes(q)
            );
        },
        [finalProducts]
    );

    return (
        <ProductsContext.Provider
            value={{
                products: finalProducts,
                isHydrated,
                addProduct,
                updateProduct,
                deleteProduct,
                getProductById,
                getProductsByCategory,
                getRelatedProducts,
                searchProducts,
            }}
        >
            {children}
        </ProductsContext.Provider>
    );
}

export function useProducts() {
    const ctx = useContext(ProductsContext);
    if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
    return ctx;
}
