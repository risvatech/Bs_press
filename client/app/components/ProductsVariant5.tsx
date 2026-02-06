"use client";

import Image from "next/image";
import img1 from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM3.jpeg";
import img2 from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM2.jpeg";
import img3 from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM.jpeg";
import img4 from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM33.jpeg";

const ProductsVariant5 = () => {
    const products = [
        {
            name: "Press Machines",
            description: "30T to 200T power presses including cross shaft and coil feeder systems",
            image: img1,
            size: "large"
        },
        {
            name: "Production Lines",
            description: "Power press and welding production lines for complete manufacturing",
            image: img2,
            size: "medium"
        },
        {
            name: "Supporting Facilities",
            description: "Raw material shop, press shop, weld shop, inspection & packing, despatch",
            image: img3,
            size: "medium"
        },
        {
            name: "Sheet Metal Parts",
            description: "Precision components and assemblies",
            image: img4,
            size: "small"
        },
        {
            name: "Welded Assemblies",
            description: "Structural and fabricated welded components",
            image: img2,
            size: "large"
        },
        {
            name: "Jigs & Fixtures",
            description: "Custom tooling and setup equipment",
            image: img3,
            size: "small"
        },
        {
            name: "Jigs & Fixtures",
            description: "Custom tooling and setup equipment",
            image: img4,
            size: "small"
        },
    ];

    return (
        <section className="py-10 lg:py-10 bg-background">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                        Machines and Equipment
                    </h2>
                </div>

                {/* Masonry Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className={`group relative rounded-lg overflow-hidden cursor-pointer ${
                                product.size === "large" ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""
                            }`}
                        >
                            <div className={`${product.size === "large" ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                            {/* Text Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-white/90">
                                    {product.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductsVariant5;