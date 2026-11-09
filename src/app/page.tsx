import { getPage } from "@/lib/siteStore";
import { pageMetadata } from "@/lib/pageMetadata";
import PageSections from "@/components/site/PageSections";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return pageMetadata(getPage("")!); }
import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HowItWorks from "@/components/home/HowItWorks";
import WhyUs from "@/components/home/WhyUs";
import ReviewsSection from "@/components/home/ReviewsSection";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  const page = getPage("")!;
  const section = (id: string) => page.sections.find(section => section.id === id);
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <Hero title={page.title} description={page.description} />

      {/* 2. Shop by Category */}
      {section("categories")?.enabled && <CategorySection section={section("categories")} />}

      {/* 3. Featured Products & Live Customization */}
      {section("featured")?.enabled && <FeaturedProducts section={section("featured")} />}

      {/* 4. How It Works (4 Steps) */}
      {section("how")?.enabled && <HowItWorks section={section("how")} />}

      {/* 5. Why LaserUVCreatives (5 Pillars) */}
      {section("why")?.enabled && <WhyUs section={section("why")} />}

      {/* 6. Customer Reviews */}
      {section("reviews")?.enabled && <ReviewsSection section={section("reviews")} />}

      {/* 7. Call To Action Banner */}
      {section("cta")?.enabled && <CtaBanner section={section("cta")} />}
      <PageSections sections={page.sections.filter(section => !["categories", "featured", "how", "why", "reviews", "cta"].includes(section.id))} />
    </div>
  );
}
