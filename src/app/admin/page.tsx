"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Shield,
    Users,
    Package,
    ShoppingCart,
    BarChart3,
    ChevronRight,
    Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { products } from "@/data/products";

type AdminTab = "overview" | "users" | "products";

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState<AdminTab>("overview");
    const [userSearch, setUserSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");

    useEffect(() => {
        if (!user) {
            router.push("/account/login");
            return;
        }
        if (user.role !== "admin") {
            router.push("/account");
        }
    }, [user, router]);

    const getAllUsers = () => {
        const usersRaw = localStorage.getItem("hm_users");
        if (!usersRaw) return [];
        return JSON.parse(usersRaw).map(({ password: _, ...u }: { password: string;[key: string]: unknown }) => u);
    };

    const [allUsers] = useState<ReturnType<typeof getAllUsers>>(getAllUsers);

    const filteredUsers = allUsers.filter(
        (u: { name: string; email: string }) =>
            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.category.includes(productSearch.toLowerCase())
    );

    if (!user || user.role !== "admin") return null;

    const STATS = [
        { label: "Total Users", value: allUsers.length, Icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Products", value: products.length, Icon: Package, color: "text-green-600", bg: "bg-green-50" },
        { label: "Categories", value: 4, Icon: ShoppingCart, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Best Sellers", value: products.filter((p) => p.isBestSeller).length, Icon: BarChart3, color: "text-hm-red", bg: "bg-red-50" },
    ];

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-hm-red flex items-center justify-center">
                        <Shield size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                        <p className="text-hm-gray text-sm">Logged in as {user.name}</p>
                    </div>
                </div>
                <Link href="/account" className="flex items-center gap-1 text-sm text-hm-gray hover:text-hm-dark transition-colors">
                    My Account <ChevronRight size={14} />
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-hm-border mb-6" role="tablist">
                {(["overview", "users", "products"] as AdminTab[]).map((t) => (
                    <button
                        key={t}
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors capitalize ${tab === t ? "border-hm-dark text-hm-dark" : "border-transparent text-hm-gray hover:text-hm-dark"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {tab === "overview" && (
                <div className="animate-fadeIn">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {STATS.map(({ label, value, Icon, color, bg }) => (
                            <div key={label} className="border border-hm-border p-5">
                                <div className={`w-10 h-10 ${bg} flex items-center justify-center mb-3`}>
                                    <Icon size={20} className={color} />
                                </div>
                                <p className="text-2xl font-bold mb-1">{value}</p>
                                <p className="text-sm text-hm-gray">{label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-hm-border p-5">
                            <h2 className="font-bold mb-4">Quick Links</h2>
                            <div className="space-y-2">
                                <button onClick={() => setTab("users")} className="flex items-center justify-between w-full px-3 py-2 hover:bg-hm-light transition-colors text-sm">
                                    <span>Manage Users</span><ChevronRight size={14} />
                                </button>
                                <button onClick={() => setTab("products")} className="flex items-center justify-between w-full px-3 py-2 hover:bg-hm-light transition-colors text-sm">
                                    <span>Manage Products</span><ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="border border-hm-border p-5">
                            <h2 className="font-bold mb-4">Sales by Category</h2>
                            <div className="space-y-3">
                                {["Women", "Men", "Kids", "Home"].map((cat, i) => {
                                    const pct = [45, 30, 15, 10][i];
                                    return (
                                        <div key={cat}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{cat}</span>
                                                <span className="font-medium">{pct}%</span>
                                            </div>
                                            <div className="h-2 bg-hm-light overflow-hidden">
                                                <div className="h-full bg-hm-red" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users */}
            {tab === "users" && (
                <div className="animate-fadeIn">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold">User Management ({filteredUsers.length} users)</h2>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                            <input
                                type="search"
                                placeholder="Search users..."
                                className="input-field pl-9 py-2 text-sm w-56"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                aria-label="Search users"
                            />
                        </div>
                    </div>
                    <div className="border border-hm-border overflow-x-auto">
                        <table className="w-full text-sm" role="grid" aria-label="Users table">
                            <thead>
                                <tr className="bg-hm-light border-b border-hm-border">
                                    <th className="text-left p-4 font-semibold">Name</th>
                                    <th className="text-left p-4 font-semibold">Email</th>
                                    <th className="text-left p-4 font-semibold">Role</th>
                                    <th className="text-left p-4 font-semibold">Joined</th>
                                    <th className="text-left p-4 font-semibold">Addresses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u: { id: string; name: string; email: string; role: string; joinedDate: string; addresses: unknown[] }) => (
                                    <tr key={u.id} className="border-b border-hm-border hover:bg-hm-light/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-hm-dark text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                {u.name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-hm-gray">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 text-xs font-bold uppercase ${u.role === "admin" ? "bg-hm-red text-white" : "bg-hm-light text-hm-dark border border-hm-border"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-hm-gray">{u.joinedDate}</td>
                                        <td className="p-4 text-hm-gray">{u.addresses?.length ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Products */}
            {tab === "products" && (
                <div className="animate-fadeIn">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold">Product Management ({filteredProducts.length} products)</h2>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                            <input
                                type="search"
                                placeholder="Search products..."
                                className="input-field pl-9 py-2 text-sm w-64"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                aria-label="Search products"
                            />
                        </div>
                    </div>
                    <div className="border border-hm-border overflow-x-auto">
                        <table className="w-full text-sm" role="grid" aria-label="Products table">
                            <thead>
                                <tr className="bg-hm-light border-b border-hm-border">
                                    <th className="text-left p-4 font-semibold">Product</th>
                                    <th className="text-left p-4 font-semibold">Category</th>
                                    <th className="text-left p-4 font-semibold">Price</th>
                                    <th className="text-left p-4 font-semibold">Rating</th>
                                    <th className="text-left p-4 font-semibold">Tags</th>
                                    <th className="text-left p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p) => (
                                    <tr key={p.id} className="border-b border-hm-border hover:bg-hm-light/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={p.images[0]}
                                                    alt={p.name}
                                                    className="w-10 h-12 object-cover bg-hm-light flex-shrink-0"
                                                />
                                                <span className="font-medium line-clamp-2 max-w-[200px]">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 capitalize">{p.category}</td>
                                        <td className="p-4">
                                            £{p.price.toFixed(2)}
                                            {p.originalPrice && (
                                                <span className="text-hm-red text-xs ml-1">(-{Math.round((1 - p.price / p.originalPrice) * 100)}%)</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-hm-gold">★</span> {p.rating} ({p.reviews})
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {p.isBestSeller && <span className="text-xs bg-hm-gold/20 text-hm-gold px-1.5 py-0.5 border border-hm-gold/30">Best Seller</span>}
                                                {p.isNew && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 border border-blue-200">New</span>}
                                                {p.isSale && <span className="text-xs bg-red-50 text-hm-red px-1.5 py-0.5 border border-red-200">Sale</span>}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Link
                                                href={`/${p.category}/${p.id}`}
                                                className="text-xs underline text-hm-gray hover:text-hm-dark transition-colors"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
