"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

// Pinterest icon not available in lucide-react, using inline SVG
const PinterestIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="22" /><path d="M8 21c1.5-1 2-3 2.5-5" /><path d="M12 12a4 4 0 1 0-4 4" /><circle cx="12" cy="10" r="8" />
    </svg>
);

const footerLinks = {
    "Customer Service": [
        { label: "Contact Us", href: "https://www2.hm.com/en_gb/customer-service/contact.html" },
        { label: "My 21:21 Account", href: "/account" },
        { label: "Returns & Refunds", href: "https://www2.hm.com/en_gb/customer-service/returns.html" },
        { label: "Size Guide", href: "https://www2.hm.com/en_gb/customer-service/sizeguide/ladies.html" },
        { label: "Track My Order", href: "/account?tab=orders" },
        { label: "FAQs", href: "https://www2.hm.com/en_gb/customer-service/faq.html" },
    ],
    "About 21:21": [
        { label: "About Us", href: "https://about.hm.com" },
        { label: "Sustainability", href: "https://hmgroup.com/sustainability/" },
        { label: "Newsroom", href: "https://about.hm.com/news.html" },
        { label: "Careers", href: "https://career.hm.com" },
        { label: "Investor Relations", href: "https://hmgroup.com/investors/" },
    ],
    "Legal & Privacy": [
        { label: "Privacy Notice", href: "https://www2.hm.com/en_gb/customer-service/legal-and-privacy/privacy-notice.html" },
        { label: "Cookie Settings", href: "https://www2.hm.com/en_gb/customer-service/legal-and-privacy/cookie-notice.html" },
        { label: "Terms & Conditions", href: "https://www2.hm.com/en_gb/customer-service/legal-and-privacy/terms-and-conditions.html" },
        { label: "Accessibility", href: "https://www2.hm.com/en_gb/customer-service/legal-and-privacy/accessibility.html" },
        { label: "Modern Slavery Statement", href: "https://hmgroup.com/sustainability/fair-and-equal/human-rights/" },
    ],
};

export default function Footer() {
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setSubscribed(true);
            setNewsletterEmail("");
            setTimeout(() => setSubscribed(false), 4000);
        }
    };

    return (
        <footer className="bg-hm-dark text-white mt-16" role="contentinfo">
            {/* Newsletter */}
            <div className="border-b border-white/10 py-12 px-4">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold mb-1">Don't miss out</h2>
                        <p className="text-white/60 text-sm">
                            Sign up for emails and stay in-the-know on new arrivals, trends and more.
                        </p>
                    </div>
                    {subscribed ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold animate-fadeIn">
                            <span style={{ fontSize: "16px" }}>✓</span> Thanks for subscribing! Check your inbox.
                        </div>
                    ) : (
                        <form
                            className="flex gap-2 w-full max-w-md"
                            onSubmit={handleNewsletterSubmit}
                            aria-label="Newsletter signup"
                        >
                            <input
                                type="email"
                                required
                                placeholder="Your email address"
                                className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white transition-colors"
                                aria-label="Email address"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-white text-hm-dark px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Links Grid */}
            <div className="max-w-[1400px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {/* Brand Column */}
                <div>
                    <div
                        className="text-4xl font-black mb-4 text-white"
                        style={{ fontFamily: "Georgia, serif", letterSpacing: "-2px" }}
                    >
                        21:21
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed mb-6">
                        Fashion and quality at the best price in a sustainable way.
                    </p>
                    {/* Social Icons */}
                    <div className="flex gap-3">
                        {[
                            { Icon: Instagram, label: "Instagram", url: "https://www.instagram.com/hm/" },
                            { Icon: Facebook, label: "Facebook", url: "https://www.facebook.com/hm/" },
                            { Icon: Twitter, label: "Twitter", url: "https://twitter.com/habordasher" },
                            { Icon: Youtube, label: "YouTube", url: "https://www.youtube.com/user/hennesandmauritz" },
                            { Icon: PinterestIcon, label: "Pinterest", url: "https://www.pinterest.com/hm/" },
                        ].map(({ Icon, label, url }) => (
                            <a
                                key={label}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/50 hover:text-white transition-colors"
                                aria-label={label}
                            >
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Link Columns */}
                {Object.entries(footerLinks).map(([title, links]) => (
                    <div key={title}>
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/80">
                            {title}
                        </h3>
                        <ul className="space-y-2">
                            {links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-white/50 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 py-6 px-4">
                <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-xs text-center sm:text-left">
                    <p>© 2026 21:21. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <select
                            className="bg-transparent border border-white/20 px-3 py-1 text-xs text-white/60 outline-none"
                            aria-label="Select country"
                        >
                            <option>🇬🇧 United Kingdom · GBP</option>
                            <option>🇺🇸 United States · USD</option>
                            <option>🇪🇺 Europe · EUR</option>
                            <option>🇮🇳 India · INR</option>
                        </select>
                    </div>
                </div>
            </div>
        </footer>
    );
}
