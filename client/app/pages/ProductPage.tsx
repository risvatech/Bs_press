"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Check, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import productWooden from "../../public/product-wooden-pallet.jpg";
import productCustom from "../../public/product-custom-pallet.jpg";
import productExport from "../../public/product-export-pallet.jpg";
import productHeatTreated from "../../public/product-heat-treated.jpg";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

interface Specification {
    label: string;
    value: string;
}

interface ProductData {
    name: string;
    image: StaticImageData;
    tagline: string;
    description: string;
    features: string[];
    specifications: Specification[];
}

const productsData: Record<string, ProductData> = {
    "wooden-pallets": {
        name: "Wooden Pallets",
        image: productWooden,
        tagline: "Reliable foundation for your logistics operations",
        description: "Our standard wooden pallets are crafted from premium-grade timber, designed to handle the demands of modern warehousing and logistics. Built for durability and consistent performance, these pallets are the backbone of efficient supply chains across industries.",
        features: [
            "Premium quality hardwood construction",
            "Multiple size configurations available",
            "Suitable for racking and stacking",
            "Cost-effective bulk pricing",
            "Recyclable and eco-friendly",
            "Compatible with standard forklifts",
        ],
        specifications: [
            { label: "Standard Sizes", value: "1200x800mm, 1200x1000mm, 1100x1100mm" },
            { label: "Load Capacity", value: "Up to 1500 kg dynamic load" },
            { label: "Wood Type", value: "Pine, Hardwood, Mixed" },
            { label: "Entry Type", value: "2-way or 4-way entry" },
            { label: "Min. Order", value: "100 units" },
        ],
    },
    "custom-pallets": {
        name: "Custom Pallets",
        image: productCustom,
        tagline: "Engineered to your exact specifications",
        description: "When standard solutions don't fit, our custom pallet engineering team works with you to design pallets that perfectly match your product dimensions, weight requirements, and handling specifications. From unique sizes to specialized features, we deliver tailored solutions.",
        features: [
            "Bespoke dimensions and configurations",
            "Specialized load-bearing designs",
            "Integration with automated systems",
            "Custom branding options available",
            "Prototype development and testing",
            "Flexible material combinations",
        ],
        specifications: [
            { label: "Custom Sizes", value: "Any dimension up to 3000x3000mm" },
            { label: "Load Capacity", value: "Engineered to requirement" },
            { label: "Materials", value: "Wood, Plywood, Composite" },
            { label: "Lead Time", value: "2-4 weeks for custom designs" },
            { label: "Min. Order", value: "50 units" },
        ],
    },
    "export-pallets": {
        name: "Export Pallets",
        image: productExport,
        tagline: "ISPM-15 compliant for global shipping",
        description: "Our export pallets meet all international phytosanitary standards, ensuring your shipments clear customs smoothly across borders. Each pallet is heat-treated and certified with the official ISPM-15 stamp, making international trade hassle-free.",
        features: [
            "Full ISPM-15 compliance",
            "Heat treatment certification",
            "Official stamp and documentation",
            "Accepted in 180+ countries",
            "Moisture-controlled processing",
            "Export documentation support",
        ],
        specifications: [
            { label: "Certification", value: "ISPM-15, IPPC Approved" },
            { label: "Treatment", value: "Heat Treatment (HT) at 56°C for 30 min" },
            { label: "Standard Sizes", value: "EUR, US, Asia-Pacific formats" },
            { label: "Documentation", value: "Certificate of treatment included" },
            { label: "Min. Order", value: "200 units" },
        ],
    },
    "heat-treated-pallets": {
        name: "Heat Treated Pallets",
        image: productHeatTreated,
        tagline: "Pest-free, regulation-ready pallets",
        description: "Our state-of-the-art heat treatment facility ensures complete pest elimination while maintaining wood integrity. These pallets are essential for industries requiring the highest hygiene standards and for shipments to countries with strict phytosanitary regulations.",
        features: [
            "Complete pest elimination",
            "No chemical treatments used",
            "Maintains wood strength",
            "Suitable for food & pharma",
            "Reduced moisture content",
            "Long-term storage stability",
        ],
        specifications: [
            { label: "Treatment Standard", value: "ISPM-15 / IPPC" },
            { label: "Core Temperature", value: "56°C maintained for 30 minutes" },
            { label: "Moisture Reduction", value: "Below 20% moisture content" },
            { label: "Certification", value: "Individual batch certification" },
            { label: "Min. Order", value: "100 units" },
        ],
    },
};

