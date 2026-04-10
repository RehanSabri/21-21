"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Product {
    id: string;
    name: string;
    category: "women" | "men" | "kids" | "home";
    subcategory: string;
    price: number;
    original_price?: number;
    originalPrice?: number; // alias kept for template compatibility
    images: string[];
    colors: { name: string; hex: string }[];
    sizes: string[];
    description: string;
    details: string[];
    care: string[];
    tags: string[];
    rating: number;
    reviews: number;
    is_new?: boolean;
    is_sale?: boolean;
    is_best_seller?: boolean;
    isNew?: boolean;
    isSale?: boolean;
    isBestSeller?: boolean;
    stock?: number;
}

// Normalise DB snake_case → camelCase consumed by existing templates
function normalise(p: Product): Product {
    return {
        ...p,
        originalPrice: p.original_price ?? p.originalPrice,
        isNew: p.is_new ?? p.isNew,
        isSale: p.is_sale ?? p.isSale,
        isBestSeller: p.is_best_seller ?? p.isBestSeller,
    };
}

interface ProductsContextType {
    products: Product[];
    isHydrated: boolean;
    addProduct: (p: Omit<Product, "id">) => Promise<{ ok: boolean; error?: string }>;
    updateProduct: (id: string, p: Omit<Product, "id">) => Promise<{ ok: boolean; error?: string }>;
    deleteProduct: (id: string) => Promise<{ ok: boolean; error?: string }>;
    getProductById: (id: string) => Product | undefined;
    getProductsByCategory: (category: string) => Product[];
    getRelatedProducts: (product: Product, limit?: number) => Product[];
    searchProducts: (query: string) => Product[];
    uploadImage: (file: File) => Promise<string>;
    refetch: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(Array.isArray(data) ? data.map(normalise) : []);
        } catch {
            setProducts([]);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const addProduct = async (data: Omit<Product, "id">): Promise<{ ok: boolean; error?: string }> => {
        const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) { await fetchProducts(); return { ok: true }; }
        const json = await res.json().catch(() => ({}));
        return { ok: false, error: json.error ?? "Failed to add product" };
    };

    const updateProduct = async (id: string, data: Omit<Product, "id">): Promise<{ ok: boolean; error?: string }> => {
        const res = await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) { await fetchProducts(); return { ok: true }; }
        const json = await res.json().catch(() => ({}));
        return { ok: false, error: json.error ?? "Failed to update product" };
    };

    const deleteProduct = async (id: string): Promise<{ ok: boolean; error?: string }> => {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (res.ok) { await fetchProducts(); return { ok: true }; }
        const json = await res.json().catch(() => ({}));
        return { ok: false, error: json.error ?? "Failed to delete product" };
    };

    const uploadImage = async (file: File): Promise<string> => {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/products/upload-image", { method: "POST", body: form });
        const json = await res.json();
        return json.url as string;
    };

    const getProductById = useCallback(
        (id: string) => products.find((p) => p.id === id),
        [products]
    );

    const getProductsByCategory = useCallback(
        (category: string) => products.filter((p) => p.category === category),
        [products]
    );

    const getRelatedProducts = useCallback(
        (product: Product, limit = 4) =>
            products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit),
        [products]
    );

    const searchProducts = useCallback(
        (query: string) => {
            const q = query.toLowerCase();
            return products.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.tags.some((t) => t.includes(q)) ||
                    p.category.includes(q)
            );
        },
        [products]
    );

    return (
        <ProductsContext.Provider
            value={{
                products,
                isHydrated,
                addProduct,
                updateProduct,
                deleteProduct,
                getProductById,
                getProductsByCategory,
                getRelatedProducts,
                searchProducts,
                uploadImage,
                refetch: fetchProducts,
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
