import { Metadata } from "next";
import CategoryClient from "@/components/CategoryClient";

type CategoryParams = { category: string };

export async function generateMetadata({ params }: { params: CategoryParams }): Promise<Metadata> {
    const { category } = params;
    const title = category.charAt(0).toUpperCase() + category.slice(1);
    return {
        title: `${title} Clothing`,
        description: `Shop ${title} clothing, accessories, and more at 21:21. New styles added daily.`,
    };
}

export function generateStaticParams() {
    return [
        { category: "women" },
        { category: "men" },
        { category: "kids" },
        { category: "home" },
        { category: "sale" },
    ];
}

export default function CategoryPage({ params }: { params: CategoryParams }) {
    return <CategoryClient category={params.category} />;
}