const ProductPage = () => {
    const params = useParams();
    const slug = params?.slug as string;
    const product = slug ? productsData[slug] : null;

    if (!product) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="container-section section-padding text-center">
                    <h1 className="font-heading text-4xl mb-4">Product Not Found</h1>
                    <Link href="/#products">
                        <Button variant="industrial">Back to Products</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const otherProducts = Object.entries(productsData)
        .filter(([key]) => key !== slug)
        .slice(0, 3);

    return (
        <div className="min-h-screen">
            <Navbar />

            <main>
                {/* Breadcrumb */}
                <div className="bg-muted border-b border-border">
                    <div className="container-section py-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
                            <span className="text-muted-foreground">/</span>
                            <Link href="/#products" className="text-muted-foreground hover:text-primary">Products</Link>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-foreground font-medium">{product.name}</span>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary via-primary to-teal py-16 md:py-24">
                    <div className="container-section">
                        <Link href="/#products" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-8 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Products
                        </Link>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                <span className="inline-block px-4 py-1 bg-accent/20 text-accent rounded-full text-sm font-semibold mb-4">
                  Premium Quality
                </span>
                                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-4">
                                    {product.name}
                                </h1>
                                <p className="text-xl text-primary-foreground/90 mb-8">
                                    {product.tagline}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button variant="hero" size="xl">
                                        Request Quote
                                    </Button>
                                    <Button variant="hero-outline" size="lg">
                                        Download Specs
                                    </Button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="rounded-2xl overflow-hidden shadow-2xl">
                                    <div className="relative w-full h-[400px]">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority
                                        />
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/30 rounded-full blur-2xl" />
                                <div className="absolute -top-4 -left-4 w-32 h-32 bg-teal/30 rounded-full blur-2xl" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Description & Features */}
                <section className="section-padding bg-background">
                    <div className="container-section">
                        <div className="grid lg:grid-cols-2 gap-16">
                            {/* Description */}
                            <div>
                                <h2 className="font-heading text-3xl text-foreground mb-6">Product Overview</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                                    {product.description}
                                </p>

                                {/* Features */}
                                <h3 className="font-heading text-xl text-foreground mb-4">Key Features</h3>
                                <div className="grid gap-3">
                                    {product.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal to-teal/70 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-4 w-4 text-teal-foreground" />
                                            </div>
                                            <span className="text-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specifications */}
                            <div>
                                <div className="bg-muted rounded-xl p-8">
                                    <h3 className="font-heading text-2xl text-foreground mb-6">Specifications</h3>
                                    <div className="space-y-4">
                                        {product.specifications.map((spec, index) => (
                                            <div key={index} className="flex justify-between items-start py-3 border-b border-border last:border-0">
                                                <span className="text-muted-foreground font-medium">{spec.label}</span>
                                                <span className="text-foreground text-right max-w-[60%]">{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-6 bg-gradient-to-r from-accent/10 to-teal/10 rounded-lg border border-accent/20">
                                        <h4 className="font-semibold text-foreground mb-2">Need Custom Specifications?</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Our engineering team can design pallets to meet your exact requirements.
                                        </p>
                                        <Button variant="teal" size="sm">
                                            Contact Engineering Team
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-gradient-to-r from-accent via-orange-400 to-accent">
                    <div className="container-section text-center">
                        <h2 className="font-heading text-3xl md:text-4xl text-accent-foreground mb-4">
                            Ready to Order {product.name}?
                        </h2>
                        <p className="text-accent-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
                            Get a competitive quote tailored to your volume and delivery requirements.
                        </p>
                        <Button variant="outline" size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0">
                            Get Your Quote Today
                        </Button>
                    </div>
                </section>

                {/* Related Products */}
                <section className="section-padding bg-muted">
                    <div className="container-section">
                        <h2 className="font-heading text-3xl text-foreground mb-8">Other Products</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {otherProducts.map(([key, prod]) => (
                                <Link
                                    key={key}
                                    href={`/products/${key}`}
                                    className="group card-industrial overflow-hidden"
                                >
                                    <div className="aspect-video overflow-hidden">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={prod.image}
                                                alt={prod.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-heading text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                                            {prod.name}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-4">{prod.tagline}</p>
                                        <span className="inline-flex items-center text-sm font-semibold text-teal group-hover:text-accent transition-colors">
                      View Product
                      <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ProductPage;