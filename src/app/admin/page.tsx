"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Shield, Users, Package, ShoppingCart, BarChart3,
    ChevronRight, Search, Plus, Pencil, Trash2, X,
    Check, AlertTriangle, ImageIcon, Tag, Palette,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { Product } from "@/data/products";

type AdminTab = "overview" | "users" | "products";
type Category = "women" | "men" | "kids" | "home";

// ─── Blank form state ──────────────────────────────────────────────────────────
const BLANK_FORM = {
    name: "",
    category: "women" as Category,
    subcategory: "",
    price: "",
    originalPrice: "",
    description: "",
    images: [""],
    colors: [{ name: "", hex: "#000000" }],
    sizes: [] as string[],
    details: [""],
    care: [""],
    tags: [] as string[],
    rating: "4.5",
    reviews: "0",
    isNew: false,
    isSale: false,
    isBestSeller: false,
};

type FormState = typeof BLANK_FORM;

// ─── Tag/Chip Input ────────────────────────────────────────────────────────────
function TagInput({
    label, values, onChange, placeholder,
}: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
    const [input, setInput] = useState("");
    const add = () => {
        const v = input.trim();
        if (v && !values.includes(v)) onChange([...values, v]);
        setInput("");
    };
    return (
        <div>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
                {values.map((v) => (
                    <span key={v} className="flex items-center gap-1 bg-hm-dark text-white text-xs px-2 py-1">
                        {v}
                        <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
                            <X size={10} />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    className="input-field text-sm flex-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                    placeholder={placeholder ?? "Type and press Enter"}
                />
                <button type="button" onClick={add} className="btn-secondary text-xs px-3 py-2">Add</button>
            </div>
        </div>
    );
}

// ─── Bullet List Input ─────────────────────────────────────────────────────────
function BulletListInput({
    label, values, onChange, placeholder,
}: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
    const update = (i: number, val: string) => {
        const next = [...values];
        next[i] = val;
        onChange(next);
    };
    const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
    const add = () => onChange([...values, ""]);
    return (
        <div>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <div className="space-y-2">
                {values.map((v, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <span className="text-hm-gray text-sm">·</span>
                        <input
                            className="input-field text-sm flex-1"
                            value={v}
                            onChange={(e) => update(i, e.target.value)}
                            placeholder={placeholder ?? "Enter item..."}
                        />
                        <button type="button" onClick={() => remove(i)} className="text-hm-gray hover:text-hm-red transition-colors" aria-label="Remove">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={add} className="mt-2 flex items-center gap-1 text-xs text-hm-gray hover:text-hm-dark transition-colors">
                <Plus size={12} /> Add item
            </button>
        </div>
    );
}

// ─── Product Form ────────────────────────────────────────────────────────────
function ProductForm({
    initial,
    onSave,
    onClose,
}: {
    initial?: Product | null;
    onSave: (data: Omit<Product, "id">) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState<FormState>(() => {
        if (!initial) return BLANK_FORM;
        return {
            name: initial.name,
            category: initial.category,
            subcategory: initial.subcategory,
            price: String(initial.price),
            originalPrice: initial.originalPrice ? String(initial.originalPrice) : "",
            description: initial.description,
            images: initial.images.length ? initial.images : [""],
            colors: initial.colors.length ? initial.colors : [{ name: "", hex: "#000000" }],
            sizes: initial.sizes,
            details: initial.details.length ? initial.details : [""],
            care: initial.care.length ? initial.care : [""],
            tags: initial.tags,
            rating: String(initial.rating),
            reviews: String(initial.reviews),
            isNew: !!initial.isNew,
            isSale: !!initial.isSale,
            isBestSeller: !!initial.isBestSeller,
        };
    });

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((f) => ({ ...f, [key]: val }));

    const updateColor = (i: number, field: "name" | "hex", val: string) => {
        const next = [...form.colors];
        next[i] = { ...next[i], [field]: val };
        set("colors", next);
    };
    const addColor = () => set("colors", [...form.colors, { name: "", hex: "#000000" }]);
    const removeColor = (i: number) => set("colors", form.colors.filter((_, idx) => idx !== i));

    const updateImage = (i: number, val: string) => {
        const next = [...form.images];
        next[i] = val;
        set("images", next);
    };
    const addImage = () => set("images", [...form.images, ""]);
    const removeImage = (i: number) => set("images", form.images.filter((_, idx) => idx !== i));

    const [errors, setErrors] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs: string[] = [];
        if (!form.name.trim()) errs.push("Product name is required.");
        if (!form.price || isNaN(Number(form.price))) errs.push("Valid price is required.");
        if (!form.images.filter(Boolean).length) errs.push("At least one image URL is required.");
        if (!form.colors.filter((c) => c.name).length) errs.push("At least one colour is required.");
        if (!form.sizes.length) errs.push("At least one size is required.");
        if (errs.length) { setErrors(errs); return; }

        const data: Omit<Product, "id"> = {
            name: form.name.trim(),
            category: form.category,
            subcategory: form.subcategory.trim(),
            price: Number(form.price),
            originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
            description: form.description.trim(),
            images: form.images.filter(Boolean),
            colors: form.colors.filter((c) => c.name),
            sizes: form.sizes,
            details: form.details.filter(Boolean),
            care: form.care.filter(Boolean),
            tags: form.tags,
            rating: parseFloat(form.rating) || 4.5,
            reviews: parseInt(form.reviews) || 0,
            isNew: form.isNew,
            isSale: form.isSale,
            isBestSeller: form.isBestSeller,
        };
        onSave(data);
    };

    const CATEGORY_OPTIONS: Category[] = ["women", "men", "kids", "home"];

    return (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Product form">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-slideDown">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-hm-border sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-hm-dark flex items-center justify-center">
                            <Package size={16} className="text-white" />
                        </div>
                        <h2 className="font-bold text-lg">{initial ? "Edit Product" : "Add New Product"}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-hm-light rounded transition-colors" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <form id="product-form" onSubmit={handleSubmit} className="flex-1 px-6 py-6 space-y-7">
                    {/* Errors */}
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 p-4 flex gap-3">
                            <AlertTriangle size={16} className="text-hm-red flex-shrink-0 mt-0.5" />
                            <ul className="text-sm text-hm-red space-y-0.5">
                                {errors.map((e) => <li key={e}>{e}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Basic Info */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-hm-gray mb-4 pb-2 border-b border-hm-border">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Product Name *</label>
                                <input className="input-field text-sm" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Floral Wrap Dress" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Category *</label>
                                    <select className="input-field text-sm" value={form.category} onChange={(e) => set("category", e.target.value as Category)}>
                                        {CATEGORY_OPTIONS.map((c) => (
                                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Subcategory</label>
                                    <input className="input-field text-sm" value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} placeholder="e.g. Dresses" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Description</label>
                                <textarea className="input-field text-sm min-h-[80px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description of the product..." />
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-hm-gray mb-4 pb-2 border-b border-hm-border">Pricing</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Price (₹) *</label>
                                <input className="input-field text-sm" type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 2999" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Original Price (₹) <span className="text-hm-gray font-normal">(for sale badge)</span></label>
                                <input className="input-field text-sm" type="number" min="0" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="e.g. 3999" />
                            </div>
                        </div>
                    </section>

                    {/* Badges */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-hm-gray mb-4 pb-2 border-b border-hm-border">Product Badges</h3>
                        <div className="flex flex-wrap gap-3">
                            {(["isNew", "isSale", "isBestSeller"] as const).map((flag) => {
                                const labels: Record<string, string> = { isNew: "🆕 New Arrival", isSale: "🔴 On Sale", isBestSeller: "⭐ Best Seller" };
                                return (
                                    <button
                                        key={flag}
                                        type="button"
                                        onClick={() => set(flag, !form[flag])}
                                        className={`px-4 py-2 text-sm font-medium border-2 transition-colors ${form[flag] ? "border-hm-dark bg-hm-dark text-white" : "border-hm-border hover:border-hm-dark"}`}
                                    >
                                        {form[flag] && <Check size={12} className="inline mr-1" />}
                                        {labels[flag]}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Images */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-hm-gray mb-4 pb-2 border-b border-hm-border flex items-center gap-2">
                            <ImageIcon size={14} /> Product Images
                        </h3>
                        <div className="space-y-3">
                            {form.images.map((img, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <div className="flex-1 space-y-1">
                                        <input
                                            className="input-field text-sm"
                                            value={img}
                                            onChange={(e) => updateImage(i, e.target.value)}
                                            placeholder="Paste image URL (https://...)"
                                        />
                                        {img && (
                                            <div className="w-16 h-20 bg-hm-light overflow-hidden border border-hm-border relative">
                                                <Image src={img} alt="preview" fill style={{ objectFit: "cover" }} sizes="64px" onError={() => {}} />
                                            </div>
                                        )}
                                    </div>
                                    {form.images.length > 1 && (
                                        <button type="button" onClick={() => removeImage(i)} className="mt-2 text-hm-gray hover:text-hm-red transition-colors" aria-label="Remove image">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addImage} className="flex items-center gap-1 text-xs text-hm-gray hover:text-hm-dark transition-colors">
                                <Plus size={12} /> Add another image URL
                            </button>
                        </div>
                    </section>

                    {/* Colours */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-hm-gray mb-4 pb-2 border-b border-hm-border flex items-center gap-2">
                            <Palette size={14} /> Colours
                        </h3>
                        <div className="space-y-3">
                            {form.colors.map((color, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={color.hex}
                                        onChange={(e) => updateColor(i, "hex", e.target.value)}
                                        className="w-10 h-10 border border-hm-border cursor-pointer rounded"
                                        title="Pick colour"
                                    />
                                    <input
                                        className="input-field text-sm flex-1"
                                        value={color.name}
                                        onChange={(e) => updateColor(i, "name", e.target.value)}
                                        placeholder="Colour name (e.g. Dusty Rose)"
                                    />
                                    <span className="text-xs text-hm-gray w-16">{color.hex}</span>
                                    {form.colors.length > 1 && (
                                        <button type="button" onClick={() => removeColor(i)} className="text-hm-gray hover:text-hm-red transition-colors" aria-label="Remove colour">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addColor} className="flex items-center gap-1 text-xs text-hm-gray hover:text-hm-dark transition-colors">
                                <Plus size={12} /> Add colour
                            </button>
                        </div>
                    </section>

                    {/* Sizes */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-hm-gray mb-4 pb-2 border-b border-hm-border">Sizes *</h3>
                        <TagInput label="" values={form.sizes} onChange={(v) => set("sizes", v)} placeholder="Type a size and press Enter (e.g. XS, S, M...)" />
                    </section>

                    {/* Details & Care */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-hm-gray mb-4 pb-2 border-b border-hm-border">Details & Care</h3>
                        <div className="space-y-5">
                            <BulletListInput label="Product Details" values={form.details} onChange={(v) => set("details", v)} placeholder="e.g. Regular fit" />
                            <BulletListInput label="Care Instructions" values={form.care} onChange={(v) => set("care", v)} placeholder="e.g. Machine wash at 30°C" />
                        </div>
                    </section>

                    {/* Tags */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-hm-gray mb-4 pb-2 border-b border-hm-border flex items-center gap-2">
                            <Tag size={14} /> Tags
                        </h3>
                        <TagInput label="" values={form.tags} onChange={(v) => set("tags", v)} placeholder="e.g. dress, summer, floral" />
                    </section>

                    {/* Rating & Reviews */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-hm-gray mb-4 pb-2 border-b border-hm-border">Rating & Reviews</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Rating (0–5)</label>
                                <input className="input-field text-sm" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Number of Reviews</label>
                                <input className="input-field text-sm" type="number" min="0" value={form.reviews} onChange={(e) => set("reviews", e.target.value)} />
                            </div>
                        </div>
                    </section>
                </form>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-hm-border px-6 py-4 flex gap-3 z-20">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
                    <button
                        type="submit"
                        form="product-form"
                        className="btn-primary flex-1 text-sm gap-2"
                    >
                        <Check size={16} />
                        {initial ? "Save Changes" : "Add Product"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function ConfirmDelete({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative bg-white p-6 max-w-sm w-full mx-4 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-50 flex items-center justify-center">
                        <Trash2 size={18} className="text-hm-red" />
                    </div>
                    <div>
                        <h3 className="font-bold">Delete Product</h3>
                        <p className="text-sm text-hm-gray">This cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm mb-5">Are you sure you want to delete <strong>{name}</strong>?</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="btn-secondary flex-1 text-sm">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 text-sm bg-hm-red text-white px-4 py-2 font-semibold hover:opacity-90 transition-opacity">Delete</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();

    const [tab, setTab] = useState<AdminTab>("overview");
    const [userSearch, setUserSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [savedFlash, setSavedFlash] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!user) { router.push("/account/login"); return; }
        if (user.role !== "admin") router.push("/account");
    }, [user, router]);

    const getAllUsers = () => {
        if (typeof window === "undefined") return [];
        const raw = localStorage.getItem("hm_users");
        if (!raw) return [];
        return JSON.parse(raw).map(({ password: _, ...u }: { password: string; [k: string]: unknown }) => u);
    };
    const [allUsers, setAllUsers] = useState<ReturnType<typeof getAllUsers>>([]);
    useEffect(() => { setAllUsers(getAllUsers()); }, []);

    const filteredUsers = allUsers.filter((u: { name: string; email: string }) =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.includes(productSearch.toLowerCase())
    );

    const handleSave = (data: Omit<Product, "id">) => {
        if (editProduct) {
            updateProduct(editProduct.id, data);
        } else {
            addProduct(data);
        }
        setShowForm(false);
        setEditProduct(null);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2500);
    };

    const handleDelete = () => {
        if (deleteTarget) {
            deleteProduct(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

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

            {/* Saved flash */}
            {savedFlash && (
                <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm animate-fadeIn">
                    <Check size={16} />
                    Product saved successfully! Changes are now live on the site.
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-hm-border mb-6" role="tablist">
                {(["overview", "users", "products"] as AdminTab[]).map((t) => (
                    <button
                        key={t}
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors capitalize ${tab === t ? "border-hm-dark text-hm-dark" : "border-transparent text-hm-gray hover:text-hm-dark"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Overview ──────────────────────────────────────────────────────── */}
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
                                <button onClick={() => { setTab("products"); setShowForm(true); }} className="flex items-center justify-between w-full px-3 py-2 hover:bg-hm-light transition-colors text-sm text-hm-red">
                                    <span className="flex items-center gap-2"><Plus size={14} />Add New Product</span><ChevronRight size={14} />
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

            {/* ── Users ─────────────────────────────────────────────────────────── */}
            {tab === "users" && (
                <div className="animate-fadeIn">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold">User Management ({filteredUsers.length} users)</h2>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                            <input type="search" placeholder="Search users..." className="input-field pl-9 py-2 text-sm w-56" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} aria-label="Search users" />
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

            {/* ── Products ──────────────────────────────────────────────────────── */}
            {tab === "products" && (
                <div className="animate-fadeIn">
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                        <h2 className="text-lg font-bold">Product Management ({filteredProducts.length} products)</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                                <input type="search" placeholder="Search products..." className="input-field pl-9 py-2 text-sm w-56" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} aria-label="Search products" />
                            </div>
                            <button
                                onClick={() => { setEditProduct(null); setShowForm(true); }}
                                className="btn-primary text-sm gap-2 whitespace-nowrap"
                                id="add-product-btn"
                            >
                                <Plus size={16} /> Add Product
                            </button>
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
                                    <th className="text-left p-4 font-semibold">Badges</th>
                                    <th className="text-left p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p) => (
                                    <tr key={p.id} className="border-b border-hm-border hover:bg-hm-light/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-12 bg-hm-light flex-shrink-0 relative overflow-hidden">
                                                    <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "cover" }} sizes="40px" />
                                                </div>
                                                <span className="font-medium line-clamp-2 max-w-[180px]">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 capitalize">{p.category}</td>
                                        <td className="p-4">
                                            ₹{p.price.toLocaleString("en-IN")}
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
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => { setEditProduct(p); setShowForm(true); }}
                                                    className="p-1.5 hover:bg-hm-light rounded transition-colors text-hm-gray hover:text-hm-dark"
                                                    aria-label={`Edit ${p.name}`}
                                                    title="Edit"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(p)}
                                                    className="p-1.5 hover:bg-red-50 rounded transition-colors text-hm-gray hover:text-hm-red"
                                                    aria-label={`Delete ${p.name}`}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <Link href={`/${p.category}/${p.id}`} className="text-xs underline text-hm-gray hover:text-hm-dark transition-colors">View</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Form Drawer */}
            {showForm && (
                <ProductForm
                    initial={editProduct}
                    onSave={handleSave}
                    onClose={() => { setShowForm(false); setEditProduct(null); }}
                />
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <ConfirmDelete
                    name={deleteTarget.name}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
