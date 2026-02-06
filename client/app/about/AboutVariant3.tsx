import React from "react";

const AboutVariant3 = () => {
    const timeline = [
        {
            year: "2003",
            title: "Foundation of Excellence",
            description: "Started as a precision engineering workshop specializing in custom press tools and jigs for local industries.",
        },
        {
            year: "2010",
            title: "Industrial Expansion",
            description: "Established dedicated press shop and weld shop facilities, expanding into sheet metal fabrication and welded assemblies.",
        },
        {
            year: "2015",
            title: "Automotive Partnerships",
            description: "Became trusted supplier to major automotive companies including Rucha Engineers, Indo Autotech, and Rajsriya Automotive.",
        },
        {
            year: "2020",
            title: "Technology Advancement",
            description: "Upgraded facility with 200T power press and coil feeding systems, enhancing production capacity and precision capabilities.",
        },
        {
            year: "2024",
            title: "Manufacturing Leadership",
            description: "Expanded services to include complete non-ferrous components production and custom tooling solutions for diverse industries.",
        },
    ];

    return (
        <section className="py-16 lg:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header */}
                <div className="max-w-2xl mb-12 lg:mb-16">
                    <div className="w-16 h-1.5 bg-accent mb-4 lg:mb-6" />
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black mb-4 lg:mb-6">
                        Our Manufacturing Journey
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                        From a precision engineering workshop to a comprehensive manufacturing facility,
                        each milestone reflects our commitment to quality, innovation, and customer partnerships.
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 lg:left-1/2 lg:transform lg:-translate-x-px top-0 bottom-0 w-0.5 bg-gray-200" />

                    <div className="">
                        {timeline.map((item, index) => (
                            <div
                                key={index}
                                className={`relative flex items-start gap-6 ${
                                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                                } mb-8 lg:mb-12`}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-4 lg:left-1/2 transform -translate-x-1/2 z-10">
                                    <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-accent border-4 border-white shadow-md" />
                                </div>

                                {/* Content Card */}
                                <div
                                    className={`ml-10 lg:ml-0 lg:w-1/2 ${
                                        index % 2 === 0 ? "lg:pr-8 lg:text-right" : "lg:pl-8"
                                    }`}
                                >
                                    <div className="bg-gray-50 p-5 lg:p-6 rounded-lg border border-gray-200 hover:border-accent/30 hover:shadow-md transition-all duration-300">
                                        <span className="inline-block text-accent font-heading font-bold text-xl lg:text-2xl mb-1 lg:mb-2">
                                            {item.year}
                                        </span>
                                        <h3 className="text-lg lg:text-xl font-heading font-bold text-black mb-2 lg:mb-3">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Empty space for alignment */}
                                <div className="hidden lg:block lg:w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutVariant3;