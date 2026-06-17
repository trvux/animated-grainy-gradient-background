import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import ProcessSection from "@/components/ProcessSection";

export default function Home() {
  return (
    <main className="relative text-foreground font-sans overflow-x-hidden min-h-screen bg-background">
      <div className="dark">
        <HeroSection />
      </div>
      <div className="relative z-10 bg-background text-foreground">
        <FeaturesSection />
        <ProcessSection />
        <PricingSection />
        <Footer />
      </div>
    </main>
  );
}
