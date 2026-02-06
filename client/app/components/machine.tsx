import { ArrowRight } from "lucide-react";
import Image from "next/image";
import img from "../../public/WhatsApp Image 2026-01-23 at 12.45.18 PM2.jpeg";
import Link from "next/link";

const MachineServed = () => {
    return (
        <section className="py-8 lg:py-10 bg-white">
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
                        <div className="absolute -bottom-6 -right-6 bg-primary text-white p-2 rounded-lg shadow-lg hidden lg:block">
                            <div className="text-3xl lg:text-4xl font-extrabold text-accent">200T</div>
                            <div className="text-white/80 text-xs lg:text-sm ">Capacity</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:pl-6">
                        <div className="w-16 h-1 bg-gradient-to-r from-accent to-accent/70 mb-4" />
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black mb-4 lg:mb-6">
                            200T Power Press Machinery
                        </h2>
                        <p className="text-gray-600 text-base lg:text-lg mb-4 lg:mb-6 leading-relaxed">
                            High-capacity precision pressing for demanding manufacturing requirements
                        </p>
                        <p className="text-gray-600 mb-6 lg:mb-8 leading-relaxed">
                            Our flagship 200-ton power press delivers exceptional force and precision for heavy-duty
                            sheet metal forming, blanking, and piercing operations. Engineered for reliability and
                            high-volume production with consistent quality output.
                        </p>

                        {/* Key Specifications */}
                        <div className="space-y-3 mb-6 lg:mb-8">
                            {[
                                { spec: "Press Capacity", detail: "200 Tons" },
                                { spec: "Stroke Length", detail: "250 mm" },
                                { spec: "Bed Area", detail: "1500 × 800 mm" },
                                { spec: "Production Rate", detail: "Up to 600 strokes/hour" },
                                { spec: "Material Thickness", detail: "Up to 6 mm mild steel" },
                                { spec: "Operation", detail: "Fully automated with coil feeder" },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3 lg:gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-black text-sm lg:text-base">
                                            {item.spec}:
                                        </span>
                                        <span className="text-gray-600 text-sm lg:text-base ml-1">
                                            {item.detail}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Applications */}
                        <div className="mb-6 lg:mb-8">
                            <h3 className="font-semibold text-black text-lg mb-3">Primary Applications:</h3>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    "Automotive Brackets",
                                    "Structural Components",
                                    "Heavy-duty Blanks",
                                    "Chassis Parts",
                                    "Industrial Housings",
                                    "Agricultural Equipment"
                                ].map((app, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20"
                                    >
                                        {app}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MachineServed;