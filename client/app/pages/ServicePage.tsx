// app/services/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { CheckCircle, Factory, Gauge, Shield, Package, Wrench, Zap, Award } from "lucide-react";
import ProductsVariant5 from "@/app/components/ProductsVariant5";

export default function ServicesPage() {
    const coreServices = [
        {
            title: "Press Tools Manufacturing",
            description: "Design and production of precision press tools for industrial applications.",
            icon: <Gauge className="h-8 w-8" />,
            features: ["Custom tool design", "High precision engineering", "Quick turnaround", "Tool maintenance"],
            color: "bg-primary"
        },
        {
            title: "Sheet Metal Pressed Components",
            description: "Fabrication of high-quality sheet metal parts for various industrial applications.",
            icon: <Factory className="h-8 w-8" />,
            features: ["30-200 TON capacity", "Various materials", "Mass production", "Custom finishing"],
            color: "bg-primary"
        },
        {
            title: "Welded Components",
            description: "Professional assembly and welding services for metal components.",
            icon: <Zap className="h-8 w-8" />,
            features: ["Arc welding", "TIG welding", "MIG welding", "Structural welding"],
            color: "bg-primary"
        },
        {
            title: "Jigs & Fixtures",
            description: "Custom jigs and fixtures to support manufacturing processes and ensure precision.",
            icon: <Wrench className="h-8 w-8" />,
            features: ["Custom design", "Quick setup", "Repeatability", "Durability"],
            color: "bg-primary"
        },
        {
            title: "Non-Ferrous Components",
            description: "Specialized production using aluminum, copper, and other non-ferrous materials.",
            icon: <Award className="h-8 w-8" />,
            features: ["Aluminum parts", "Copper components", "Lightweight solutions", "Corrosion resistant"],
            color: "bg-primary"
        }
    ];

    const supportingFacilities = [
        {
            name: "Raw Material Shop",
            description: "Handling and preparation of materials with proper storage and quality control.",
            capacity: "Various materials"
        },
        {
            name: "Press Shop",
            description: "Equipped with presses ranging from 30 TON to 200 TON capacity for diverse requirements.",
            capacity: "30-200 TON"
        },
        {
            name: "Weld Shop",
            description: "Dedicated welding production line with advanced welding equipment.",
            capacity: "Multiple stations"
        },
        {
            name: "Inspection & Packing",
            description: "Comprehensive quality checks and secure packaging for safe transportation.",
            capacity: "Full inspection"
        },
        {
            name: "Despatch",
            description: "Efficient logistics and delivery management for timely shipments.",
            capacity: "Global dispatch"
        }
    ];

    const qualityAssurance = [
        {
            area: "Testing Room & Quarantine Area",
            description: "Rigorous inspection and defect control processes to ensure zero defects.",
            equipment: "Advanced testing apparatus"
        },
        {
            area: "Incoming Inspection Area",
            description: "Ensures all raw materials meet stringent quality standards before production.",
            equipment: "Material testing tools"
        },
        {
            area: "Quality Equipment",
            description: "State-of-the-art measuring instruments including vernier calipers, micrometers, and height gauges.",
            equipment: "Precision measuring tools"
        },
        {
            area: "Final Inspection & Tool Maintenance",
            description: "Comprehensive final checks and regular tool maintenance for consistent precision.",
            equipment: "Complete inspection setup"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-secondary/90 py-24">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="container-section relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <Badge className="mb-6 bg-accent text-primary px-4 py-1 text-sm">
                            Precision Manufacturing Solutions
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Industrial Manufacturing <span className="text-accent">Services</span>
                        </h1>
                        <p className="text-xl text-white/90 mb-8">
                            Comprehensive precision manufacturing services with state-of-the-art facilities
                            and stringent quality control processes.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Services */}
            <section className="section-padding">
                <div className="container-section">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="text-gradient-primary">Core Manufacturing Services</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Precision engineering solutions tailored to meet industrial manufacturing requirements
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {coreServices.map((service, index) => (
                            <Card key={index} className="card-industrial group hover:border-accent/50 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-lg text-white bg-primary`}>
                                            {service.icon}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl mt-4 group-hover:text-primary transition-colors">
                                        {service.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-6">{service.description}</p>
                                    <ul className="space-y-2">
                                        {service.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            <ProductsVariant5/>

            {/* Tabs Section for Facilities and Quality */}
            <section className="section-padding bg-gradient-to-b from-card to-background">
                <div className="container-section">
                    <Tabs defaultValue="facilities" className="w-full">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Supporting Infrastructure & Quality
                            </h2>
                            <TabsList className="inline-flex mx-auto bg-muted p-1 rounded-lg">
                                <TabsTrigger
                                    value="facilities"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                                >
                                    Production Facilities
                                </TabsTrigger>
                                <TabsTrigger
                                    value="quality"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                                >
                                    Quality Assurance
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Facilities Tab */}
                        <TabsContent value="facilities" className="mt-6">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {supportingFacilities.map((facility, index) => (
                                    <div
                                        key={index}
                                        className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                {facility.name}
                                            </h3>
                                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                                                {facility.capacity}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground">{facility.description}</p>
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Package className="h-4 w-4 mr-2" />
                                                <span>Full production support</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Quality Assurance Tab */}
                        <TabsContent value="quality" className="mt-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                {qualityAssurance.map((qa, index) => (
                                    <Card key={index} className="bg-gradient-to-br from-card to-background border-primary-200/50">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Shield className="h-6 w-6 text-primary" />
                                                </div>
                                                <CardTitle className="text-lg">{qa.area}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground mb-4">{qa.description}</p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-primary font-medium">{qa.equipment}</span>
                                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                                    Certified
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Process Flow */}
            <section className="section-padding bg-muted/50">
                <div className="container-section">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            End-to-End <span className="text-primary">Manufacturing Process</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Streamlined workflow from raw material to finished product
                        </p>
                    </div>

                    <div className="relative">
                        {/* Process Timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                            {[
                                { step: "1", title: "Material Inspection", desc: "Raw material quality check" },
                                { step: "2", title: "Tool Setup", desc: "Precision tool preparation" },
                                { step: "3", title: "Production", desc: "Manufacturing process" },
                                { step: "4", title: "Quality Check", desc: "In-process inspection" },
                                { step: "5", title: "Packing & Dispatch", desc: "Secure packaging & shipping" }
                            ].map((process, index) => (
                                <div key={index} className="relative text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">{process.step}</span>
                                    </div>
                                    <h3 className="font-semibold mb-2">{process.title}</h3>
                                    <p className="text-sm text-muted-foreground">{process.desc}</p>
                                    {index < 4 && (
                                        <div className="hidden md:block absolute top-8 left-3/4 w-full h-0.5 bg-gradient-to-r from-primary/50 to-secondary/50"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding">
                <div className="container-section">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-12 border border-border">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Ready to Start Your Manufacturing Project?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Contact us today to discuss your precision manufacturing needs and get a detailed quote.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="btn-industrial bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg">
                                    Request a Quote
                                </button>
                                <button className="btn-industrial bg-white text-primary border border-primary hover:bg-primary/5">
                                    Schedule Consultation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}