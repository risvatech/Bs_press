import { Award, Shield, Package, Truck, LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Highlight {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
}

const highlights: Highlight[] = [
    {
        icon: Award,
        title: "25+ Years",
        description: "Manufacturing Experience",
        color: "from-primary to-teal",
    },
    {
        icon: Shield,
        title: "ISPM-15",
        description: "Certified Facility",
        color: "from-primary to-accent",
    },
    {
        icon: Package,
        title: "Custom & Bulk",
        description: "Order Flexibility",
        color: "from-accent to-orange-400",
    },
    {
        icon: Truck,
        title: "On-Time",
        description: "Delivery Guarantee",
        color: "from-orange-400 to-yellow-500",
    },
];

const TrustHighlights = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1, // Trigger when 10% of the section is visible
                rootMargin: '0px 0px -50px 0px' // Slight bottom margin for earlier trigger
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="bg-card border-b border-border"
        >
            <div className="container-section py-12 md:py-16">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 ">
                    {highlights.map((item, index) => (
                        <div
                            key={index}
                            className={`flex flex-col items-center text-center p-6 rounded-xl  bg-primary hover:shadow-industrial-lg transition-all duration-300 group border border-transparent hover:border-teal/20
                                ${isVisible ? "animate-in" : "opacity-0 translate-y-8"}`}
                            style={{
                                animationDelay: `${index * 150}ms`,
                                animationFillMode: 'forwards'
                            }}
                        >
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#203D60] to-[#D4DCE7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md
                                ${isVisible ? 'animate-icon-scale' : 'scale-0'}`}
                                 style={{
                                     animationDelay: `${index * 150 + 300}ms`,
                                     animationFillMode: 'forwards'
                                 }}
                            >
                                <item.icon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`font-heading text-xl md:text-2xl text-white mb-1
                                ${isVisible ? 'animate-text-slide' : 'opacity-0 translate-x-4'}`}
                                style={{
                                    animationDelay: `${index * 150 + 450}ms`,
                                    animationFillMode: 'forwards'
                                }}
                            >
                                {item.title}
                            </h3>
                            <p className={`text-sm text-white
                                ${isVisible ? 'animate-text-fade' : 'opacity-0'}`}
                               style={{
                                   animationDelay: `${index * 150 + 600}ms`,
                                   animationFillMode: 'forwards'
                               }}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes iconScale {
                    0% {
                        opacity: 0;
                        transform: scale(0) rotate(-180deg);
                    }
                    70% {
                        transform: scale(1.1) rotate(10deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }

                @keyframes textSlide {
                    from {
                        opacity: 0;
                        transform: translateX(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes textFade {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-in {
                    animation: slideIn 0.6s ease-out;
                }

                .animate-icon-scale {
                    animation: iconScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .animate-text-slide {
                    animation: textSlide 0.5s ease-out;
                }

                .animate-text-fade {
                    animation: textFade 0.5s ease-out;
                }
            `}</style>
        </section>
    );
};

export default TrustHighlights;