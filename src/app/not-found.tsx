import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Not Found",
};

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <p className="text-hm-red text-6xl font-black mb-4" style={{ fontFamily: "Georgia, serif" }}>404</p>
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="text-hm-gray mb-8 max-w-md">
                Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="flex gap-3">
                <Link href="/" className="btn-primary text-sm">
                    Go Home
                </Link>
                <Link href="/women" className="btn-secondary text-sm">
                    Shop Now
                </Link>
            </div>
        </div>
    );
}
