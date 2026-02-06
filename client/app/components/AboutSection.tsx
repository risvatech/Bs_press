import { CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import aboutFactory from "../../public/WhatsApp Image 2026-01-23 at 12.45.18 PM.jpeg";
import Image from "next/image";
import Link from "next/link";

const features = [
    "Precision Press Tool Manufacturing",
    "Custom Sheet Metal Pressed Components",
    "Professional Welded Assemblies",
    "Specialized Jigs & Fixtures Design",
    "Non-Ferrous Components Production",
    "Quality-Driven Manufacturing Processes",
];

const AboutSection = () => {
    return (
        <section id="about" className="section-padding bg-background">
            <div className="container-section">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Content */}
                    <div className="order-2 lg:order-1">
                        <span className="inline-block px-5 py-3 text-md font-bold text-primary bg-accent/50 rounded-full uppercase tracking-wider">
  About Our Manufacturing
</span>
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                            Precision Engineering & Manufacturing Excellence
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                            As specialized manufacturers of Press Tools, Sheet Metal Pressed Components, Welded Assemblies, Jigs & Fixtures, and Non-Ferrous Components, we bring precision and reliability to every project. Our expertise spans across multiple manufacturing disciplines to deliver comprehensive solutions.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-8">
                            We combine traditional craftsmanship with modern manufacturing technologies to produce components that meet exact specifications. From prototype development to volume production, we ensure each product maintains the highest standards of quality and performance.
                        </p>

                        {/* Features List */}
                        <div className="grid sm:grid-cols-2 gap-3 mb-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                                    <span className="text-foreground">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button variant="industrial" size="lg">
                            <Link href="/about">Explore Our Capabilities</Link>
                        </Button>
                    </div>

                    {/* Image */}
                    <div className="order-1 lg:order-2 relative">
                        <div className="relative rounded-lg overflow-hidden shadow-industrial-xl">
                            <Image
                                src={aboutFactory}
                                alt="Manufacturing facility for press tools and metal components"
                                className="w-full h-[400px] md:h-[500px] object-cover"
                                width={800}
                                height={600}
                                priority={false}
                            />
                        </div>
                        {/* Accent decoration */}
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent/20 rounded-lg -z-10" />
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-lg -z-10" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;