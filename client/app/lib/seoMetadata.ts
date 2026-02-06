// app/lib/seoMetadata.ts
export interface PageMetadata {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    ogType: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    h1: string;
    h2: string[];
}

export const SEO_CONFIG: Record<string, PageMetadata> = {
    home: {
        title: 'BS Press – Environmental Test Chambers & Scientific Equipment Manufacturer | ISO 9001:2015',
        description: 'BS Press (Tarun Scientific Instruments) manufactures environmental test chambers, laboratory equipment, cold rooms, incubators, furnaces, and custom scientific systems for all industries.',
        keywords: 'BS Press, tarun scientific instruments, environmental test chambers, lab equipment manufacturer, climatic chambers, stability chambers, humidity chambers',
        ogTitle: 'BS Press – Environmental Test Chambers & Scientific Equipment',
        ogDescription: 'ISO 9001:2015 certified manufacturer of environmental test chambers, laboratory equipment, incubators, furnaces and custom scientific systems.',
        ogImage: 'www.bspressproducts.com/assets/og-home.jpg',
        ogUrl: 'www.bspressproducts.com/',
        ogType: 'website',
        twitterCard: 'summary_large_image',
        twitterTitle: 'BS Press – Scientific Equipment Manufacturer',
        twitterDescription: 'Manufacturer of environmental test chambers, climatic chambers, incubators, ovens, and laboratory equipment.',
        twitterImage: 'www.bspressproducts.com/assets/og-home.jpg',
        h1: 'Leading Manufacturer of Environmental Test Chambers & Scientific Laboratory Equipment',
        h2: [
            'ISO 9001:2015 Certified Scientific Equipment Manufacturer',

        ]
    },
    about: {
        title: 'About BS Press | ISO 9001 Certified Scientific Equipment Manufacturer',
        description: 'BS Press specializes in design and manufacturing of custom environmental test chambers and laboratory equipment for manufacturing industries and research labs.',
        keywords: 'about BS Press, scientific equipment company, ISO certified equipment manufacturer',
        ogTitle: 'About BS Press',
        ogDescription: 'ISO 9001:2015 certified manufacturer of scientific equipment and environmental test chambers with expertise across all industries.',
        ogImage: 'www.bspressproducts.com/assets/og-about.jpg',
        ogUrl: 'www.bspressproducts.com/about',
        ogType: 'article',
        twitterCard: 'summary_large_image',
        twitterTitle: 'About BS Press',
        twitterDescription: 'Custom manufacturer of environmental chambers and scientific laboratory systems.',
        twitterImage: 'www.bspressproducts.com/assets/og-about.jpg',
        h1: 'About BS Press',
        h2: [
            'Leading Environmental Systems Manufacturer',
        ]
    },
    products: {
        title: 'BS Press Products | Environmental Test Chambers & Scientific Equipment',
        description: 'Complete range of environmental test chambers, incubators, ovens, furnaces, freezers, humidity chambers, and custom scientific equipment by BS Press.',
        keywords: 'environmental chambers, test chambers, lab equipment list, BS Press products',
        ogTitle: 'BS Press – Complete Product Range',
        ogDescription: 'Explore environmental test chambers, incubators, ovens, furnaces, cold rooms, and custom scientific systems.',
        ogImage: 'www.bspressproducts.com/assets/og-products.jpg',
        ogUrl: 'www.bspressproducts.com/products',
        ogType: 'website',
        twitterCard: 'summary_large_image',
        twitterTitle: 'BS Press Products',
        twitterDescription: 'Environmental chambers, incubators, ovens, humidity chambers, cryogenic chambers, and more.',
        twitterImage: 'www.bspressproducts.com/assets/og-products.jpg',
        h1: 'Our Complete Range of Scientific & Environmental Testing Equipment',
        h2: [
            'All Products',
        ]
    },
    contact: {
        title: 'Contact BS Press | Scientific Equipment Manufacturer',
        description: 'Get in touch with BS Press for enquiries, technical support, and quotations for environmental test chambers and laboratory equipment.',
        keywords: 'contact BS Press, enquiry, request quote, support, scientific equipment',
        ogTitle: 'Contact BS Press',
        ogDescription: 'Reach out for enquiries, product information, technical support, and quotations.',
        ogImage: 'www.bspressproducts.com/assets/og-contact.jpg',
        ogUrl: 'www.bspressproducts.com/contact',
        ogType: 'website',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Contact BS Press',
        twitterDescription: 'For enquiries and support related to environmental chambers and lab equipment.',
        twitterImage: 'www.bspressproducts.com/assets/og-contact.jpg',
        h1: 'Contact BS Press',
        h2: [
            'Request a Quotation',
        ]
    },
    blog: {
        title: 'BS Press Blog | Environmental Testing & Laboratory Equipment Insights',
        description: 'Insights and articles on environmental test chambers, product testing, humidity control, reliability testing, and scientific instrument technology.',
        keywords: 'environmental testing blog, lab equipment insights, product reliability articles',
        ogTitle: 'BS Press Blog',
        ogDescription: 'Explore articles on environmental testing, product reliability, climatic chambers, and scientific equipment technologies.',
        ogImage: 'www.bspressproducts.com/assets/og-blog.jpg',
        ogUrl: 'www.bspressproducts.com/blog',
        ogType: 'blog',
        twitterCard: 'summary_large_image',
        twitterTitle: 'BS Press Blog',
        twitterDescription: 'Latest information on test chambers, lab equipment, and environmental testing.',
        twitterImage: 'www.bspressproducts.com/assets/og-blog.jpg',
        h1: 'BS Press Pallet',
        h2: [
            'Pallet Posts about environmental test chambers and Scientific Instruments'
        ]
    },
    industries: {
        title: 'Industries Served | Aerospace, Automotive, Pharma, R&D | BS Press',
        description: 'BS Press serves aerospace, automotive, pharmaceutical, biotechnology, electronics, defense, metallurgy, food & beverage, solar, wind energy, and all R&D labs.',
        keywords: 'industries served BS Press, aerospace testing, automotive testing, pharma lab equipment',
        ogTitle: 'Industries Served by BS Press',
        ogDescription: 'Trusted manufacturer serving aerospace, automotive, pharma, biotechnology, electronics, defense, and all research labs.',
        ogImage: 'www.bspressproducts.com/assets/og-industries.jpg',
        ogUrl: 'www.bspressproducts.com/industries',
        ogType: 'website',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Industries Served – BS Press',
        twitterDescription: 'Serving aerospace, automotive, pharma, biotechnology, electronics, research labs and more.',
        twitterImage: 'www.bspressproducts.com/assets/og-industries.jpg',
        h1: 'Trusted Across Industries',
        h2: [
            'Industry Verticals We serve for Environmental Test Chambers & Scientific Laboratory Equipment'
        ]
    },
} as const;

export type PageKey = keyof typeof SEO_CONFIG;