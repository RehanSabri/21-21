"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
    const { isWishlisted, toggleWishlist } = useWishlist();
    const { addItem } = useCart();
    const { showToast } = useToast();
    const wishlisted = isWishlisted(product.id);

    const [showSizes, setShowSizes] = useState(false);
    const [addedConfirm, setAddedConfirm] = useState(false);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowSizes(true);
    };

    const handleSizeSelect = (size: string) => {
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            color: product.colors[0]?.name ?? "Default",
            size,
            quantity: 1,
        });
        setShowSizes(false);
        setAddedConfirm(true);
        showToast(`${product.name} added to bag!`);
        setTimeout(() => setAddedConfirm(false), 1500);
    };

    return (
        <div className="product-card group">
            <Link href={`/${product.category}/${product.id}`} aria-label={product.name}>
                <div className="product-card-image-wrapper">
                    {/* Badges */}
                    {product.isSale && (
                        <span className="product-card-badge badge-sale">Sale</span>
                    )}
                    {product.isNew && !product.isSale && (
                        <span className="product-card-badge badge-new">New</span>
                    )}
                    {product.isBestSeller && !product.isNew && !product.isSale && (
                        <span className="product-card-badge badge-bestseller">Best Seller</span>
                    )}

                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        priority={priority}
                    />

                    {/* Hover: second image */}
                    {product.images[1] && (
                        <Image
                            src={product.images[1]}
                            alt={`${product.name} alternate view`}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0"
                            loading="lazy"
                        />
                    )}

                    {/* Quick Add Size Picker Overlay */}
                    {showSizes && (
                        <div
                            className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-3 animate-fadeIn"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-hm-dark">Select Size</p>
                            <div className="flex flex-wrap gap-1.5 justify-center">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSizeSelect(size); }}
                                        className="px-2.5 py-1.5 text-xs border border-hm-border hover:border-hm-dark hover:bg-hm-dark hover:text-white transition-colors font-medium min-w-[36px]"
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizes(false); }}
                                className="text-xs text-hm-gray mt-3 hover:text-hm-dark underline transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Quick Add Button (hover) */}
                    {!showSizes && !addedConfirm && (
                        <button
                            onClick={handleQuickAdd}
                            className="quick-add-btn"
                            aria-label={`Quick add ${product.name} to bag`}
                        >
                            <ShoppingBag size={14} />
                            <span>Quick Add</span>
                        </button>
                    )}

                    {/* Added Confirmation */}
                    {addedConfirm && (
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white flex items-center justify-center gap-2 py-2.5 text-xs font-semibold z-10 animate-fadeIn">
                            <Check size={14} /> Added to Bag
                        </div>
                    )}
                </div>
            </Link>

            {/* Wishlist Button */}
            <button
                className="product-card-wishlist"
                onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product.id);
                }}
                aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            >
                <Heart
                    size={16}
                    fill={wishlisted ? "#E50010" : "none"}
                    stroke={wishlisted ? "#E50010" : "#1A1A1A"}
                />
            </button>

            {/* Info */}
            <div className="pt-3 pb-1">
                {/* Color Swatches */}
                {product.colors.length > 1 && (
                    <div className="flex gap-1 mb-2">
                        {product.colors.slice(0, 4).map((color) => (
                            <span
                                key={color.name}
                                className="w-3 h-3 rounded-full border border-hm-border flex-shrink-0"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                                aria-label={color.name}
                            />
                        ))}
                        {product.colors.length > 4 && (
                            <span className="text-xs text-hm-gray">+{product.colors.length - 4}</span>
                        )}
                    </div>
                )}

                <Link href={`/${product.category}/${product.id}`}>
                    <h3 className="text-sm font-medium leading-snug hover:text-hm-red transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 mt-1">
                    {product.originalPrice && (
                        <span className="text-sm text-hm-gray line-through">
                            £{product.originalPrice.toFixed(2)}
                        </span>
                    )}
                    <span
                        className={`text-sm font-semibold ${product.isSale ? "text-hm-red" : "text-hm-dark"
                            }`}
                    >
                        £{product.price.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}
