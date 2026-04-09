"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
    Heart,
    ShoppingBag,
    Star,
    ChevronRight,
    ZoomIn,
    Ruler,
    RotateCcw,
    Truck,
    Shield,
    ChevronDown,
    ChevronUp,
    X,
} from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import ProductCard from "@/components/ProductCard";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function ProductDetailClient() {
    const params = useParams();
    const productId = params?.productId as string;
    const { getProductById, getRelatedProducts } = useProducts();
    const product = getProductById(productId);

    const { addItem } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const { showToast } = useToast();
    const { recentlyViewed, addViewedProduct } = useRecentlyViewed();

    React.useEffect(() => {
        if (product) {
            addViewedProduct(product.id);
        }
    }, [product?.id]);

    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [activeTab, setActiveTab] = useState("details");
    const [zoomed, setZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

    const [sizeError, setSizeError] = useState(false);

    // Mock Reviews State
    const [reviews, setReviews] = useState([
        { id: 1, rating: 5, text: "Absolutely love the quality and fit. One of my favorite purchases!", author: "Sarah M.", date: "1 week ago" },
        { id: 2, rating: 4, text: "Looks exactly like the pictures. The material is very soft.", author: "Jessica T.", date: "3 weeks ago" }
    ]);
    const [newReviewText, setNewReviewText] = useState("");
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReviewText.trim()) return;
        setSubmittingReview(true);
        setTimeout(() => {
            setReviews(prev => [
                {
                    id: Date.now(),
                    rating: newReviewRating,
                    text: newReviewText,
                    author: "You",
                    date: "Just now"
                },
                ...prev
            ]);
            setNewReviewText("");
            setNewReviewRating(5);
            setSubmittingReview(false);
            showToast("Review submitted successfully!");
        }, 600);
    };

    if (!product) return notFound() as never;

    const related = getRelatedProducts(product, 4);
    const wishlisted = isWishlisted(product.id);

    const handleAddToCart = () => {
        if (!selectedSize) {
            setSizeError(true);
            return;
        }
        setSizeError(false);
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            color: product.colors[selectedColor].name,
            size: selectedSize,
            quantity: 1,
        });
        showToast("Added to bag!");
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    };

    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8 product-detail-mobile-pad">
            {/* Breadcrumb */}
            <nav className="breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRight size={12} className="separator" />
                <Link href={`/${product.category}`}>
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </Link>
                <ChevronRight size={12} className="separator" />
                <span className="text-hm-dark font-medium line-clamp-1">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                {/* Image Gallery */}
                <div className="flex gap-3">
                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                        <div className="hidden sm:flex flex-col gap-2 w-16 flex-shrink-0">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative aspect-square overflow-hidden border-2 transition-colors ${selectedImage === idx ? "border-hm-dark" : "border-transparent"
                                        }`}
                                    aria-label={`View image ${idx + 1}`}
                                >
                                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill style={{ objectFit: "cover" }} sizes="64px" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main Image with Zoom */}
                    <div className="flex-1">
                        <div
                            className="relative overflow-hidden bg-hm-light cursor-zoom-in aspect-[3/4]"
                            onMouseEnter={() => setZoomed(true)}
                            onMouseLeave={() => setZoomed(false)}
                            onMouseMove={handleMouseMove}
                            role="img"
                            aria-label={`${product.name} - image ${selectedImage + 1}`}
                        >
                            <Image
                                src={product.images[selectedImage]}
                                alt={product.name}
                                fill
                                priority
                                style={{
                                    objectFit: "cover",
                                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                    transform: zoomed ? "scale(1.8)" : "scale(1)",
                                    transition: zoomed ? "transform 0s" : "transform 0.3s ease",
                                }}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            <div className="absolute bottom-3 right-3 bg-white/80 p-1.5 backdrop-blur-sm">
                                <ZoomIn size={16} className="text-hm-dark" />
                            </div>
                            {product.isSale && (
                                <div className="absolute top-3 left-3 bg-hm-red text-white text-xs font-bold px-2 py-1">
                                    SALE
                                </div>
                            )}
                        </div>

                        {/* Mobile image dots */}
                        {product.images.length > 1 && (
                            <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
                                {product.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-2 h-2 rounded-full transition-colors ${selectedImage === idx ? "bg-hm-dark" : "bg-hm-border"
                                            }`}
                                        aria-label={`Go to image ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:pt-4">
                    <div className="mb-2">
                        <span className="text-xs text-hm-gray uppercase tracking-wider">{product.subcategory}</span>
                    </div>
                    <h1 className="text-2xl font-bold leading-tight mb-3">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="star-rating" aria-label={`${product.rating} out of 5 stars`}>
                            {stars.map((s) => (
                                <Star
                                    key={s}
                                    size={14}
                                    fill={s <= Math.round(product.rating) ? "currentColor" : "none"}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-hm-gray">
                            {product.rating} ({product.reviews} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-6">
                        {product.originalPrice && (
                            <span className="text-lg text-hm-gray line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                            </span>
                        )}
                        <span className={`text-2xl font-bold ${product.isSale ? "text-hm-red" : "text-hm-dark"}`}>
                            ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.isSale && product.originalPrice && (
                            <span className="text-xs font-bold text-white bg-hm-red px-2 py-0.5">
                                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                            </span>
                        )}
                    </div>

                    {/* Color Selector */}
                    <div className="mb-5">
                        <p className="text-sm font-semibold mb-2">
                            Colour: <span className="font-normal">{product.colors[selectedColor].name}</span>
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {product.colors.map((color, idx) => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(idx)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === idx ? "border-hm-dark scale-110" : "border-transparent"
                                        }`}
                                    style={{ backgroundColor: color.hex, boxShadow: selectedColor === idx ? "0 0 0 1px #1A1A1A" : "inset 0 0 0 1px rgba(0,0,0,0.1)" }}
                                    aria-label={color.name}
                                    aria-pressed={selectedColor === idx}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size Selector */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className={`text-sm font-semibold ${sizeError ? "text-hm-red" : ""}`}>
                                Size {sizeError && <span className="font-normal text-hm-red">– Please select a size</span>}
                            </p>
                            <button
                                onClick={() => setShowSizeGuide(true)}
                                className="flex items-center gap-1 text-xs text-hm-gray hover:text-hm-dark transition-colors"
                            >
                                <Ruler size={12} /> Size Guide
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                                    className={`min-w-[48px] py-2 px-3 text-sm border transition-colors ${selectedSize === size
                                        ? "border-hm-dark bg-hm-dark text-white"
                                        : "border-hm-border hover:border-hm-dark"
                                        }`}
                                    aria-pressed={selectedSize === size}
                                    aria-label={`Size ${size}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 btn-primary gap-2 py-4 text-sm"
                            aria-label="Add to shopping bag"
                        >
                            <ShoppingBag size={18} />
                            Add to Bag
                        </button>
                        <button
                            onClick={() => toggleWishlist(product.id)}
                            className={`p-4 border-2 transition-colors ${wishlisted
                                ? "border-hm-red bg-hm-red text-white"
                                : "border-hm-border hover:border-hm-dark"
                                }`}
                            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-2 mb-6 py-4 border-t border-b border-hm-border">
                        <div className="flex items-center gap-2 text-sm">
                            <Truck size={16} className="text-green-600" />
                            <span>Free delivery on orders over ₹4,000</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <RotateCcw size={16} className="text-hm-gray" />
                            <span>Free 30-day returns</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Shield size={16} className="text-hm-gray" />
                            <span>Secure payment</span>
                        </div>
                    </div>

                    {/* Description Tabs */}
                    <div>
                        <div className="flex border-b border-hm-border mb-4 overflow-x-auto hide-scrollbar" role="tablist">
                            {["details", "care", "delivery", "reviews"].map((tab) => (
                                <button
                                    key={tab}
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab
                                        ? "border-hm-dark text-hm-dark"
                                        : "border-transparent text-hm-gray hover:text-hm-dark"
                                        }`}
                                >
                                    {tab === "delivery" ? "Delivery & Returns" : tab === "reviews" ? `Reviews (${reviews.length + product.reviews})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div role="tabpanel" aria-label={activeTab} className="animate-fadeIn">
                            {activeTab === "details" && (
                                <div>
                                    <p className="text-sm text-hm-gray leading-relaxed mb-4">{product.description}</p>
                                    <ul className="space-y-1">
                                        {product.details.map((d) => (
                                            <li key={d} className="text-sm flex items-start gap-2">
                                                <span className="text-hm-gray mt-0.5">·</span>
                                                {d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {activeTab === "care" && (
                                <ul className="space-y-1">
                                    {product.care.map((c) => (
                                        <li key={c} className="text-sm flex items-start gap-2">
                                            <span className="text-hm-gray mt-0.5">·</span>
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {activeTab === "delivery" && (
                                <div className="space-y-3 text-sm text-hm-gray">
                                    <p><strong className="text-hm-dark">Standard Delivery</strong> – ₹399 (Free over ₹4,000) · 3–5 business days</p>
                                    <p><strong className="text-hm-dark">Express Delivery</strong> – ₹599 · 1–2 business days</p>
                                    <p><strong className="text-hm-dark">Returns</strong> – Free within 30 days. Items must be unworn with tags attached.</p>
                                </div>
                            )}
                            {activeTab === "reviews" && (
                                <div className="space-y-6">
                                    {/* Write Review Form */}
                                    <form onSubmit={handleReviewSubmit} className="bg-hm-light p-4 mb-4">
                                        <h3 className="text-sm font-bold mb-3">Write a Review</h3>
                                        <div className="mb-3">
                                            <div className="flex gap-1 mb-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        type="button"
                                                        key={star}
                                                        onClick={() => setNewReviewRating(star)}
                                                        className="hover:scale-110 transition-transform"
                                                        aria-label={`Rate ${star} stars`}
                                                    >
                                                        <Star size={16} fill={star <= newReviewRating ? "currentColor" : "none"} className={star <= newReviewRating ? "text-hm-dark" : "text-hm-border"} />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                className="input-field text-sm min-h-[80px]"
                                                placeholder="What did you think about this product?"
                                                value={newReviewText}
                                                onChange={e => setNewReviewText(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingReview || !newReviewText.trim()}
                                            className="btn-primary text-xs w-auto px-6 py-2 disabled:opacity-50"
                                        >
                                            {submittingReview ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </form>

                                    {/* Mock Reviews List */}
                                    <div className="space-y-4">
                                        {reviews.map(review => (
                                            <div key={review.id} className="border-b border-hm-border pb-4 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-hm-gray">{review.date}</span>
                                                </div>
                                                <p className="text-sm mb-1">{review.text}</p>
                                                <p className="text-xs text-hm-gray font-medium">{review.author}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <section className="mt-20" aria-label="Related products">
                    <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        {related.map((rp) => (
                            <ProductCard key={rp.id} product={rp} />
                        ))}
                    </div>
                </section>
            )}

            {/* Recently Viewed */}
            {recentlyViewed.filter(p => p.id !== product.id).length > 0 && (
                <section className="mt-20" aria-label="Recently viewed">
                    <h2 className="text-2xl font-bold mb-8">Recently Viewed</h2>
                    <div className="flex overflow-x-auto gap-4 lg:gap-6 pb-4 hide-scrollbar">
                        {recentlyViewed.filter(p => p.id !== product.id).map((rp) => (
                            <div key={rp.id} className="min-w-[160px] max-w-[240px] flex-shrink-0">
                                <ProductCard product={rp} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Size guide">
                    <div className="modal-content p-6 max-w-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Size Guide</h2>
                            <button onClick={() => setShowSizeGuide(false)} aria-label="Close size guide">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-hm-light">
                                        <th className="border border-hm-border p-3 text-left">Size</th>
                                        <th className="border border-hm-border p-3">Bust (cm)</th>
                                        <th className="border border-hm-border p-3">Waist (cm)</th>
                                        <th className="border border-hm-border p-3">Hip (cm)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ["XS", "80–84", "60–64", "88–92"],
                                        ["S", "84–88", "64–68", "92–96"],
                                        ["M", "88–93", "68–73", "96–101"],
                                        ["L", "93–98", "73–78", "101–106"],
                                        ["XL", "98–104", "78–84", "106–112"],
                                        ["XXL", "104–110", "84–90", "112–118"],
                                    ].map(([size, bust, waist, hip]) => (
                                        <tr key={size} className="hover:bg-hm-light/50">
                                            <td className="border border-hm-border p-3 font-medium">{size}</td>
                                            <td className="border border-hm-border p-3 text-center">{bust}</td>
                                            <td className="border border-hm-border p-3 text-center">{waist}</td>
                                            <td className="border border-hm-border p-3 text-center">{hip}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-hm-gray mt-4">
                            Measurements are body measurements in centimetres. If you are between sizes, we recommend going up a size.
                        </p>
                    </div>
                </div>
            )}

            {/* Sticky Mobile CTA */}
            <div className="sticky-mobile-cta">
                <button
                    onClick={handleAddToCart}
                    className="flex-1 btn-primary gap-2 py-3 text-sm"
                    aria-label="Add to shopping bag"
                >
                    <ShoppingBag size={18} />
                    Add to Bag
                </button>
                <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 border-2 transition-colors ${wishlisted
                        ? "border-hm-red bg-hm-red text-white"
                        : "border-hm-border hover:border-hm-dark"
                        }`}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
                </button>
            </div>
        </div>
    );
}
