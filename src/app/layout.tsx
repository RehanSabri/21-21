import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
    title: {
        default: "21:21 | Fashion and quality at the best price",
        template: "%s | 21:21",
    },
    description:
        "Shop the latest fashion trends at 21:21. Discover clothing, accessories, and home decor for women, men, kids, and home at great prices.",
    keywords: ["21:21", "fashion", "clothing", "women", "men", "kids", "home decor"],
    openGraph: {
        type: "website",
        locale: "en_GB",
        siteName: "21:21",
        title: "21:21 | Fashion and quality at the best price",
        description: "Shop the latest fashion at 21:21.",
    },
    robots: { index: true, follow: true },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <a href="#main-content" className="skip-link">
                    Skip to main content
                </a>
                <AuthProvider>
                    <CartProvider>
                        <WishlistProvider>
                            <ToastProvider>
                                <Navbar />
                                <main id="main-content" tabIndex={-1}>
                                    {children}
                                </main>
                                <Footer />
                            </ToastProvider>
                        </WishlistProvider>
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
