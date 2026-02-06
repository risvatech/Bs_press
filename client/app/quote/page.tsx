"use client";

import { useState } from "react";
import {
    Mail,
    Phone,
    MapPin,
    Truck,
    Package,
    Factory,
    CheckCircle,
    Calendar,
    FileText,
    Upload,
    AlertCircle
} from "lucide-react";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../service/api";

interface FormData {
    // Contact Information
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;

    // Project Details
    projectType: string;
    quantity: string;
    deliveryDate: string;
    budget: string;
    additionalRequirements: string;

    // Product/Service Details
    productType: string;

    // Files
    files: File[];
}

const quoteOptions = [
    { id: "warehousing", label: "Warehousing & Supply Chain", icon: Truck },
    { id: "packing", label: "Packing & Kitting Services", icon: Package },
    { id: "metal-pallets", label: "Metal Pallets & Stillages", icon: Factory },
    { id: "trolleys", label: "Industrial Trolleys", icon: Truck },
    { id: "wooden-pallets", label: "Wooden Pallets & Boxes", icon: Package },
    { id: "carton", label: "Carton Boxes & Materials", icon: Package },
    { id: "returnable", label: "Returnable Packaging", icon: Truck },
    { id: "custom", label: "Design & Customization", icon: FileText },
];

const budgetOptions = [
    { id: "under-50k", label: "Under ₹50,000" },
    { id: "50k-2l", label: "₹50,000 - ₹2,00,000" },
    { id: "2l-5l", label: "₹2,00,000 - ₹5,00,000" },
    { id: "5l-10l", label: "₹5,00,000 - ₹10,00,000" },
    { id: "over-10l", label: "Over ₹10,00,000" },
    { id: "not-sure", label: "Not Sure / Need Consultation" },
];

