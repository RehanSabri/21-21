"use client";

import React, { useState } from "react";
import Link from "next/link";

const SITE_INDEX = [
    { label: "Shop Now", href: "/women" },
    { label: "Home", href: "/" },
    { label: "Women", href: "/women" },
    { label: "Men", href: "/men" },
    { label: "Kids", href: "/kids" },
    { label: "Sale", href: "/sale" },
];

const SOCIAL = [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
    { label: "Twitter / X", href: "https://twitter.com/" },
];

const LEGAL = [
    { label: "Privacy Policy", href: "#" },
    { label: "Refunds", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Terms of Service", href: "#" },
];

export default function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 4000);
        }
    };

    return (
        <footer className="footer-modern mt-16" role="contentinfo">
            {/* Top: Brand + tagline + newsletter */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div>
                    <div className="footer-brand">21:21</div>
                    <p className="footer-tagline">A Modern Expression of Style</p>
                </div>
                {/* Newsletter */}
                <div className="md:max-w-xs w-full">
                    <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-hm-dark mb-3">
                        Stay in the loop
                    </p>
                    {subscribed ? (
                        <p className="text-xs tracking-wider uppercase text-green-600 font-semibold animate-fadeIn">
                            ✓ Subscribed!
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex gap-0" aria-label="Newsletter signup">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className="flex-1 bg-transparent border border-[#ccc] px-3 py-2 text-[11px] tracking-wider uppercase text-hm-dark placeholder-[#999] outline-none focus:border-hm-dark transition-colors"
                                aria-label="Email address"
                            />
                            <button
                                type="submit"
                                className="bg-hm-dark text-white px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-semibold hover:opacity-80 transition-opacity"
                            >
                                Subscribe
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="border-t border-[#ccc]" />
            </div>

            {/* 4-Column Link Grid */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Site Index */}
                <div>
                    <p className="footer-col-title">Site Index</p>
                    {SITE_INDEX.map((item) => (
                        <Link key={item.label} href={item.href} className="footer-link">
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Social */}
                <div>
                    <p className="footer-col-title">Social</p>
                    {SOCIAL.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                {/* Get In Touch */}
                <div>
                    <p className="footer-col-title">Get In Touch</p>
                    <a href="mailto:hello@2121.com" className="footer-link">
                        hello@2121.com
                    </a>
                    <Link href="/account" className="footer-link">
                        My Account
                    </Link>
                    <Link href="/account?tab=orders" className="footer-link">
                        Track My Order
                    </Link>
                    <a href="https://www2.hm.com/en_gb/customer-service/faq.html" className="footer-link">
                        FAQs
                    </a>
                </div>

                {/* Legal */}
                <div>
                    <p className="footer-col-title">Legal</p>
                    {LEGAL.map((item) => (
                        <a key={item.label} href={item.href} className="footer-link">
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="footer-bottom">
                    <span>All Rights Reserved _ 21:21©2026</span>
                    <span>Fashion &amp; Quality — <span className="text-hm-gold">Made with love</span></span>
                </div>
            </div>
        </footer>
    );
}
