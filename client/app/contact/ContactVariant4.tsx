"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Globe, Send } from "lucide-react";
import api from "../service/api";
import {Badge} from "@/app/components/ui/badge";

interface Location {
    name: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    embedUrl: string;
}

interface FormData {
    name: string;
    company_name: string;
    email: string;
    phone: string;
    message: string;
}

const ContactVariant4 = () => {
    const [activeLocation, setActiveLocation] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        company_name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: "" });

    const locations: Location[] = [
        {
            name: "Hosur",
            city: "Hosur",
            address: "No.23, 3rd Cross, Sidco Industrial Complex Hosur- 635 126",
            phone: "+91 7598062530",
            email: "bspressproductshosur@gmail.com",
            embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3891.393615530453!2d77.82893927594961!3d12.752930587542693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae710020190bcf%3A0x43fccc4c6efb9f34!2sB%20s%20press%20products!5e0!3m2!1sen!2sin!4v1769407650494!5m2!1sen!2sin"
        },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus({ type: null, message: "" });

        try {
            // Basic validation
            if (!formData.name.trim()) {
                throw new Error("Name is required");
            }

            if (!formData.email.trim()) {
                throw new Error("Email is required");
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error("Invalid email format");
            }

            if (!formData.message.trim()) {
                throw new Error("Message is required");
            }

            // Submit to API
            const response = await api.post("/contact", {
                ...formData,
                location: locations[activeLocation].city
            });

            if (response.data.success) {
                setSubmitStatus({
                    type: 'success',
                    message: `Message sent successfully to ${locations[activeLocation].city}! We'll contact you soon.`
                });

                // Reset form
                setFormData({
                    name: "",
                    company_name: "",
                    email: "",
                    phone: "",
                    message: ""
                });
            } else {
                throw new Error(response.data.error || "Failed to send message");
            }
        } catch (error: any) {
            console.error("Error submitting form:", error);
            setSubmitStatus({
                type: 'error',
                message: error.response?.data?.error || error.message || "Failed to send message. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-secondary/90 py-12 lg:py-16">

                <div className="container-section relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge className="mb-6 bg-accent/60 text-primary px-4 py-1 text-sm">
                            Get in Touch
                        </Badge>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Contact <span className="text-accent">BS Press</span>
                        </h1>

                        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                            Let's discuss your precision manufacturing needs. Our team is ready to provide
                            tailored solutions for your industrial requirements.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
                                <Phone className="w-5 h-5 text-accent" />
                                <span className="text-white font-medium">+91 7598062530</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
                                <Mail className="w-5 h-5 text-accent" />
                                <span className="text-white font-medium">bspressproductshosur@gmail.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Content Section */}
            <section className="section-padding bg-background">
                <div className="container-section">


                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Location Info */}
                        <div className="bg-card card-industrial">
                            <div className="p-8 lg:p-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground">
                                            {locations[activeLocation].name}
                                        </h3>
                                        <p className="text-muted-foreground">Manufacturing Facility</p>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-8">
                                    <div className="bg-muted/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">Address</p>
                                        <p className="text-foreground whitespace-pre-line">
                                            {locations[activeLocation].address}
                                        </p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <p className="text-sm text-muted-foreground mb-2">Phone</p>
                                            <p className="text-foreground flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-primary shrink-0" />
                                                <span className="truncate">{locations[activeLocation].phone}</span>
                                            </p>
                                        </div>
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <p className="text-sm text-muted-foreground mb-2">Email</p>
                                            <div className="relative group">
                                                <p className="text-foreground flex items-center gap-2 overflow-hidden">
                                                    <Mail className="w-4 h-4 text-primary shrink-0" />
                                                    <span className="truncate break-all">{locations[activeLocation].email}</span>
                                                </p>
                                                {/* Tooltip on hover for full email */}
                                                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                                    {locations[activeLocation].email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Map */}
                            <div className="border-t border-border">
                                <iframe
                                    title={`${locations[activeLocation].city} Location`}
                                    src={locations[activeLocation].embedUrl}
                                    className="w-full h-72 md:h-80 rounded-b-lg"
                                    allowFullScreen
                                    loading="lazy"
                                    key={activeLocation}
                                />
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card card-industrial">
                            <div className="p-8 lg:p-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-lg bg-gradient-to-br from-accent to-orange-500">
                                        <Send className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground">
                                            Send Your Inquiry
                                        </h3>
                                        <p className="text-muted-foreground">Get a quote or discuss your project</p>
                                    </div>
                                </div>

                                {/* Status Message */}
                                {submitStatus.type && (
                                    <div className={`mb-6 p-4 rounded-lg border ${
                                        submitStatus.type === 'success'
                                            ? 'bg-green-50 border-green-200 text-green-800'
                                            : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                        {submitStatus.message}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Name *"
                                                className="w-full px-4 py-3 rounded-md bg-background border border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                name="company_name"
                                                value={formData.company_name}
                                                onChange={handleInputChange}
                                                placeholder="Company Name"
                                                className="w-full px-4 py-3 rounded-md bg-background border border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Email *"
                                                className="w-full px-4 py-3 rounded-md bg-background border border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="Phone"
                                                className="w-full px-4 py-3 rounded-md bg-background border border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows={5}
                                            placeholder="Your Message *"
                                            className="w-full px-4 py-3 rounded-md bg-background border border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                                            loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-sm text-muted-foreground text-center">
                                        We typically respond within 24 hours during business days.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Additional Contact Info */}
                    <div className="mt-16 pt-16 border-t border-border">
                        <div className="max-w-4xl mx-auto text-center">
                            <h3 className="text-2xl font-bold text-foreground mb-8">
                                Other Ways to Connect
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-card p-6 rounded-lg border border-border">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-primary" />
                                    </div>
                                    <h4 className="font-bold text-foreground mb-2">Call Us</h4>
                                    <p className="text-muted-foreground">Mon-Fri: 9AM-6PM</p>
                                    <p className="text-primary font-semibold">+91 7598062530</p>
                                </div>

                                <div className="bg-card p-6 rounded-lg border border-border">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-accent" />
                                    </div>
                                    <h4 className="font-bold text-foreground mb-2">Email Us</h4>
                                    <p className="text-muted-foreground">24/7 Support</p>
                                    <div className="relative group">
                                        <p className="text-foreground flex items-center gap-2 overflow-hidden">
                                            <span className="truncate break-all">{locations[activeLocation].email}</span>
                                        </p>
                                        {/* Tooltip on hover for full email */}
                                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                            {locations[activeLocation].email}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card p-6 rounded-lg border border-border">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-teal/10 flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-teal" />
                                    </div>
                                    <h4 className="font-bold text-foreground mb-2">Visit Us</h4>
                                    <p className="text-muted-foreground">Sidco Industrial Complex</p>
                                    <p className=" font-semibold">Hosur, Tamil Nadu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ContactVariant4;