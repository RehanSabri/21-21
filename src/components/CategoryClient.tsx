"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { products, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

interface CategoryClientProps {
    category: string;
}

const SORT_OPTIONS = [
    { label: "Best Sellers", value: "bestseller" },
    { label: "New Arrivals", value: "new" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const PRICE_RANGES = [
    { label: "Under ₹2,000", min: 0, max: 2000 },
    { label: "₹2,000 – ₹4,000", min: 2000, max: 4000 },
    { label: "₹4,000 – ₹6,000", min: 4000, max: 6000 },
    { label: "Over ₹6,000", min: 6000, max: Infinity },
];

export default function CategoryClient({ category }: CategoryClientProps) {
    const [sortBy, setSortBy] = useState("bestseller");
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);

    const categoryProducts = useMemo(() => {
        let filtered: Product[] =
            category === "sale"
                ? products.filter((p) => p.isSale)
                : products.filter((p) => p.category === category);

        if (selectedSizes.length > 0) {
            filtered = filtered.filter((p) =>
                p.sizes.some((s) => selectedSizes.includes(s))
            );
        }

        if (selectedPriceRanges.length > 0) {
            filtered = filtered.filter((p) =>
                selectedPriceRanges.some((idx) => {
                    const range = PRICE_RANGES[idx];
                    return p.price >= range.min && p.price < range.max;
                })
            );
        }

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "new":
                    return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                default:
                    return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
            }
        });
    }, [category, sortBy, selectedSizes, selectedPriceRanges]);

    const toggleSize = (size: string) =>
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );

    const togglePriceRange = (idx: number) =>
        setSelectedPriceRanges((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );

    const clearFilters = () => {
        setSelectedSizes([]);
        setSelectedPriceRanges([]);
    };

    const hasFilters = selectedSizes.length > 0 || selectedPriceRanges.length > 0;
    const categoryTitle =
        category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span className="separator">/</span>
                <span className="text-hm-dark font-medium">{categoryTitle}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{categoryTitle}</h1>
                    <p className="text-hm-gray text-sm mt-1">
                        {categoryProducts.length} products
                    </p>
                </div>

                {/* Sort + Filter Controls */}
                <div className="flex items-center gap-3">
                    {/* Filter toggle (all screens) */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 border border-hm-border px-4 py-2 text-sm font-medium hover:border-hm-dark transition-colors"
                        aria-expanded={showFilters}
                    >
                        <SlidersHorizontal size={16} />
                        Filter
                        {hasFilters && (
                            <span className="ml-1 bg-hm-dark text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {selectedSizes.length + selectedPriceRanges.length}
                            </span>
                        )}
                    </button>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setSortOpen(!sortOpen)}
                            className="flex items-center gap-2 border border-hm-border px-4 py-2 text-sm font-medium hover:border-hm-dark transition-colors"
                            aria-expanded={sortOpen}
                            aria-haspopup="listbox"
                        >
                            <span className="hidden sm:inline">Sort: </span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                            {sortOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {sortOpen && (
                            <div
                                className="absolute right-0 top-full mt-1 bg-white border border-hm-border shadow-lg min-w-[220px] z-20 animate-slideDown"
                                role="listbox"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-hm-light transition-colors ${sortBy === opt.value ? "font-semibold" : ""
                                            }`}
                                        role="option"
                                        aria-selected={sortBy === opt.value}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Bottom Sheet */}
            {showFilters && (
                <>
                    {/* Overlay - only shown on mobile via CSS */}
                    <div className="filter-sheet-overlay" onClick={() => setShowFilters(false)} />
                    {/* Bottom sheet on mobile, inline sidebar on desktop */}
                    <div className="lg:hidden filter-sheet" role="dialog" aria-label="Product filters" aria-modal="true">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-semibold text-sm uppercase tracking-wider">Filters</h2>
                            <div className="flex items-center gap-3">
                                {hasFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-hm-red hover:underline flex items-center gap-1"
                                    >
                                        <X size={12} /> Clear all
                                    </button>
                                )}
                                <button onClick={() => setShowFilters(false)} aria-label="Close filters">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        {/* Size Filter */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-3">Size</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {ALL_SIZES.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`py-2 text-xs border transition-colors ${selectedSizes.includes(size)
                                                ? "border-hm-dark bg-hm-dark text-white"
                                                : "border-hm-border hover:border-hm-dark"
                                            }`}
                                        aria-pressed={selectedSizes.includes(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Price Filter */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-3">Price</h3>
                            <div className="space-y-3">
                                {PRICE_RANGES.map((range, idx) => (
                                    <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPriceRanges.includes(idx)}
                                            onChange={() => togglePriceRange(idx)}
                                            className="accent-hm-dark w-4 h-4"
                                            aria-label={range.label}
                                        />
                                        <span className="text-sm">{range.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setShowFilters(false)} className="btn-primary w-full text-sm">
                            Apply Filters
                        </button>
                    </div>
                </>
            )}

            <div className="flex gap-6">
                {/* Desktop Filter Sidebar */}
                {showFilters && (
                    <aside
                        className="hidden lg:block w-64 flex-shrink-0 animate-fadeIn"
                        aria-label="Product filters"
                    >
                        <div className="border border-hm-border p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-semibold text-sm uppercase tracking-wider">Filters</h2>
                                {hasFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-hm-red hover:underline flex items-center gap-1"
                                    >
                                        <X size={12} /> Clear all
                                    </button>
                                )}
                            </div>

                            {/* Size Filter */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold mb-3">Size</h3>
                                <div className="grid grid-cols-3 gap-1">
                                    {ALL_SIZES.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => toggleSize(size)}
                                            className={`py-1.5 text-xs border transition-colors ${selectedSizes.includes(size)
                                                    ? "border-hm-dark bg-hm-dark text-white"
                                                    : "border-hm-border hover:border-hm-dark"
                                                }`}
                                            aria-pressed={selectedSizes.includes(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">Price</h3>
                                <div className="space-y-2">
                                    {PRICE_RANGES.map((range, idx) => (
                                        <label
                                            key={range.label}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedPriceRanges.includes(idx)}
                                                onChange={() => togglePriceRange(idx)}
                                                className="accent-hm-dark"
                                                aria-label={range.label}
                                            />
                                            <span className="text-sm">{range.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                )}

                {/* Product Grid */}
                <div className="flex-1">
                    {categoryProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-hm-gray mb-4">No products match your filters.</p>
                            <button onClick={clearFilters} className="btn-secondary text-xs">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div
                            className={`grid gap-4 lg:gap-6 ${showFilters
                                    ? "grid-cols-2 lg:grid-cols-3"
                                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                }`}
                        >
                            {categoryProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
