import { Star, Quote } from "lucide-react";
import Image from "next/image";

interface Testimonial {
    name: string;
    role: string;
    company: string;
    image: string;
    content: string;
    rating: number;
}

const testimonials: Testimonial[] = [
    {
        name: "Robert Anderson",
        role: "Supply Chain Director",
        company: "GlobalTech Industries",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        content: "BS Press has been our trusted partner for over 5 years. Their custom pallets have significantly reduced our product damage rates and improved our warehouse efficiency.",
        rating: 5,
    },
    {
        name: "Sarah Mitchell",
        role: "Operations Manager",
        company: "FastMove Logistics",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        content: "The quality and consistency of their heat-treated pallets is outstanding. They've helped us meet all ISPM-15 requirements for our international shipments without any issues.",
        rating: 5,
    },
    {
        name: "Michael Chen",
        role: "Procurement Head",
        company: "MedSupply Corp",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        content: "Exceptional service and reliability. Their bulk order capabilities and on-time delivery have made them indispensable to our pharmaceutical distribution network.",
        rating: 5,
    },
];

interface Stat {
    value: string;
    label: string;
}

const stats: Stat[] = [
    { value: "500+", label: "Happy Clients" },
    { value: "2M+", label: "Pallets Delivered" },
    { value: "98%", label: "On-Time Delivery" },
    { value: "25+", label: "Years Experience" },
];

const TestimonialsSection = () => {
    return (
        <section className="section-padding bg-primary overflow-hidden">
            <div className="container-section">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-4">
            Client Testimonials
          </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-primary-foreground mb-6">
                        Trusted by Industry Leaders
                    </h2>
                    <p className="text-primary-foreground/80 text-lg">
                        Hear from businesses that have transformed their logistics with our quality pallet solutions.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="relative bg-card rounded-xl p-8 shadow-industrial-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Quote Icon */}
                            <div className="absolute -top-4 left-8">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent to-orange-400 flex items-center justify-center shadow-lg">
                                    <Quote className="h-5 w-5 text-accent-foreground" />
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4 pt-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-foreground/80 leading-relaxed mb-6 italic">
                                &quot;{testimonial.content}&quot;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14">
                                    <Image
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        fill
                                        className="rounded-full object-cover ring-2 ring-teal/30"
                                        sizes="56px"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    <p className="text-sm font-medium text-teal">{testimonial.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="font-heading text-4xl md:text-5xl text-accent mb-2">{stat.value}</div>
                            <div className="text-primary-foreground/70 text-sm uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;