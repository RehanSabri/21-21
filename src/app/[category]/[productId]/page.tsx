import { Metadata } from "next";
import { getProductById } from "@/data/products";
import ProductDetailClient from "@/components/ProductDetailClient";

type ProductParams = { category: string; productId: string };

export async function generateMetadata({ params }: { params: ProductParams }): Promise<Metadata> {
    const product = getProductById(params.productId);
    if (!product) return { title: "Product Not Found" };
    return {
        title: product.name,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            images: [product.images[0]],
        },
    };
}

export default function ProductPage() {
    return <ProductDetailClient />;
}
