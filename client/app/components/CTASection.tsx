import { Button } from "../components/ui/button";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";

const CTASection = () => {
    return (
        <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-teal to-accent" />

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent/30 rounded-full blur-3xl" />

            <div className="relative container-section text-center">
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-primary-foreground mb-6 max-w-3xl mx-auto">
                    Need Reliable Pallet Packaging for Your Business?
                </h2>
                <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-10">
                    Let&apos;s discuss your requirements. Our team is ready to provide custom solutions that meet your exact specifications and delivery timelines.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <Button variant="hero" size="xl">
                       <Link href="/quote">Request a Quote</Link>
                    </Button>
                    <Button variant="hero-outline" size="xl">
                        <Link href="/contact">Contact Sales Team</Link>
                    </Button>
                </div>


                {/* Contact Info */}
                <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/90">
                    <Link
                        href="tel:+1234567890"
                        className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
                    >
                        <Phone className="h-5 w-5" />
                        <span>+1 (234) 567-890</span>
                    </Link>
                    <Link
                        href="mailto:sales@bspress.com"
                        className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
                    >
                        <Mail className="h-5 w-5" />
                        <span>sales@bspress.com</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CTASection;