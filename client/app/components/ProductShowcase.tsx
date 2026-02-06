"use client"

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import img1 from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM3.jpeg";
import img2 from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM2.jpeg";
import img3 from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM.jpeg";
import img4 from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM33.jpeg";
import Image from "next/image";


const categories = [
    { id: "all", label: "All Machinery" },
    { id: "power", label: "Power Presses" },
    { id: "hydraulic", label: "Hydraulic Presses" },
    { id: "coil", label: "Coil Feeders" },
    { id: "welding", label: "Welding Systems" },
];

const products = [
    {
        id: 1,
        category: "power",
        name: "200T Power Press",
        image: img1,
        type: "Mechanical Power Press",
    },
    {
        id: 2,
        category: "power",
        name: "150T Power Press",
        image: img2,
        type: "High-Speed Press",
    },
    {
        id: 3,
        category: "hydraulic",
        name: "100T Hydraulic Press",
        image: img3,
        type: "Deep Drawing Press",
    },
    {
        id: 4,
        category: "coil",
        name: "Coil Feeding System",
        image: img4,
        type: "Servo Coil Feeder",
    },
    {
        id: 5,
        category: "power",
        name: "80T Power Press",
        image: img1,
        type: "Straight Side Press",
    },
    {
        id: 6,
        category: "hydraulic",
        name: "50T Hydraulic Press",
        image: img2,
        type: "C-Frame Press",
    },
    {
        id: 7,
        category: "welding",
        name: "Spot Welding Machine",
        image: img4,
        type: "Robotic Welding",
    },
    {
        id: 8,
        category: "welding",
        name: "MIG Welding Station",
        image: img3,
        type: "Industrial MIG Welder",
    },
];

const ProductShowcase = () => {
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <section className="relative py-12 lg:py-16 bg-background overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 grid-pattern opacity-5" />
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full opacity-15"
                style={{ background: "var(--gradient-glow)" }}
            />

            <div className="container relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-5 py-3 text-md font-bold text-primary bg-accent/50 rounded-full uppercase tracking-wider">
  Machinery Catalog
</span>
                    <h2 className="text-3xl lg:text-6xl font-bold text-foreground mb-6">
                        Industrial <span className="text-gradient-yellow">Press Machinery</span>
                    </h2>
                    <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                        High-quality press machines and manufacturing equipment for precision engineering.
                    </p>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-wrap justify-center gap-2 lg:gap-4 mb-12"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`relative px-4 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-medium uppercase tracking-wider transition-all duration-300 ${
                                activeCategory === cat.id
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground border border-border hover:border-primary/50"
                            }`}
                        >
                            {activeCategory === cat.id && (
                                <motion.div
                                    layoutId="activeCategory"
                                    className="absolute inset-0 bg-primary"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{cat.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Products Grid */}
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="group"
                            >
                                <div className="glass-card overflow-hidden hover:bg-muted/30 transition-all duration-500">
                                    {/* Image */}
                                    <div className="relative aspect-square overflow-hidden">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 lg:p-6">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                                {product.name}
                                            </h3>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-4">
                                            {product.type}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

            </div>
        </section>
    );
};

export default ProductShowcase;