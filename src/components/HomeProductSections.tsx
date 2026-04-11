"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import ProductCard from "@/components/ProductCard";

export default function HomeProductSections() {
    const { products, isHydrated } = useProducts();

    const featuredProducts = products.filter((p) => p.isBestSeller).slice(0, 4);
    const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
    const saleProducts = products.filter((p) => p.isSale).slice(0, 4);

    return (
        <>
            {/* Best Sellers */}
            <section className="max-w-[1400px] mx-auto px-4 py-10 sm:py-16" aria-label="Best sellers">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-2">
                    <div>
                        <p className="label-tag mb-1">Best Sellers</p>
                        <h2 className="display-heading text-2xl sm:text-3xl">Our Picks</h2>
                    </div>
                    <Link href="/women" className="text-[11px] font-semibold uppercase tracking-[0.12em] flex items-center gap-1 hover:text-hm-red transition-colors">
                        View All <ArrowRight size={13} />
                    </Link>
                </div>
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 transition-opacity duration-300 ${!isHydrated ? "opacity-0" : "opacity-100"}`}>
                    {featuredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} priority={index < 4} />
                    ))}
                </div>
            </section>

            {/* New Arrivals */}
            <section className="bg-hm-light py-10 sm:py-16" aria-label="New arrivals">
                <div className="max-w-[1400px] mx-auto px-4">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-2">
                        <div>
                            <p className="label-tag mb-1">Just Dropped</p>
                            <h2 className="display-heading text-2xl sm:text-3xl">New Arrivals</h2>
                        </div>
                        <Link href="/women?filter=new" className="text-[11px] font-semibold uppercase tracking-[0.12em] flex items-center gap-1 hover:text-hm-red transition-colors">
                            View All <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 transition-opacity duration-300 ${!isHydrated ? "opacity-0" : "opacity-100"}`}>
                        {newArrivals.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Sale Section */}
            <section className="max-w-[1400px] mx-auto px-4 py-10 sm:py-16" aria-label="Sale products">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-2">
                    <div>
                        <p className="label-tag mb-1">Limited Time</p>
                        <h2 className="display-heading text-2xl sm:text-3xl text-hm-red">On Sale Now</h2>
                    </div>
                    <Link href="/sale" className="text-[11px] font-semibold uppercase tracking-[0.12em] flex items-center gap-1 text-hm-red hover:opacity-75 transition-opacity">
                        Shop All Sale <ArrowRight size={13} />
                    </Link>
                </div>
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 transition-opacity duration-300 ${!isHydrated ? "opacity-0" : "opacity-100"}`}>
                    {saleProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </>
    );
}
