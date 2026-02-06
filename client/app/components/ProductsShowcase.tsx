'use client';

import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from "next/link";
import category1 from "../../public/product-wooden-pallet.jpg";
import category2 from "../../public/product-custom-pallet.jpg";
import category3 from "../../public/product-export-pallet.jpg";
import category4 from "../../public/product-heat-treated.jpg";
import Image, { StaticImageData } from "next/image";
import { useState, useEffect } from "react";
import productapi from "../service/productapi";

interface CategoryItem {
    image: StaticImageData;
    name: string;
    categoryId: number;
    description: string;
    color: string;
}

interface Category {
    id: number;
    name: string;
    slug?: string;
    description?: string;
}

interface ApiResponse {
    success: boolean;
    categories?: Category[];
    message?: string;
}

// Default category images and colors
const defaultCategories: CategoryItem[] = [
    {
        image: category1,
        name: "Wooden Pallets",
        categoryId: 1,
        description: "Standard and heavy-duty wooden pallets for general logistics and warehousing needs.",
        color: "from-primary to-teal",
    },
    {
        image: category2,
        name: "Custom Pallets",
        categoryId: 2,
        description: "Tailored pallet solutions designed to your exact specifications and load requirements.",
        color: "from-teal to-accent",
    },
    {
        image: category3,
        name: "Export Pallets",
        categoryId: 3,
        description: "ISPM-15 compliant pallets certified for international shipping and export.",
        color: "from-accent to-orange-400",
    },
    {
        image: category4,
        name: "Industrial Pallets",
        categoryId: 4,
        description: "Heavy-duty pallets for industrial applications and specialized storage solutions.",
        color: "from-secondary to-primary",
    },
];

const ProductsShowcase = () => {
    const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories from API and map to display format
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response: ApiResponse = await productapi.get('/productcategories');

            if (response.success && response.categories && response.categories.length > 0) {
                // Take first 4 categories and map to display format
                const apiCategories = response.categories.slice(0, 4).map((apiCat, index) => ({
                    image: defaultCategories[index]?.image || category1,
                    name: apiCat.name,
                    categoryId: apiCat.id,
                    description: apiCat.description || defaultCategories[index]?.description || "Explore our quality products",
                    color: defaultCategories[index]?.color || "from-primary to-teal",
                }));
                setCategories(apiCategories);
            } else {
                // Use default categories if API returns nothing
                setCategories(defaultCategories);
                setError(response.message || 'No categories found from API');
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            // Use default categories on error
            setCategories(defaultCategories);
            setError('Failed to load categories. Showing default categories.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle category selection (same as in products page)
    const handleCategorySelect = (categoryId: number) => {
        // Store category in localStorage
        localStorage.setItem('selectedCategory', categoryId.toString());
        localStorage.setItem('categorySelectedFromNavbar', 'true');

        // Navigate to products page
        window.location.href = '/products';
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <section id="products" className="section-padding bg-muted">
                <div className="container-section">
                    <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                        <span className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4">
                            Our Categories
                        </span>
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                            Product Categories
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Loading our product categories...
                        </p>
                    </div>
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="products" className="section-padding bg-muted">
            <div className="container-section">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    <span className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4">
                        Our Categories
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                        Product Categories
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Browse our comprehensive range of product categories designed for all your packaging and logistics needs.
                    </p>
                </div>

                {/* Error message if any */}
                {error && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Categories Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className="group card-industrial overflow-hidden cursor-pointer"
                            onClick={() => handleCategorySelect(category.categoryId)}
                        >
                            <div className="relative aspect-square overflow-hidden">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

                                {/* Category Badge */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                    <span className="text-sm font-medium text-gray-700">
                                        Category
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${category.color} mb-4`} />
                                <h3 className="font-heading text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                    {category.description}
                                </p>
                                <span className="inline-flex items-center text-sm font-semibold text-teal group-hover:text-accent transition-colors">
                                    View Products
                                    <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <Link href="/products">
                        <Button
                            variant="industrial"
                            size="lg"
                            onClick={() => {
                                // Clear any stored category when viewing all
                                localStorage.removeItem('selectedCategory');
                                localStorage.removeItem('categorySelectedFromNavbar');
                            }}
                        >
                            View All Categories
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProductsShowcase;