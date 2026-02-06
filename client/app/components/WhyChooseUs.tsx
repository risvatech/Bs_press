import { Check } from "lucide-react";

interface Reason {
    title: string;
    description: string;
}

const reasons: Reason[] = [
    {
        title: "Precision Manufacturing",
        description: "State-of-the-art press tools and machinery for exact component specifications",
    },
    {
        title: "Quality Assurance",
        description: "Rigorous inspection at every stage from raw material to final dispatch",
    },
    {
        title: "Multi-Process Capability",
        description: "Complete in-house services: Pressing, Welding, Assembly & Finishing",
    },
    {
        title: "Custom Engineering",
        description: "Specialized Jigs, Fixtures, and Tooling design for unique requirements",
    },
    {
        title: "Material Expertise",
        description: "Expert handling of both ferrous and non-ferrous metal components",
    },
    {
        title: "Timely Delivery",
        description: "Efficient workflow management ensuring on-time project completion",
    },
];

const WhyChooseUs = () => {
    return (
        <section className="py-16 md:py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                    {/* Content */}
                    <div>

                        <span className="inline-block px-5 py-3 text-md font-bold text-primary bg-accent/50 rounded-full uppercase tracking-wider">
  Why Choose Us
</span>
                        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl text-black mb-5">
                            Your Precision Manufacturing Partner
                        </h2>
                        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                            With decades of experience in press tools, sheet metal fabrication, and welded assemblies,
                            we deliver components that meet the highest standards of precision and reliability.
                        </p>
                    </div>

                    {/* Checklist */}
                    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                        {reasons.map((reason, index) => (
                            <div
                                key={index}
                                className="flex gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-accent/30 hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/60 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-black text-sm md:text-base mb-1">{reason.title}</h3>
                                    <p className="text-xs md:text-sm text-gray-600">{reason.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;