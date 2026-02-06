import { ArrowRight } from "lucide-react";
import Image from "next/image";
import img from "../../public/WhatsApp Image 2026-01-23 at 12.45.18 PM2.jpeg";
import Link from "next/link";

const AboutVariant1 = () => {
    return (
        <section className="py-16 lg:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Large Manufacturing Image */}
                    <div className="relative">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
                            <div className="relative w-full h-full">
                                <Image
                                    src={img}
                                    alt="Precision manufacturing facility for press tools and metal components"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                        {/* Floating Stats Card */}
                        <div className="absolute -bottom-6 -right-6 bg-primary text-white p-4 lg:p-5 rounded-lg shadow-lg hidden lg:block">
                            <div className="text-3xl lg:text-4xl font-extrabold text-accent">20+</div>
                            <div className="text-white/80 text-xs lg:text-sm mt-1">Years in Manufacturing</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:pl-6">
                        <div className="w-16 h-1 bg-gradient-to-r from-accent to-accent/70 mb-4" />
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black mb-4 lg:mb-6">
                            Precision Engineering & Manufacturing Excellence
                        </h2>
                        <p className="text-gray-600 text-base lg:text-lg mb-4 lg:mb-6 leading-relaxed">
                            As specialized manufacturers of Press Tools, Sheet Metal Pressed Components, Welded Assemblies,
                            Jigs & Fixtures, and Non-Ferrous Components, we combine traditional craftsmanship with modern
                            manufacturing technologies to deliver precision solutions.
                        </p>
                        <p className="text-gray-600 mb-6 lg:mb-8 leading-relaxed">
                            Our state-of-the-art facility in Hosur is equipped with advanced machinery including multiple
                            power presses (200T to 30T) and coil feeding systems, enabling us to produce high-quality
                            components for automotive, engineering, and industrial clients.
                        </p>

                        {/* Key Capabilities */}
                        <div className="space-y-3 mb-6 lg:mb-8">
                            {[
                                { area: "Press Tool Design", detail: "Custom tooling for precision pressing" },
                                { area: "Sheet Metal Fabrication", detail: "200T to 30T power press operations" },
                                { area: "Welded Assemblies", detail: "Professional welding & structural fabrication" },
                                { area: "Jigs & Fixtures", detail: "Custom tooling for assembly & inspection" },
                            ].map((capability, index) => (
                                <div key={index} className="flex items-start gap-3 lg:gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-black text-sm lg:text-base">
                                            {capability.area}:
                                        </span>
                                        <span className="text-gray-600 text-sm lg:text-base ml-1">
                                            {capability.detail}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="group inline-flex items-center justify-center rounded-md bg-primary px-6 lg:px-8 py-2.5 lg:py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                            <Link href="/capabilities">Explore Our Capabilities</Link>
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutVariant1;