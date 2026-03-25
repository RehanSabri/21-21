"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { searchProducts, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const SORT_OPTIONS = [
    { label: "Relevance", value: "relevance" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Newest", value: "new" },
];

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    
    const [results, setResults] = useState<Product[]>([]);
    const [sortBy, setSortBy] = useState("relevance");
    const [sortOpen, setSortOpen] = useState(false);

    useEffect(() => {
        if (query) {
            // Find products natively matching the query string
            const found = searchProducts(query);
            setResults(found);
        } else {
            setResults([]);
        }
    }, [query]);

    // Apply sort client-side
    const sortedResults = React.useMemo(() => {
        return [...results].sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                case "new":
                    return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
                default:
                    // Relevance is default (no sort)
                    return 0;
            }
        });
    }, [results, sortBy]);

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8 min-h-[60vh]">
            <nav className="breadcrumb mb-6" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span className="separator">/</span>
                <span className="text-hm-dark font-medium cursor-default">Search Results</span>
            </nav>

            <div className="mb-8 border-b border-hm-border pb-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {query ? `Search results for "${query}"` : "Search"}
                </h1>
                <p className="text-hm-gray text-sm">
                    {results.length} result{results.length !== 1 ? "s" : ""} found
                </p>
            </div>

            {results.length === 0 ? (
                <div className="text-center py-16">
                    <Search size={48} className="mx-auto mb-4 text-hm-border" />
                    <h2 className="text-xl font-semibold mb-2">No results found</h2>
                    <p className="text-hm-gray max-w-md mx-auto mb-8">
                        We couldn't find any items matching "{query}". Try checking your spelling or using more general terms.
                    </p>
                    <Link href="/" className="btn-primary text-sm">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        {/* Placeholder for future filter logic */}
                        <div className="hidden sm:block">
                            <span className="text-sm font-medium text-hm-gray">
                                Showing {sortedResults.length} items
                            </span>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative ml-auto">
                            <button
                                onClick={() => setSortOpen(!sortOpen)}
                                className="flex items-center gap-2 border border-hm-border px-4 py-2 text-sm font-medium hover:border-hm-dark transition-colors bg-white"
                                aria-expanded={sortOpen}
                                aria-haspopup="listbox"
                            >
                                <span className="hidden sm:inline">Sort: </span>
                                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                                {sortOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {sortOpen && (
                                <div
                                    className="absolute right-0 top-full mt-1 bg-white border border-hm-border shadow-lg min-w-[200px] z-20 animate-slideDown"
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

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                        {sortedResults.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