const QuotePage = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        company: "",
        email: "",
        phone: "",
        country: "India",
        state: "",
        city: "",
        projectType: "",
        quantity: "",
        deliveryDate: "",
        budget: "",
        additionalRequirements: "",
        productType: "",
        files: [],
    });

    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: "" });

    const [activeStep, setActiveStep] = useState(1);
    const totalSteps = 3;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, ...filesArray]
            }));
        }
    };

    const removeFile = (index: number) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const handleQuoteOptionSelect = (optionId: string) => {
        setFormData(prev => ({
            ...prev,
            projectType: optionId
        }));
    };

    const handleBudgetSelect = (budgetId: string) => {
        setFormData(prev => ({
            ...prev,
            budget: budgetId
        }));
    };

    const nextStep = () => {
        if (activeStep < totalSteps) {
            setActiveStep(activeStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus({ type: null, message: "" });

        try {
            // Basic validation
            if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
                throw new Error("Please fill in all required fields");
            }

            if (!formData.projectType) {
                throw new Error("Please select a project type");
            }

            // Prepare data for JSON API
            const quoteData = {
                // Contact Information
                name: formData.name.trim(),
                company: formData.company.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                country: formData.country || 'India',
                state: formData.state.trim(),
                city: formData.city.trim(),

                // Project Details
                projectType: formData.projectType,
                productType: formData.productType.trim() || '',
                quantity: formData.quantity.trim() || '',
                deliveryDate: formData.deliveryDate || '',
                budget: formData.budget,
                additionalRequirements: formData.additionalRequirements.trim() || '',

                // Metadata
                source: 'website',
                submittedAt: new Date().toISOString()
            };

            console.log('Sending quote data:', quoteData);

            // Submit to API - Send as JSON
            const response = await api.post('/quotes/submit', quoteData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('API Response:', response.data);

            if (response.data.success) {
                setSubmitStatus({
                    type: 'success',
                    message: 'Your quote request has been submitted successfully! Our team will contact you within 24 hours.'
                });

                // Reset form
                setFormData({
                    name: "",
                    company: "",
                    email: "",
                    phone: "",
                    country: "India",
                    state: "",
                    city: "",
                    projectType: "",
                    quantity: "",
                    deliveryDate: "",
                    budget: "",
                    additionalRequirements: "",
                    productType: "",
                    files: [],
                });
                setActiveStep(1);
            } else {
                throw new Error(response.data.message || response.data.error || "Failed to submit quote request");
            }
        } catch (error: any) {
            console.error("Error submitting form:", error);
            console.error("Error response:", error.response?.data);

            let errorMessage = "Failed to submit quote request. Please try again.";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setSubmitStatus({
                type: 'error',
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: "Contact Information", description: "Tell us about yourself" },
        { number: 2, title: "Project Details", description: "What do you need?" },
        { number: 3, title: "Review & Submit", description: "Final check" },
    ];

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-teal">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-20 w-64 h-64 bg-teal rounded-full blur-3xl" />
                </div>

                <div className="relative container-section py-20 md:py-28">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6">
                            Request a Quote
                        </h1>
                        <p className="text-xl text-primary-foreground/90 mb-8">
                            Get custom pricing for your industrial packaging and material handling needs
                        </p>

                        {/* Progress Steps */}
                        <div className="flex justify-center items-center mb-12">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex flex-col items-center ${activeStep >= step.number ? 'text-primary-foreground' : 'text-primary-foreground/50'}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${activeStep >= step.number ? 'bg-accent' : 'bg-primary-foreground/20'}`}>
                                            {activeStep > step.number ? (
                                                <CheckCircle className="h-6 w-6 text-accent-foreground" />
                                            ) : (
                                                <span className={`font-heading font-bold ${activeStep >= step.number ? 'text-accent-foreground' : 'text-primary-foreground/50'}`}>
                                                    {step.number}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium">{step.title}</span>
                                        <span className="text-xs opacity-75">{step.description}</span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-16 h-1 mx-4 ${activeStep > step.number ? 'bg-accent' : 'bg-primary-foreground/20'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="section-padding bg-background">
                <div className="container-section max-w-4xl">
                    {submitStatus.type && (
                        <div className={`mb-8 p-6 rounded-xl ${
                            submitStatus.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-800'
                                : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                            <div className="flex items-start gap-3">
                                {submitStatus.type === 'success' ? (
                                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                                )}
                                <div>
                                    <p className="font-medium">{submitStatus.message}</p>
                                    {submitStatus.type === 'success' && (
                                        <p className="text-sm mt-2 opacity-90">
                                            Quote Reference: Q-{Date.now().toString().slice(-6)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Step 1: Contact Information */}
                        {activeStep === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="font-heading text-2xl text-foreground mb-6">Contact Information</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Company Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="ABC Manufacturing Ltd."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="john@company.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="+91 9876543210"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Country *
                                        </label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required
                                        >
                                            <option value="India">India</option>
                                            <option value="USA">United States</option>
                                            <option value="UK">United Kingdom</option>
                                            <option value="Germany">Germany</option>
                                            <option value="Japan">Japan</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Tamil Nadu"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Chennai"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <Button type="button" onClick={nextStep}>
                                        Next: Project Details
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Project Details */}
                        {activeStep === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="font-heading text-2xl text-foreground mb-6">Project Details</h2>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-4">
                                        What do you need a quote for? *
                                    </label>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {quoteOptions.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => handleQuoteOptionSelect(option.id)}
                                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                                        formData.projectType === option.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/50 hover:bg-card'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <Icon className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <span className="font-medium text-foreground">{option.label}</span>
                                                    </div>
                                                    {formData.projectType === option.id && (
                                                        <div className="flex items-center gap-1 text-sm text-primary mt-2">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span>Selected</span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Product/Service Type
                                        </label>
                                        <input
                                            type="text"
                                            name="productType"
                                            value={formData.productType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="e.g., 4-way wooden pallets, custom metal stillages"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Estimated Quantity
                                        </label>
                                        <input
                                            type="text"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="e.g., 1000 units, 50 pallets"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Desired Delivery Date
                                        </label>
                                        <input
                                            type="date"
                                            name="deliveryDate"
                                            value={formData.deliveryDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Additional Requirements
                                        </label>
                                        <textarea
                                            name="additionalRequirements"
                                            value={formData.additionalRequirements}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                            placeholder="Any specifications, special instructions, or notes..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-4">
                                        Estimated Budget *
                                    </label>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {budgetOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => handleBudgetSelect(option.id)}
                                                className={`px-4 py-3 rounded-lg border text-center transition-all ${
                                                    formData.budget === option.id
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Upload Files (Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-2">
                                            Drag & drop files here, or click to browse
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Supported files: PDF, DOC, JPG, PNG, CAD files (Max 10MB each)
                                        </p>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                            multiple
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.dxf"
                                        />
                                        <label htmlFor="file-upload">
                                            <Button type="button" variant="outline" className="cursor-pointer">
                                                Browse Files
                                            </Button>
                                        </label>
                                    </div>

                                    {formData.files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm font-medium text-foreground">
                                                Uploaded files ({formData.files.length}):
                                            </p>
                                            {formData.files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between pt-6">
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        Back
                                    </Button>
                                    <Button type="button" onClick={nextStep}>
                                        Next: Review & Submit
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review & Submit */}
                        {activeStep === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="font-heading text-2xl text-foreground mb-6">Review Your Quote Request</h2>

                                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                                    <div>
                                        <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-primary" />
                                            Contact Information
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Name</p>
                                                <p className="font-medium">{formData.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Company</p>
                                                <p className="font-medium">{formData.company}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{formData.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                                <p className="font-medium">{formData.phone}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-muted-foreground">Location</p>
                                                <p className="font-medium">{formData.city}, {formData.state}, {formData.country}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                                            <Factory className="h-5 w-5 text-primary" />
                                            Project Details
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Project Type</p>
                                                <p className="font-medium">
                                                    {quoteOptions.find(o => o.id === formData.projectType)?.label || "Not selected"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Product/Service Type</p>
                                                <p className="font-medium">{formData.productType || "Not specified"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Quantity</p>
                                                <p className="font-medium">{formData.quantity || "Not specified"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Delivery Date</p>
                                                <p className="font-medium">
                                                    {formData.deliveryDate
                                                        ? new Date(formData.deliveryDate).toLocaleDateString()
                                                        : "Not specified"
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Budget</p>
                                                <p className="font-medium">
                                                    {budgetOptions.find(o => o.id === formData.budget)?.label || "Not selected"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.additionalRequirements && (
                                        <div>
                                            <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-primary" />
                                                Additional Requirements
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-1">Requirements</p>
                                                    <p className="text-foreground whitespace-pre-line">{formData.additionalRequirements}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {formData.files.length > 0 && (
                                        <div>
                                            <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                                                <Upload className="h-5 w-5 text-primary" />
                                                Attached Files ({formData.files.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {formData.files.map((file, index) => (
                                                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{file.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-blue-800">
                                                <strong>What happens next?</strong> Our sales team will review your request and contact you within 24 hours.
                                                You'll receive a detailed quote with pricing, timelines, and specifications.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6">
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={loading} className="min-w-[120px]">
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                                Submitting...
                                            </div>
                                        ) : (
                                            "Submit Quote Request"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Contact Info Sidebar */}
                    <div className="mt-12 pt-8 border-t border-border">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Phone className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-heading text-lg text-foreground mb-2">Call Us</h3>
                                <p className="text-muted-foreground">+91 9876543210</p>
                                <p className="text-sm text-muted-foreground">Mon-Sat, 9AM-6PM</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-heading text-lg text-foreground mb-2">Email Us</h3>
                                <p className="text-muted-foreground">sales@bspress.com</p>
                                <p className="text-sm text-muted-foreground">Response within 24 hours</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-heading text-lg text-foreground mb-2">Visit Us</h3>
                                <p className="text-muted-foreground">Hosur, Tamil Nadu</p>
                                <p className="text-sm text-muted-foreground">By appointment only</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default QuotePage;