"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Menu, X, Phone, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("");
    const [isClient, setIsClient] = useState(false);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about" },
        { name: "Products", href: "/products" },
        { name: "Services", href: "/services" },
        { name: "Contact", href: "/contact" }
    ];

    const contactInfo = {
        phone: "+91 70103 92770",
        email: "bspressproductshosur@gmail.com",
        whatsapp: "+91 70103 92770"
    };

    useEffect(() => setIsClient(true), []);

    useEffect(() => {
        if (!isClient) return;
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isClient]);

    useEffect(() => {
        if (!isClient) return;
        const currentPath = window.location.pathname;
        const active = navLinks.find(link =>
            link.href === "/" ? currentPath === "/" : currentPath.startsWith(link.href)
        );
        setActiveLink(active?.name || "");
    }, [isClient]);

    const getNavTransform = () => {
        if (!isClient) return "translateY(0)";
        return isScrolled ? "translateY(0)" : window.innerWidth >= 1024 ? "translateY(64px)" : "translateY(0)";
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50">
                {isClient && (
                    <div
                        className="hidden lg:block bg-gray-200 text-primary border-b border-gray-300 transition-transform duration-500 ease-in-out"
                        style={{
                            transform: isScrolled ? "translateY(-100%)" : "translateY(0)",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                        }}
                    >
                        <div className="py-4">
                            {/* ✅ FIXED CONTAINER */}
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end gap-6">
                                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 group">
                                    <div className="relative p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-all duration-300">
                                        <Phone className="h-4 w-4 text-primary group-hover:text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Call Us</span>
                                        <span className="text-sm font-medium text-primary">{contactInfo.phone}</span>
                                    </div>
                                </a>

                                <a
                                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 group"
                                >
                                    <div className="relative p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-all duration-300">
                                        <div className="h-4 w-4 relative">
                                            <Image src="/whatsapp-icon.svg" alt="WhatsApp" fill className="object-contain" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary">WhatsApp</span>
                                        <span className="text-sm font-medium text-primary">{contactInfo.whatsapp}</span>
                                    </div>
                                </a>

                                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 group">
                                    <div className="relative p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-all duration-300">
                                        <Mail className="h-4 w-4 text-primary group-hover:text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary">Email Us</span>
                                        <span className="text-sm font-medium text-primary">{contactInfo.email}</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                {/* Main Navigation Bar - fixed at top, moves up when scrolled */}
                <nav
                    className="backdrop-blur-md transition-all duration-500 ease-in-out bg-primary relative z-10"
                    style={{
                        transform: getNavTransform(),
                        boxShadow: isScrolled ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
                        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            {/* Logo - Always visible in main nav */}
                            <div className="w-full flex items-center">
                                <Link href="/" className="flex items-center gap-3 group">
                                    <div className="w-full flex flex-col">
                                        <Image
                                            src="/bs-press-logo.png"
                                            alt="logo"
                                            height={125}
                                            width={150}
                                            priority
                                        />
                                    </div>
                                </Link>
                            </div>

                            {/* Desktop Navigation */}

                            <div className="hidden lg:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="relative px-5 py-2.5 text-md font-medium transition-all duration-300 group"
                                        onMouseEnter={() => setActiveLink(link.name)}
                                        onMouseLeave={() => setActiveLink("")}
                                    >
                                        <span className={`relative z-10 whitespace-nowrap ${
                                            activeLink === link.name
                                                ? 'text-white'
                                                : 'text-gray-300 group-hover:text-white'
                                        } transition-colors`}>
                                            {link.name}
                                        </span>
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent rounded-lg"></div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* CTA Button and Desktop Contact Info */}
                            <div className="w-full hidden lg:flex justify-end gap-6">
                                <Button className="group relative overflow-hidden bg-gradient-to-r from-accent via-accent to-accent/90 hover:from-accent hover:via-accent/90 hover:to-accent text-primary font-bold px-6 py-2.5 rounded-xl text-base shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:-translate-y-0.5 transition-all duration-300">
                                    <Link href="/quote" className="flex items-center gap-2">
                                        Request a Quote
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </Button>
                            </div>
                            <div className="flex items-center justify-end gap-4">
                                {/* WhatsApp */}
                                <a
                                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 group"
                                >
                                    <div className=" lg:hidden relative p-2  rounded-lg group-hover:bg-primary
                    text-green-600 transition-all duration-300">
                                        <div className="h-6 w-6 relative">
                                            <Image
                                                src="/whatsapp-icon.svg"
                                                alt="WhatsApp"
                                                fill
                                                className="object-contain group-hover:brightness-0 group-hover:invert"
                                            />
                                        </div>
                                    </div>
                                </a>

                                {/* Menu Button */}
                                <button
                                    className="lg:hidden p-3 rounded-xl bg-white/5 hover:bg-accent/20
               transition-all duration-300 group"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                                >
                                    {mobileMenuOpen ? (
                                        <X className="h-6 w-6 text-white group-hover:rotate-90 transition-transform" />
                                    ) : (
                                        <Menu className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                                    )}
                                </button>
                            </div>

                            {/* Mobile Menu Button */}


                        </div>

                        {/* Mobile Menu */}
                        {mobileMenuOpen && (
                            <div className="lg:hidden py-6 border-t border-white/10 animate-in slide-in-from-top-5 duration-300">
                                {/* Mobile Contact Info */}
                                <div className="px-4 pb-6 mb-4 border-b border-white/10">
                                    <div className="flex flex-col gap-4">
                                        <a
                                            href={`tel:${contactInfo.phone}`}
                                            className="flex items-center gap-3 group p-3 rounded-xl bg-white/5 hover:bg-accent/20 transition-all"
                                        >
                                            <div className="p-2.5 bg-accent/20 rounded-lg">
                                                <Phone className="h-5 w-5 text-accent" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-400">Call Us Now</span>
                                                <p className="text-sm font-medium text-white group-hover:text-accent transition-colors">
                                                    {contactInfo.phone}
                                                </p>
                                            </div>
                                        </a>

                                        <a
                                            href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                                            className="flex items-center gap-3 group p-3 rounded-xl bg-white/5 hover:bg-accent/20 transition-all"
                                        >
                                            <div className="p-2.5 bg-accent/20 rounded-lg">
                                                <div className="h-5 w-5 relative">
                                                    <Image
                                                        src="/whatsapp-icon.svg"
                                                        alt="WhatsApp"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-400">Whatsapp</span>
                                                <p className="text-sm font-medium text-white group-hover:text-accent transition-colors">
                                                    {contactInfo.whatsapp}
                                                </p>
                                            </div>
                                        </a>

                                        <a
                                            href={`mailto:${contactInfo.email}`}
                                            className="flex items-center gap-3 group p-3 rounded-xl bg-white/5 hover:bg-accent/20 transition-all"
                                        >
                                            <div className="p-2.5 bg-accent/20 rounded-lg">
                                                <Mail className="h-5 w-5 text-accent" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-400">Send Email</span>
                                                <p className="text-sm font-medium text-white group-hover:text-accent transition-colors max-w-[220px] truncate">
                                                    {contactInfo.email}
                                                </p>
                                            </div>
                                        </a>
                                    </div>
                                </div>

                                {/* Navigation Links */}
                                <div className="flex flex-col gap-1 px-2">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-accent/10 hover:text-accent transition-all duration-300 group"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <span className="text-white group-hover:text-accent">{link.name}</span>
                                            <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    ))}
                                    <div className="pt-4 px-2">
                                        <Button className="w-full group bg-gradient-to-r from-accent via-accent to-accent/90 hover:from-accent hover:via-accent/90 hover:to-accent text-primary font-bold py-3.5 rounded-xl shadow-lg shadow-accent/20">
                                            <Link
                                                href="/quote"
                                                className="flex items-center justify-center gap-2 w-full"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Get Free Quote
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            {/* Spacer to prevent content from going under fixed navbar */}
            <div className="h-[80px] lg:h-[124px]"></div>
        </>
    );
};

export default Navbar;