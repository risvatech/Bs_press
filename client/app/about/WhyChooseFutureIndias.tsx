import { ArrowRight, CheckCircle, Factory, Wrench, Package, Truck } from "lucide-react";
import Image from "next/image";
import img from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM3.jpeg";
import img1 from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM2.jpeg";
import yourQualityCheckImage from "../../public/WhatsApp Image 2026-01-23 at 12.45.19 PM.jpeg";
import Link from "next/link";

const WhyChooseUsBS = () => {
    return (
        <section className="py-16 lg:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Content */}
                    <div className="lg:pr-6">
                        <div className="w-16 h-1 bg-gradient-to-r from-accent to-accent/70 mb-4" />
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black mb-4 lg:mb-6">
                            Why Partner With Us?
                        </h2>
                        <p className="text-gray-600 text-base lg:text-lg mb-6 lg:mb-8 leading-relaxed">
                            As your trusted manufacturing partner, we provide comprehensive precision engineering solutions
                            that combine technical expertise with production excellence. Our integrated approach ensures
                            quality at every stage from design to delivery.
                        </p>

                        {/* Key Features */}
                        <div className="space-y-4 lg:space-y-5 mb-6 lg:mb-8">
                            {[
                                {
                                    icon: Factory,
                                    title: "End-to-End Manufacturing",
                                    description: "Complete in-house capabilities from press tools to final assembly",
                                },
                                {
                                    icon: Wrench,
                                    title: "Precision Engineering",
                                    description: "Specialized in jigs, fixtures, and custom tooling design",
                                },
                                {
                                    icon: Package,
                                    title: "Quality Assurance",
                                    description: "Rigorous inspection at every production stage",
                                },
                                {
                                    icon: Truck,
                                    title: "Reliable Delivery",
                                    description: "Timely dispatch with efficient logistics coordination",
                                },
                                {
                                    title: "Multi-Material Expertise",
                                    description: "Expert handling of both ferrous and non-ferrous metals",
                                },
                                {
                                    title: "Scalable Production",
                                    description: "Flexible capacity from prototypes to volume manufacturing",
                                },
                            ].map((feature, index) => (
                                <div key={index} className="flex items-start gap-3 lg:gap-4">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {feature.icon ? (
                                            <feature.icon className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-black text-sm lg:text-base mb-0.5">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 text-xs lg:text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="group inline-flex items-center justify-center rounded-md bg-primary px-6 lg:px-8 py-2.5 lg:py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                            <Link href="/services">View Our Manufacturing Services</Link>
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    {/* Right Image Grid */}
                    <div className="relative">
                        <div className="grid grid-cols-2 gap-3 lg:gap-4">
                            {/* Main Factory Image */}
                            <div className="col-span-2 relative aspect-[16/9] rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                    src={img}
                                    alt="Precision manufacturing facility for metal components"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                {/* Text Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3 lg:p-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-accent/20 flex items-center justify-center mr-2 lg:mr-3">
                                            <Factory className="w-4 h-4 lg:w-5 lg:h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-base lg:text-lg">Advanced Manufacturing Facility</p>
                                            <p className="text-xs lg:text-sm text-white/90">Hosur, Tamil Nadu</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quality Check Image */}
                            <div className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
                                <Image
                                    src={yourQualityCheckImage}
                                    alt="Precision component quality inspection"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                {/* Dark overlay for better text visibility */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

                                {/* Text Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-accent flex items-center justify-center mr-2">
                                            <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">Quality Inspection</p>
                                            <p className="text-xs text-white/90 mt-0.5">Precision components</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Production Image */}
                            <div className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
                                <Image
                                    src={img1}
                                    alt="Manufacturing production line for metal components"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                {/* Dark overlay for better text visibility */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

                                {/* Text Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-primary flex items-center justify-center mr-2">
                                            <Package className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">Production Line</p>
                                            <p className="text-xs text-white/90 mt-0.5">Volume manufacturing</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUsBS;