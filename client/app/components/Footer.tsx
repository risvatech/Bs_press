import { MapPin, Phone, Mail, Clock, Factory, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import Logo from "@/public/future-indias-logo.png";
import Image from "next/image";

const Footer = () => {
    return (
        <footer className="bg-foreground text-primary-foreground/80">
            <div className="container-section py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                    {/* Company Info - Column 1 */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                                <span className="text-primary-foreground font-heading font-bold text-lg">BS</span>
                            </div>
                            <div>
                                <span className="font-heading font-bold text-lg text-primary-foreground">Press</span>
                                <span className="block text-xs text-primary-foreground/60 -mt-1">Products</span>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            Leading manufacturer of precision press tools, sheet metal components, and industrial assemblies. Serving businesses nationwide with reliable, high-quality solutions.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Factory className="h-5 w-5 flex-shrink-0 text-accent" />
                                <span>ISO Certified Manufacturing</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-accent" />
                                <span>Quality Assured Products</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Users className="h-5 w-5 flex-shrink-0 text-accent" />
                                <span>Expert Engineering Team</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links - Column 2 */}
                    <div>
                        <h3 className="font-heading text-lg text-primary-foreground mb-6">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="hover:text-primary-foreground hover:underline transition-colors">Home</Link></li>
                            <li><Link href="/about" className="hover:text-primary-foreground hover:underline transition-colors">About Us</Link></li>
                            <li><Link href="/products" className="hover:text-primary-foreground hover:underline transition-colors">Our Products</Link></li>
                            <li><Link href="/services" className="hover:text-primary-foreground hover:underline transition-colors">Our Services</Link></li>
                            <li><Link href="/contact" className="hover:text-primary-foreground hover:underline transition-colors">Contact Us</Link></li>
                            <li><Link href="/quote" className="hover:text-primary-foreground hover:underline transition-colors">Request a Quote</Link></li>
                        </ul>
                    </div>

                    {/* Services - Column 3 */}
                    <div>
                        <h3 className="font-heading text-lg text-primary-foreground mb-6">Our Services</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="hover:text-primary-foreground transition-colors">Press Tools Manufacturing</li>
                            <li className="hover:text-primary-foreground transition-colors">Sheet Metal Components</li>
                            <li className="hover:text-primary-foreground transition-colors">Welded Assemblies</li>
                            <li className="hover:text-primary-foreground transition-colors">Jigs & Fixtures</li>
                            <li className="hover:text-primary-foreground transition-colors">Non-Ferrous Components</li>
                            <li className="hover:text-primary-foreground transition-colors">Custom Fabrication</li>
                        </ul>
                    </div>

                    {/* Contact Info - Column 4 */}
                    <div>
                        <h3 className="font-heading text-lg text-primary-foreground mb-6">Contact Info</h3>
                        <div className="flex flex-col gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 flex-shrink-0 text-accent" />
                                <span>No.23, 3rd Cross, Sidco Industrial Complex Hosur- 635 126</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="tel:+91 70103 92770"
                                    className="flex items-center gap-3 hover:text-primary-foreground transition-colors"
                                >
                                    <Phone className="h-5 w-5 flex-shrink-0 text-accent" />
                                    <span>+91 70103 92770</span>
                                </Link>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="mailto:bspressproductshosur@gmail.com"
                                    className="flex items-center gap-3 hover:text-primary-foreground transition-colors"
                                >
                                    <Mail className="h-5 w-5 flex-shrink-0 text-accent" />
                                    <span>bspressproductshosur@gmail.com</span>
                                </Link>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 flex-shrink-0 text-accent" />
                                <span>Mon - Sat: 8:00 AM - 6:00 PM</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-primary-foreground/10">
                <div className="container-section py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p>© 2024 BS Press Products. Powered by <a href="https://www.risva.app/">risva.app</a></p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-primary-foreground transition-colors">Site Map</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;