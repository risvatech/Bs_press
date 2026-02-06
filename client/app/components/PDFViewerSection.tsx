"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Download,
    FileText,
    Shield,
    Wrench,
    Users,
    Calendar,
    Eye,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    Loader2,
    CheckCircle,
    ExternalLink
} from 'lucide-react';

// Type definitions
interface PDFFile {
    id: number;
    title: string;
    description: string;
    fileUrl: string;
    size: string;
    pages: number;
    views: number;
    lastUpdated: string;
    category: string;
    keyFeatures: string[];
}

// PDF data structure
const pdfFiles: PDFFile[] = [
    {
        id: 1,
        title: "Award",
        description: "Detailed technical specifications and capabilities of our hydraulic press systems.",
        fileUrl: "/B S PRESS ZED CERTIFICATE.pdf",
        size: "2.4 MB",
        pages: 12,
        views: 1450,
        lastUpdated: "2024-01-15",
        category: "Technical",
        keyFeatures: [
            "Pressure Capacity: 100-500 Tons",
            "Platen Size: 1000x1000mm to 2000x2000mm",
            "Operating Pressure: 200-300 Bar",
            "Motor Power: 15-75 HP"
        ]
    },
    {
        id: 2,
        title: "MSME",
        description: "Complete safety guidelines and operational procedures for press operators.",
        fileUrl: "/B S PRESS  MSME  CERTIFICATE.pdf",
        size: "3.1 MB",
        pages: 24,
        views: 892,
        lastUpdated: "2024-02-01",
        category: "Safety",
        keyFeatures: [
            "Emergency Stop Protocols",
            "Machine Guarding Procedures",
            "Lockout/Tagout Guidelines",
            "Personal Protective Equipment"
        ]
    },
    {
        id: 3,
        title: "About",
        description: "Preventive maintenance schedules and troubleshooting guide for press equipment.",
        fileUrl: "/DOC-20240629-WA0017..pdf",
        size: "4.2 MB",
        pages: 32,
        views: 567,
        lastUpdated: "2024-01-20",
        category: "Maintenance",
        keyFeatures: [
            "Daily Inspection Checklist",
            "Weekly Lubrication Schedule",
            "Monthly System Checks",
            "Annual Maintenance Plan"
        ]
    },
    {
        id: 4,
        title: "ISO",
        description: "Success stories and case studies from automotive industry clients.",
        fileUrl: "/DOC-20240629-WA0018..pdf",
        size: "5.8 MB",
        pages: 18,
        views: 1234,
        lastUpdated: "2024-02-10",
        category: "Case Studies",
        keyFeatures: [
            "Production Increase: 35%",
            "Quality Improvement: 40%",
            "Downtime Reduction: 60%",
            "Energy Savings: 25%"
        ]
    },
];

// Component Icons Mapping
const iconMap: Record<string, React.ReactNode> = {
    Technical: <FileText className="w-5 h-5" />,
    Safety: <Shield className="w-5 h-5" />,
    Maintenance: <Wrench className="w-5 h-5" />,
    "Case Studies": <Users className="w-5 h-5" />,
};

const PDFViewerSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [scale, setScale] = useState<number>(1.0);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [useIframe, setUseIframe] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const link = document.createElement('a');
            link.href = pdfFiles[activeTab].fileUrl;
            link.download = pdfFiles[activeTab].title.toLowerCase().replace(/\s+/g, '-') + '.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(2, prev + 0.2));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(0.5, prev - 0.2));
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const activePDF = pdfFiles[activeTab];

    const getIcon = (category: string) => {
        return iconMap[category] || <FileText className="w-5 h-5" />;
    };

    // Handle PDF loading error
    useEffect(() => {
        const timer = setTimeout(() => {
            setUseIframe(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, [activeTab]);

    return (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* Left Side - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div>
                            <span className="inline-block px-5 py-3 text-md font-bold text-primary bg-accent/50 rounded-full uppercase tracking-wider">
  DOCUMENTATION LIBRARY
</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                Complete Technical Documentation
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Access detailed technical specifications, safety guidelines, maintenance procedures,
                                and real-world case studies for our hydraulic press systems. All documents are
                                regularly updated to ensure compliance with the latest industry standards.
                            </p>
                        </div>

                        {/* Current Document Info */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        {getIcon(activePDF.category)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{activePDF.title}</h3>
                                        <p className="text-gray-600">{activePDF.category}</p>
                                    </div>
                                </div>

                            </div>

                            <p className="text-gray-700 mb-6">
                                {activePDF.description}
                            </p>

                            {/* Key Features */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-gray-900 mb-4">Key Features:</h4>
                                <div className="space-y-3">
                                    {activePDF.keyFeatures.map((feature, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Document Details */}
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Pages</p>
                                        <p className="font-semibold text-gray-900">{activePDF.pages}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Eye className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Views</p>
                                        <p className="font-semibold text-gray-900">{activePDF.views.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Last Updated</p>
                                        <p className="font-semibold text-gray-900">{formatDate(activePDF.lastUpdated)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">File Size</p>
                                        <p className="font-semibold text-gray-900">{activePDF.size}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>

                    {/* Right Side - PDF Viewer */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                    >
                        {/* Four Tabs Navigation */}
                        <div className="border-b border-gray-200">
                            <div className="flex overflow-x-auto">
                                {pdfFiles.map((pdf, index) => (
                                    <button
                                        key={pdf.id}
                                        onClick={() => {
                                            setActiveTab(index);
                                            setLoading(true);
                                            setUseIframe(false);
                                        }}
                                        className={`flex-1 min-w-0 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                                            activeTab === index
                                                ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            {getIcon(pdf.category)}
                                            <span className="truncate">{pdf.title}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="p-6">
                            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 shadow-inner">

                                {/* PDF Display - Simple Iframe */}
                                <div className="flex items-center justify-center min-h-[500px] p-4 bg-white">
                                    {loading && !useIframe ? (
                                        <div className="flex flex-col items-center justify-center h-[400px]">
                                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                            <p className="text-gray-600">Loading PDF viewer...</p>
                                            <p className="text-gray-500 text-sm mt-2">If this takes too long, try opening in a new window</p>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full">
                                            <iframe
                                                src={`${activePDF.fileUrl}#view=FitH&toolbar=0&navpanes=0`}
                                                className="w-full h-[500px] border-0"
                                                title={activePDF.title}
                                                onLoad={() => setLoading(false)}
                                                onError={() => {
                                                    setUseIframe(true);
                                                    setLoading(false);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Download Button */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg disabled:opacity-50"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    {isDownloading ? 'Downloading...' : 'Download This Document'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default PDFViewerSection;