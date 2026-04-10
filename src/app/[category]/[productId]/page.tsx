import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductDetailClient from "@/components/ProductDetailClient";

type Props = { params: Promise<{ category: string; productId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { productId } = await params;
    const supabase = await createClient();
    const { data: product } = await supabase
        .from("products")
        .select("name, description, images")
        .eq("id", productId)
        .single();

    if (!product) return { title: "Product Not Found" };
    return {
        title: product.name,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.images?.[0] ? [product.images[0]] : [],
        },
    };
}

export default function ProductPage() {
    return <ProductDetailClient />;
}
