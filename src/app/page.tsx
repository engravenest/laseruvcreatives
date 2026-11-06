import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HowItWorks from "@/components/home/HowItWorks";
import WhyUs from "@/components/home/WhyUs";
import ReviewsSection from "@/components/home/ReviewsSection";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Shop by Category */}
      <CategorySection />

      {/* 3. Featured Products & Live Customization */}
      <FeaturedProducts />

      {/* 4. How It Works (4 Steps) */}
      <HowItWorks />

      {/* 5. Why LaserUVCreatives (5 Pillars) */}
      <WhyUs />

      {/* 6. Customer Reviews */}
      <ReviewsSection />

      {/* 7. Call To Action Banner */}
      <CtaBanner />
    </div>
  );
}
