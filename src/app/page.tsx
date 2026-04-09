import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import HomeProductSections from "@/components/HomeProductSections";
import { ArrowRight, Leaf, Truck, RotateCcw, Shield } from "lucide-react";

export const metadata: Metadata = {
    title: "21:21 | Fashion and quality at the best price",
    description:
        "Shop the latest fashion for women, men, kids and home at 21:21. Find new arrivals, styles and inspiration.",
};

const CATEGORIES = [
    {
        label: "Women",
        href: "/women",
        image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80",
        description: "Discover the new collection",
    },
    {
        label: "Men",
        href: "/men",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        description: "Modern style essentials",
    },
    {
        label: "Kids",
        href: "/kids",
        image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80",
        description: "From newborn to teens",
    },
    {
        label: "Home",
        href: "/home",
        image: "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&q=80",
        description: "Refresh your living space",
    },
];

const PERKS = [
    { Icon: Truck, title: "Free Delivery", desc: "On orders over ₹4,000" },
    { Icon: RotateCcw, title: "Free Returns", desc: "Easy 30-day returns" },
    { Icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
    { Icon: Leaf, title: "Sustainable", desc: "Conscious choices" },
];

export default function HomePage() {

    return (
        <>
            {/* Hero Banner */}
            <section className="relative h-[85vh] min-h-[500px] overflow-hidden" aria-label="Hero banner">
                <Image
                    src="/photos/Whisk_3b50b2753917568ad564e5e770df901edr.jpeg"
                    alt="Fashion hero image"
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="relative h-full flex items-center px-5 lg:px-20">
                    <div className="max-w-xl animate-fadeIn">
                        <p className="text-white/80 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] mb-3 sm:mb-4">
                            New Season Arrivals
                        </p>
                        <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-black leading-none mb-4 sm:mb-6" style={{ fontFamily: "Georgia, serif" }}>
                            Spring<br />
                            <span className="text-hm-gold">2026</span>
                        </h1>
                        <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed max-w-sm">
                            Discover fresh styles and colours in our new spring collection.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/women" className="btn-primary text-sm">
                                Shop Women
                            </Link>
                            <Link href="/men" className="btn-secondary bg-transparent text-white border-white text-sm hover:bg-white hover:text-hm-dark">
                                Shop Men
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-3 bg-white/50 rounded-full" />
                    </div>
                </div>
            </section>

            {/* Perks Bar */}
            <section className="bg-hm-light border-b border-hm-border py-4" aria-label="Shopping perks">
                <div className="max-w-[1400px] mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {PERKS.map(({ Icon, title, desc }) => (
                            <div key={title} className="flex items-center gap-3 py-2">
                                <Icon size={20} className="text-hm-dark flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold">{title}</p>
                                    <p className="text-xs text-hm-gray">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Cards */}
            <section className="max-w-[1400px] mx-auto px-4 py-16" aria-label="Shop by category">
                <div className="section-header">
                    <h2>Shop by Category</h2>
                    <p>Explore our full range across all lifestyle needs</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.label}
                            href={cat.href}
                            className="relative overflow-hidden group block"
                            aria-label={`Shop ${cat.label}`}
                        >
                            <div className="aspect-[3/4] relative overflow-hidden bg-hm-light">
                                <Image
                                    src={cat.image}
                                    alt={cat.label}
                                    fill
                                    sizes="(max-width: 1024px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 text-white">
                                <h3 className="text-xl lg:text-2xl font-black mb-1">{cat.label}</h3>
                                <p className="text-xs text-white/70 mb-3">{cat.description}</p>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/90 group-hover:gap-2 transition-all">
                                    Shop Now <ArrowRight size={12} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Promo Banner */}
            <section
                className="relative overflow-hidden py-16 sm:py-24 px-5 sm:px-8 text-center"
                aria-label="Sale promotion"
            >
                <Image
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80"
                    alt="Promo banner background"
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10">
                    <p className="text-white/70 text-xs uppercase tracking-[0.3em] mb-3">Limited Time</p>
                    <h2 className="text-white text-3xl sm:text-4xl lg:text-6xl font-black mb-4" style={{ fontFamily: "Georgia, serif" }}>
                        UP TO 50% OFF
                    </h2>
                    <p className="text-white/80 mb-8 max-w-md mx-auto text-sm sm:text-base">
                        Grab incredible deals on selected styles across all categories. Don't miss out!
                    </p>
                    <Link href="/sale" className="inline-flex items-center gap-2 bg-white text-hm-dark px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-hm-light transition-colors">
                        Shop Sale <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            <HomeProductSections />

            {/* Sustainability Banner */}
            <section className="relative overflow-hidden py-20" aria-label="Sustainability">
                <Image
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&q=80"
                    alt="Sustainability background"
                    fill
                    sizes="100vw"
                    className="object-cover object-center opacity-30"
                />
                <div className="relative max-w-2xl mx-auto text-center px-4">
                    <Leaf size={40} className="mx-auto mb-4 text-green-600" />
                    <h2 className="text-3xl font-bold mb-4">Conscious Fashion</h2>
                    <p className="text-hm-gray leading-relaxed mb-6">
                        We're committed to making more sustainable fashion choices accessible to everyone.
                        Our Conscious collection uses more sustainable materials and production processes.
                    </p>
                    <Link href="/women" className="btn-secondary text-sm">
                        Learn More
                    </Link>
                </div>
            </section>
        </>
    );
}
