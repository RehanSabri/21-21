"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    User,
    Package,
    Heart,
    MapPin,
    Edit3,
    Trash2,
    Plus,
    Save,
    LogOut,
    CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { products, getProductById } from "@/data/products";
import ProductCard from "@/components/ProductCard";

type Tab = "profile" | "orders" | "wishlist" | "addresses";

interface OrderItem {
    id: string;
    productId: string;
    name: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    userId: string;
    date: string;
    status: string;
    total: number;
    shippingMethod: string;
    address: string;
    items: OrderItem[];
}

const getOrdersFromStorage = (userId: string): Order[] => {
    if (typeof window === "undefined") return [];
    try {
        const all: Order[] = JSON.parse(localStorage.getItem("hm_orders") || "[]");
        return all.filter((o) => o.userId === userId);
    } catch {
        return [];
    }
};

function AccountPageContent() {
    const { user, logout, updateUser, addAddress, removeAddress } = useAuth();
    const { wishlist } = useWishlist();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [tab, setTab] = useState<Tab>(
        (searchParams.get("tab") as Tab) || "profile"
    );

    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: "", email: "" });
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [addrForm, setAddrForm] = useState({ line1: "", line2: "", city: "", postcode: "", country: "United Kingdom", isDefault: false });
    const [savedMsg, setSavedMsg] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (!user) router.push("/account/login");
    }, [user, router]);

    useEffect(() => {
        if (user) setOrders(getOrdersFromStorage(user.id));
    }, [user]);

    useEffect(() => {
        if (user) setProfileForm({ name: user.name, email: user.email });
    }, [user]);

    const wishlistProducts = wishlist
        .map((id) => getProductById(id))
        .filter(Boolean) as ReturnType<typeof getProductById>[];

    if (!user) return null;

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(profileForm);
        setEditingProfile(false);
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2500);
    };

    const handleAddAddress = (e: React.FormEvent) => {
        e.preventDefault();
        addAddress(addrForm as Parameters<typeof addAddress>[0]);
        setShowAddAddress(false);
        setAddrForm({ line1: "", line2: "", city: "", postcode: "", country: "United Kingdom", isDefault: false });
    };

    const TABS = [
        { id: "profile" as Tab, label: "My Profile", Icon: User },
        { id: "orders" as Tab, label: "Orders", Icon: Package },
        { id: "wishlist" as Tab, label: `Wishlist (${wishlist.length})`, Icon: Heart },
        { id: "addresses" as Tab, label: "Addresses", Icon: MapPin },
    ];

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">My Account</h1>
                    <p className="text-hm-gray text-sm">Welcome back, {user.name}</p>
                </div>
                <button
                    onClick={() => { logout(); router.push("/"); }}
                    className="flex items-center gap-2 text-sm text-hm-gray hover:text-hm-red transition-colors"
                >
                    <LogOut size={16} /> Sign out
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Tab Sidebar */}
                <aside className="md:w-56 flex-shrink-0">
                    <nav className="border border-hm-border" aria-label="Account navigation">
                        {TABS.map(({ id, label, Icon }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left border-b border-hm-border last:border-b-0 transition-colors ${tab === id
                                    ? "bg-hm-dark text-white font-semibold"
                                    : "hover:bg-hm-light text-hm-dark"
                                    }`}
                                aria-selected={tab === id}
                            >
                                <Icon size={16} /> {label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Tab Content */}
                <main className="flex-1" aria-live="polite">

                    {/* Profile Tab */}
                    {tab === "profile" && (
                        <div className="border border-hm-border p-6 animate-fadeIn">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold">Personal Information</h2>
                                {!editingProfile && (
                                    <button onClick={() => setEditingProfile(true)} className="flex items-center gap-1 text-sm text-hm-gray hover:text-hm-dark transition-colors">
                                        <Edit3 size={14} /> Edit
                                    </button>
                                )}
                            </div>

                            {savedMsg && (
                                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 p-3 mb-4 text-sm animate-fadeIn">
                                    <CheckCircle size={16} /> Profile updated successfully.
                                </div>
                            )}

                            {editingProfile ? (
                                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block" htmlFor="profile-name">Full Name</label>
                                        <input id="profile-name" className="input-field" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block" htmlFor="profile-email">Email Address</label>
                                        <input id="profile-email" type="email" className="input-field" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="submit" className="btn-primary text-sm gap-2"><Save size={14} /> Save Changes</button>
                                        <button type="button" onClick={() => setEditingProfile(false)} className="btn-secondary text-sm">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-hm-dark text-white rounded-full flex items-center justify-center text-2xl font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{user.name}</p>
                                            <p className="text-hm-gray text-sm">{user.email}</p>
                                            <p className="text-xs text-hm-gray mt-0.5">
                                                Member since {user.joinedDate}
                                                {user.role === "admin" && (
                                                    <span className="ml-2 bg-hm-red text-white text-xs px-1.5 py-0.5 uppercase font-bold">Admin</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {user.role === "admin" && (
                                        <Link href="/admin" className="btn-red text-xs inline-flex gap-2">
                                            Open Admin Panel
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Orders Tab */}
                    {tab === "orders" && (
                        <div className="animate-fadeIn">
                            <h2 className="text-lg font-bold mb-5">Order History</h2>
                            {orders.length === 0 ? (
                                <div className="border border-hm-border p-12 text-center">
                                    <Package size={40} className="mx-auto mb-3 text-hm-border" />
                                    <p className="text-hm-gray mb-2">No orders yet.</p>
                                    <p className="text-xs text-hm-gray mb-4">Complete a checkout to see your orders here.</p>
                                    <Link href="/" className="btn-primary text-xs mt-4 inline-block">Start Shopping</Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.map((order: Order) => (
                                        <div key={order.id} className="border border-hm-border">
                                            <div className="flex items-center justify-between p-4">
                                                <div>
                                                    <p className="font-semibold text-sm">Order #{order.id}</p>
                                                    <p className="text-xs text-hm-gray">{order.date} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                                                    {order.address && <p className="text-xs text-hm-gray truncate max-w-[200px]">{order.address}</p>}
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <span className={`text-xs font-semibold px-2 py-1 ${order.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    <p className="text-sm font-bold">₹{order.total.toLocaleString('en-IN')}</p>
                                                    <button
                                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                        className="text-xs text-hm-gray hover:text-hm-dark underline transition-colors"
                                                    >
                                                        {expandedOrder === order.id ? "Hide Details" : "View Details"}
                                                    </button>
                                                </div>
                                            </div>
                                            {expandedOrder === order.id && (
                                                <div className="border-t border-hm-border p-4 bg-hm-light/40 animate-fadeIn">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-hm-gray mb-3">Items</p>
                                                    <div className="space-y-3">
                                                        {order.items.map((item: OrderItem) => (
                                                            <div key={item.id} className="flex items-center gap-3">
                                                                <div className="w-12 h-14 relative bg-hm-border flex-shrink-0 overflow-hidden">
                                                                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                                                    <p className="text-xs text-hm-gray">{item.color} · {item.size} · ×{item.quantity}</p>
                                                                </div>
                                                                <span className="text-sm font-semibold flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between text-sm font-bold pt-3 mt-3 border-t border-hm-border">
                                                        <span>Total</span>
                                                        <span>₹{order.total.toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Wishlist Tab */}
                    {tab === "wishlist" && (
                        <div className="animate-fadeIn">
                            <h2 className="text-lg font-bold mb-5">My Wishlist</h2>
                            {wishlistProducts.length === 0 ? (
                                <div className="border border-hm-border p-12 text-center">
                                    <Heart size={40} className="mx-auto mb-3 text-hm-border" />
                                    <p className="text-hm-gray mb-4">Your wishlist is empty.</p>
                                    <Link href="/" className="btn-primary text-xs">Discover Products</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {wishlistProducts.map((p) => p && <ProductCard key={p.id} product={p} />)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Addresses Tab */}
                    {tab === "addresses" && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold">My Addresses</h2>
                                <button onClick={() => setShowAddAddress(true)} className="flex items-center gap-1 text-sm text-hm-dark hover:text-hm-red transition-colors font-medium">
                                    <Plus size={14} /> Add Address
                                </button>
                            </div>

                            {showAddAddress && (
                                <form onSubmit={handleAddAddress} className="border border-hm-border p-5 mb-5 animate-fadeIn">
                                    <h3 className="font-semibold mb-4">New Address</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium mb-1 block">Address Line 1 *</label>
                                            <input required className="input-field text-sm" value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium mb-1 block">Address Line 2</label>
                                            <input className="input-field text-sm" value={addrForm.line2} onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1 block">City *</label>
                                            <input required className="input-field text-sm" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1 block">Postcode *</label>
                                            <input required className="input-field text-sm" value={addrForm.postcode} onChange={(e) => setAddrForm({ ...addrForm, postcode: e.target.value })} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium mb-1 block flex items-center gap-2">
                                                <input type="checkbox" className="accent-hm-dark" checked={addrForm.isDefault} onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })} />
                                                Set as default address
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button type="submit" className="btn-primary text-xs">Save Address</button>
                                        <button type="button" onClick={() => setShowAddAddress(false)} className="btn-secondary text-xs">Cancel</button>
                                    </div>
                                </form>
                            )}

                            {user.addresses.length === 0 && !showAddAddress ? (
                                <div className="border border-hm-border p-12 text-center">
                                    <MapPin size={40} className="mx-auto mb-3 text-hm-border" />
                                    <p className="text-hm-gray mb-4">No saved addresses.</p>
                                    <button onClick={() => setShowAddAddress(true)} className="btn-primary text-xs">Add Your First Address</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.addresses.map((addr) => (
                                        <div key={addr.id} className="border border-hm-border p-4 relative">
                                            {addr.isDefault && (
                                                <span className="absolute top-3 right-3 text-xs font-bold bg-hm-dark text-white px-2 py-0.5">Default</span>
                                            )}
                                            <p className="font-medium text-sm mb-1">{addr.line1}</p>
                                            {addr.line2 && <p className="text-sm text-hm-gray">{addr.line2}</p>}
                                            <p className="text-sm text-hm-gray">{addr.city}, {addr.postcode}</p>
                                            <p className="text-sm text-hm-gray">{addr.country}</p>
                                            <button
                                                onClick={() => removeAddress(addr.id)}
                                                className="flex items-center gap-1 text-xs text-hm-red hover:opacity-75 transition-opacity mt-3"
                                                aria-label="Remove address"
                                            >
                                                <Trash2 size={12} /> Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function AccountPage() {
    return (
        <React.Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading account details...</div>}>
            <AccountPageContent />
        </React.Suspense>
    );
}
