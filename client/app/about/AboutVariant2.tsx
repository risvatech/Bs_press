const AboutVariant2 = () => {
    const stats = [
        { value: "20+", label: "Years Experience" },
        { value: "200+", label: "Press Tool Designs" },
        { value: "15K+", label: "Components Monthly" },
        { value: "99.2%", label: "Quality Rate" },
    ];

    return (
        <section className="py-16 lg:py-20 bg-gradient-to-br from-primary via-steel to-steel text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
                    <div className="w-12 h-1 bg-accent mx-auto mb-4 lg:mb-6" />
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-white mb-4 lg:mb-6">
                        Precision Manufacturing Excellence
                    </h2>
                    <p className="text-base md:text-lg text-white leading-relaxed">
                        With decades of expertise in press tools, sheet metal fabrication, and welded assemblies,
                        we deliver components that exceed industry standards and customer expectations.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center p-4 lg:p-6 border border-white/10 rounded-lg hover:border-accent/50 transition-colors duration-300 bg-white/5 backdrop-blur-sm"
                        >
                            <div className="font-heading text-3xl lg:text-4xl font-bold text-accent mb-1 lg:mb-2">{stat.value}</div>
                            <div className="text-xs lg:text-sm uppercase tracking-wider text-white font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Content Columns - Updated with your content */}
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="p-6 lg:p-8 bg-white/5 backdrop-blur-sm rounded-lg border-l-4 border-accent">
                        <h3 className="text-lg lg:text-xl font-heading font-bold text-white mb-3 lg:mb-4">
                            Our Mission
                        </h3>
                        <p className="text-sm lg:text-base text-white leading-relaxed">
                            To deliver high-quality precision components with exceptional service at competitive costs,
                            building lasting partnerships through reliability and innovation.
                        </p>
                    </div>

                    <div className="p-6 lg:p-8 bg-white/5 backdrop-blur-sm rounded-lg border-l-4 border-accent">
                        <h3 className="text-lg lg:text-xl font-heading font-bold text-white mb-3 lg:mb-4">
                            Our Vision
                        </h3>
                        <p className="text-sm lg:text-base text-white leading-relaxed">
                            To be the preferred manufacturing partner for precision components across industries,
                            pioneering technological advancements in metal fabrication.
                        </p>
                    </div>

                    <div className="p-6 lg:p-8 bg-white/5 backdrop-blur-sm rounded-lg border-l-4 border-accent">
                        <h3 className="text-lg lg:text-xl font-heading font-bold text-white mb-3 lg:mb-4">
                            Our Values
                        </h3>
                        <p className="text-sm lg:text-base text-white leading-relaxed">
                            Commitment to quality, customer-centric solutions, continuous improvement,
                            and ethical practices in every aspect of our manufacturing operations.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutVariant2;