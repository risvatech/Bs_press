import {
    Cog,
    Car,
    LucideIcon
} from "lucide-react";
import MachineServed from "@/app/components/machine";

interface Industry {
    icon: LucideIcon;
    name: string;
    description?: string;
}

const industries: Industry[] = [
    {
        icon: Cog,
        name: "Rucha Engineers Pvt Ltd",
        description: "Precision engineering components"
    },
    {
        icon: Car,
        name: "Indo Autotech Limited",
        description: "Automotive systems manufacturer"
    },
    {
        icon: Car,
        name: "Rajsriya Automotive",
        description: "Automotive parts and assemblies"
    },
];



const IndustriesServed = () => {
    return (
        <section className="section-padding bg-gradient-to-b from-background to-muted/50">
            <div className="container-section">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    <span className="inline-block px-5 py-3 text-md font-bold text-primary bg-accent/50 rounded-full uppercase tracking-wider">
  Our Manufacturing Ecosystem
</span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                        Trusted by <span className="text-gradient-primary">Industry Leaders</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Delivering precision components to leading engineering and automotive companies with our state-of-the-art manufacturing facilities.
                    </p>
                </div>

                {/* Clients Section */}
                <div className="mb-16">
                    <h3 className="text-2xl font-heading text-foreground mb-8 text-center">Our Valued Clients</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {industries.map((client, index) => (
                            <div
                                key={index}
                                className="bg-card card-industrial hover:border-primary/50 p-5"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                                        <client.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h4 className="font-heading text-xl text-foreground">{client.name}</h4>
                                </div>
                                <p className="text-muted-foreground">{client.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <MachineServed/>

                {/* Machine Gallery Section */}
                <div className="mt-8 pt-8 ">
                    <div className="mt-6 text-center">
                        <div className="inline-flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>All machines operational</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Regular maintenance</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent rounded-full"></div>
                                <span>ISO certified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default IndustriesServed;