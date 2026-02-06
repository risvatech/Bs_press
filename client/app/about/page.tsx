import AboutVariant1 from "@/app/about/AboutVariant1";
import AboutVariant2 from "@/app/about/AboutVariant2";
import AboutVariant3 from "@/app/about/AboutVariant3";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhyChooseUsBS from "@/app/about/WhyChooseFutureIndias";
import PDFViewerSection from "@/app/components/PDFViewerSection";

export default function Aboutus() {
    return (
        <>
            <Navbar/>
            <AboutVariant2/>
            <PDFViewerSection/>
            <AboutVariant1/>
            {/*<AboutVariant3/>*/}
            <WhyChooseUsBS/>
            <Footer/>
        </>
    );
}