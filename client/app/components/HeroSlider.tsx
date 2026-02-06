"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroSlide1 from "../../public/hero-slide-1.jpg";
import heroSlide2 from "../../public/hero-slide-2.jpg";
import heroSlide3 from "../../public/hero-slide-3.jpg";
import Image from "next/image";
import Link from "next/link";

const slides = [
    {
        image: heroSlide1,
        headline: "Strong. Reliable. Export-Ready Pallet Packaging",
        description: "Premium quality wooden pallets engineered for demanding logistics and international shipping requirements.",
    },
    {
        image: heroSlide2,
        headline: "Custom Pallets Engineered for Heavy-Duty Logistics",
        description: "State-of-the-art manufacturing facility delivering precision-crafted pallets tailored to your specifications.",
    },
    {
        image: heroSlide3,
        headline: "Sustainable & Certified Pallet Manufacturing",
        description: "Eco-friendly production processes with ISPM-15 certification for compliant international trade.",
    },
];

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    return (
        <section className="relative h-[70vh] min-h-[500px] max-h-[800px] bg-gradient-to-br from-primary via-primary to-teal overflow-hidden">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-transparent z-10" />

                    {/* Content Container */}
                    <div className="relative h-full container-section flex items-center justify-between gap-8 z-20">
                        {/* Text Content - Left Side (50% width) */}
                        <div className="w-full lg:w-1/2 max-w-2xl">
                            <h1
                                className={`font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 leading-tight transition-all duration-700 ${
                                    index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                                }`}
                            >
                                {slide.headline}
                            </h1>
                            <p
                                className={`text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed transition-all duration-700 delay-200 ${
                                    index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                                }`}
                            >
                                {slide.description}
                            </p>
                            <div
                                className={`flex flex-wrap gap-4 transition-all duration-700 delay-300 ${
                                    index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                                }`}
                            >
                                <Button variant="hero" size="xl">
                                   <Link href="/quote">Get a Quote</Link>
                                </Button>
                                <Button variant="hero-outline" size="xl">
                                    <Link href="/products">View Products</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Image Container - Right Side (50% width) */}
                        <div className="hidden lg:flex w-1/2 items-center justify-end">
                            <div className="relative w-[550px] h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src={slide.image}
                                    alt={`Slide ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Desktop Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center text-primary-foreground transition-all duration-200 z-30"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={nextSlide}
                className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center text-primary-foreground transition-all duration-200 z-30"
                aria-label="Next slide"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Mobile Navigation Arrows (Bottom Center) */}
            <div className="lg:hidden absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
                <button
                    onClick={prevSlide}
                    className="w-12 h-12 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center text-primary-foreground transition-all duration-200"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                {/* Dots */}
                <div className="flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentSlide
                                    ? "bg-primary-foreground w-8"
                                    : "bg-primary-foreground/50 hover:bg-primary-foreground/70"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                            aria-current={index === currentSlide ? "true" : "false"}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="w-12 h-12 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center text-primary-foreground transition-all duration-200"
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            {/* Desktop Dots (Below mobile navigation) */}
            <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 gap-3 z-30">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentSlide
                                ? "bg-primary-foreground w-8"
                                : "bg-primary-foreground/50 hover:bg-primary-foreground/70"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === currentSlide ? "true" : "false"}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSlider;