"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Search,
    User,
    Heart,
    ShoppingBag,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Package,
    Settings,
    Shield,
    TrendingUp,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import MiniCart from "./MiniCart";

const NAV_LINKS = [
    {
        label: "Women",
        href: "/women",
        sub: ["New Arrivals", "Tops", "Dresses", "Trousers", "Jeans", "Knitwear", "Jackets", "Sale"],
    },
    {
        label: "Men",
        href: "/men",
        sub: ["New Arrivals", "T-shirts", "Shirts", "Trousers", "Jeans", "Knitwear", "Suits & Blazers", "Sale"],
    },
    {
        label: "Kids",
        href: "/kids",
        sub: ["Baby 0–18m", "Girls 1.5–10Y", "Boys 1.5–10Y", "Teens", "Pyjamas", "Sale"],
    },
    {
        label: "Home",
        href: "/home",
        sub: ["Bedding", "Dining", "Art & Decor", "Textiles", "Storage", "Sale"],
    },
    { label: "Sale", href: "/sale", sub: [] },
];

const POPULAR_SEARCHES = ["Dresses", "Jeans", "Sweaters", "Jackets", "Sale items"];

interface ProductSuggestion {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    price: number;
    images: string[];
}

export default function Navbar() {
    const { totalItems } = useCart();
    const { user, logout } = useAuth();
    const { wishlist } = useWishlist();
    const router = useRouter();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchRef = useRef<HTMLInputElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (searchOpen) searchRef.current?.focus();
    }, [searchOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setSuggestions([]);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Live search suggestions — debounced API fetch
    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (trimmed.length < 2) {
            setSuggestions([]);
            setSelectedIndex(-1);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`/api/products?search=${encodeURIComponent(trimmed)}`)
                .then((r) => r.json())
                .then((data: ProductSuggestion[]) => setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []))
                .catch(() => setSuggestions([]));
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = selectedIndex >= 0 && suggestions[selectedIndex]
            ? suggestions[selectedIndex].name
            : searchQuery.trim();
        if (q) {
            router.push(`/search?q=${encodeURIComponent(q)}`);
            setSearchOpen(false);
            setSearchQuery("");
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (product: ProductSuggestion) => {
        router.push(`/search?q=${encodeURIComponent(product.name)}`);
        setSearchOpen(false);
        setSearchQuery("");
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === "Escape") {
            setSuggestions([]);
            setSelectedIndex(-1);
        }
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearchQuery("");
        setSuggestions([]);
        setSelectedIndex(-1);
    };

    return (
        <>
            {/* Promo Banner */}
            <div className="bg-hm-dark text-white text-center py-2 text-[10px] sm:text-xs font-medium tracking-widest uppercase px-4 truncate">
                Free delivery on orders over ₹4,000 · Free returns on all orders
            </div>

            {/* Main Navbar */}
            <header
                className={`sticky top-0 z-30 bg-white transition-shadow duration-200 ${scrolled ? "shadow-md" : "shadow-sm"
                    }`}
            >
                <nav className="max-w-[1400px] mx-auto px-4 lg:px-8" aria-label="Main navigation">
                    {/* Top Row */}
                    <div className="flex items-center justify-between h-16">
                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 -ml-2"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Logo */}
                        <Link
                            href="/"
                            className="text-3xl font-black tracking-tight text-hm-dark hover:text-hm-red transition-colors"
                            style={{ fontFamily: "Georgia, serif", letterSpacing: "-2px" }}
                            aria-label="21:21 Home"
                        >
                            21:21
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                            {NAV_LINKS.map((link) => (
                                <div
                                    key={link.label}
                                    className="relative"
                                    onMouseEnter={() => link.sub.length > 0 && setActiveDropdown(link.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        href={link.href}
                                        className={`flex items-center gap-1 px-3 py-5 text-sm font-semibold uppercase tracking-wider transition-colors hover:text-hm-red ${link.label === "Sale" ? "text-hm-red" : "text-hm-dark"
                                            }`}
                                    >
                                        {link.label}
                                        {link.sub.length > 0 && <ChevronDown size={14} />}
                                    </Link>

                                    {/* Dropdown */}
                                    {link.sub.length > 0 && activeDropdown === link.label && (
                                        <div className="absolute top-full left-0 bg-white border-t-2 border-hm-red shadow-lg min-w-[200px] py-4 z-50 animate-slideDown">
                                            {link.sub.map((s) => (
                                                <Link
                                                    key={s}
                                                    href={`${link.href}?sub=${encodeURIComponent(s)}`}
                                                    className="block px-6 py-2 text-sm text-hm-dark hover:text-hm-red hover:bg-gray-50 transition-colors"
                                                >
                                                    {s}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-1">
                            {/* Search */}
                            <button
                                className="p-2 hover:text-hm-red transition-colors"
                                onClick={() => setSearchOpen(!searchOpen)}
                                aria-label="Search"
                            >
                                <Search size={22} />
                            </button>

                            {/* User */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    className="p-2 hover:text-hm-red transition-colors"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    aria-label="Account"
                                >
                                    <User size={22} />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-hm-border shadow-lg min-w-[200px] z-50 animate-slideDown">
                                        {user ? (
                                            <>
                                                <div className="px-4 py-3 border-b border-hm-border">
                                                    <p className="text-sm font-semibold">{user.name}</p>
                                                    <p className="text-xs text-hm-gray">{user.email}</p>
                                                </div>
                                                <Link href="/account" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                                                    <Settings size={16} /> My Account
                                                </Link>
                                                <Link href="/account?tab=orders" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                                                    <Package size={16} /> Orders
                                                </Link>
                                                {user.role === "admin" && (
                                                    <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-hm-red" onClick={() => setUserMenuOpen(false)}>
                                                        <Shield size={16} /> Admin Panel
                                                    </Link>
                                                )}
                                                <button onClick={async () => { await logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-t border-hm-border">
                                                    <LogOut size={16} /> Sign out
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/account/login" className="block px-4 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                                                    Sign In
                                                </Link>
                                                <Link href="/account/login?tab=register" className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-t border-hm-border" onClick={() => setUserMenuOpen(false)}>
                                                    Create Account
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Wishlist */}
                            <Link href="/account?tab=wishlist" className="relative p-2 hover:text-hm-red transition-colors" aria-label={`Wishlist (${wishlist.length} items)`}>
                                <Heart size={22} />
                                {wishlist.length > 0 && (
                                    <span className="cart-badge">{wishlist.length}</span>
                                )}
                            </Link>

                            {/* Cart */}
                            <button
                                className="relative p-2 hover:text-hm-red transition-colors"
                                onClick={() => setCartOpen(true)}
                                aria-label={`Shopping bag, ${totalItems} items`}
                            >
                                <ShoppingBag size={22} />
                                {totalItems > 0 && (
                                    <span className="cart-badge">{totalItems}</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    {searchOpen && (
                        <div className="border-t border-hm-border animate-slideDown" ref={searchContainerRef}>
                            <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-2xl mx-auto px-0 py-3">
                                <Search size={18} className="text-hm-gray flex-shrink-0" />
                                <input
                                    ref={searchRef}
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search for products, colours, categories..."
                                    className="flex-1 text-sm outline-none py-1 bg-transparent"
                                    aria-label="Search products"
                                    autoComplete="off"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => { setSearchQuery(""); setSuggestions([]); searchRef.current?.focus(); }}
                                        className="text-hm-gray hover:text-hm-dark transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={closeSearch}
                                    className="text-hm-gray hover:text-hm-dark transition-colors"
                                    aria-label="Close search"
                                >
                                    <X size={18} />
                                </button>
                            </form>

                            {/* Suggestions Dropdown */}
                            <div className="max-w-2xl mx-auto pb-4">
                                {/* Live suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="border border-hm-border bg-white shadow-lg">
                                        {suggestions.map((product, idx) => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => handleSuggestionClick(product)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-hm-border last:border-b-0 ${idx === selectedIndex ? "bg-gray-50" : ""}`}
                                            >
                                                {/* Product thumbnail */}
                                                <div className="relative w-10 h-12 flex-shrink-0 bg-hm-light overflow-hidden">
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        sizes="40px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-hm-dark truncate">
                                                        {/* Bold the matched portion */}
                                                        {highlightMatch(product.name, searchQuery)}
                                                    </p>
                                                    <p className="text-xs text-hm-gray capitalize">{product.category} · {product.subcategory}</p>
                                                </div>
                                                <span className="text-sm font-semibold text-hm-dark flex-shrink-0">
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                </span>
                                            </button>
                                        ))}
                                        {/* View all results link */}
                                        <Link
                                            href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                                            onClick={closeSearch}
                                            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-hm-red hover:bg-red-50 transition-colors"
                                        >
                                            <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                                            <Search size={14} />
                                        </Link>
                                    </div>
                                )}

                                {/* Popular searches (shown when no query) */}
                                {!searchQuery && (
                                    <div className="pt-1">
                                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-hm-gray mb-3">
                                            <TrendingUp size={13} /> Popular searches
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {POPULAR_SEARCHES.map((term) => (
                                                <button
                                                    key={term}
                                                    type="button"
                                                    onClick={() => {
                                                        router.push(`/search?q=${encodeURIComponent(term)}`);
                                                        closeSearch();
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium border border-hm-border text-hm-dark hover:border-hm-dark hover:bg-hm-dark hover:text-white transition-colors"
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No results */}
                                {searchQuery.trim().length >= 2 && suggestions.length === 0 && (
                                    <p className="text-sm text-hm-gray py-3 text-center">
                                        No suggestions for &ldquo;{searchQuery}&rdquo;
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <>
                    <div className="overlay" onClick={() => setMobileOpen(false)} />
                    <div className="fixed top-0 left-0 h-full w-80 max-w-full bg-white z-50 flex flex-col animate-slideRight">
                        <div className="flex items-center justify-between p-4 border-b border-hm-border">
                            <span className="text-2xl font-black" style={{ fontFamily: "Georgia, serif" }}>21:21</span>
                            <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={24} /></button>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-4">
                            {NAV_LINKS.map((link) => (
                                <div key={link.label}>
                                    <Link
                                        href={link.href}
                                        className={`block px-6 py-3 font-semibold uppercase tracking-wider text-sm ${link.label === "Sale" ? "text-hm-red" : "text-hm-dark"
                                            }`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                    {link.sub.map((s) => (
                                        <Link
                                            key={s}
                                            href={`${link.href}?sub=${encodeURIComponent(s)}`}
                                            className="block px-10 py-2 text-sm text-hm-gray hover:text-hm-dark"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            {s}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-hm-border">
                            {user ? (
                                <div>
                                    <p className="text-sm font-semibold mb-1">{user.name}</p>
                                    <button onClick={async () => { await logout(); setMobileOpen(false); }} className="text-sm text-hm-gray flex items-center gap-2">
                                        <LogOut size={14} /> Sign out
                                    </button>
                                </div>
                            ) : (
                                <Link href="/account/login" className="btn-primary w-full text-center text-xs" onClick={() => setMobileOpen(false)}>
                                    Sign In / Register
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Mini Cart */}
            {cartOpen && <MiniCart onClose={() => setCartOpen(false)} />}
        </>
    );
}

/** Highlight matched portion of text */
function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <strong className="text-hm-red">{text.slice(idx, idx + query.length)}</strong>
            {text.slice(idx + query.length)}
        </>
    );
}
