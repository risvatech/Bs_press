import { Package, Factory, Wrench, CheckSquare, Truck, LucideIcon } from "lucide-react";
import Link from "next/link";

interface Service {
    icon: LucideIcon;
    step: string;
    title: string;
    slug: string;
    description: string;
    color: string;
}

const services: Service[] = [
    {
        icon: Package,
        step: "01",
        title: "Raw Material",
        slug: "raw-material",
        description: "Sourcing and inspection of high-quality materials including steel sheets, alloys, and non-ferrous metals for precision manufacturing.",
        color: "from-primary to-teal",
    },
    {
        icon: Factory,
        step: "02",
        title: "Press Shop",
        slug: "press-shop",
        description: "Precision pressing operations using advanced press tools for sheet metal components with strict dimensional accuracy.",
        color: "from-teal to-accent",
    },
    {
        icon: Wrench,
        step: "03",
        title: "Weld Shop",
        slug: "weld-shop",
        description: "Professional welding services for component assemblies, ensuring structural integrity and compliance with industry standards.",
        color: "from-accent to-orange-400",
    },
    {
        icon: CheckSquare,
        step: "04",
        title: "Inspection & Packing",
        slug: "inspection-packing",
        description: "Rigorous quality control checks and secure packaging to protect components during transit and storage.",
        color: "from-orange-400 to-primary",
    },
    {
        icon: Truck,
        step: "05",
        title: "Despatch",
        slug: "despatch",
        description: "Efficient logistics coordination for timely delivery of finished components to your facility.",
        color: "from-primary to-purple-400",
    },
];

const ServicesSection = () => {
    return (
        <section id="services" className="section-padding bg-background">
            <div className="container-section">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    <span className="inline-block px-5 py-3 text-md font-bold text-primary bg-accent/50 rounded-full uppercase tracking-wider">
                    Our Manufacturing Process
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                        End-to-End Production Workflow
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        From raw material sourcing to final dispatch, follow our comprehensive manufacturing process that ensures quality at every stage.
                    </p>
                </div>

                {/* Services Timeline */}
                <div className="relative">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-border" />

                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                        {services.map((service, index) => (
                            <Link
                                href={`/services`}
                                key={index}
                                className="relative group flex flex-col"
                            >
                                {/* Step Number */}
                                <div className={`relative z-10 w-12 h-12 flex items-center justify-center mb-6 lg:mx-auto group-hover:scale-110 transition-transform`}>
                                    <span className="text-primary text-2xl font-heading font-bold">{service.step}</span>
                                </div>

                                {/* Content Card - Flex-grow for equal height */}
                                        <div className="flex-1 lg:text-center p-6 rounded-xl bg-primary border border-border group-hover:border-teal/30 group-hover:shadow-industrial transition-all flex flex-col">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#203D60] to-[#D4DCE7] flex items-center justify-center mb-4 lg:mx-auto group-hover:scale-110 transition-transform shadow-md
                                `}
                                                 style={{
                                                     animationDelay: `${index * 150 + 300}ms`,
                                                     animationFillMode: 'forwards'
                                                 }}
                                            >
                                        <service.icon className="h-7 w-7 border-primary text-white" />
                                    </div>
                                    <h3 className="font-heading text-xl text-white mb-3 group-hover:text-accent transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-white text-sm leading-relaxed mb-4 flex-grow">
                                        {service.description}
                                    </p>
                                </div>

                                {/* Arrow (Desktop, except last) */}
                                {index < services.length - 1 && (
                                    <div className="hidden lg:block absolute top-6 right-0 translate-x-1/2 z-20">
                                        <div className="h-5 w-5 text-accent">
                                            →
                                        </div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;