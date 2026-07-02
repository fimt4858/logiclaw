import type { Metadata } from "next";
import Hero from "@/components/public/Hero";
import LocationSection from "@/components/public/LocationSection";
import { getPage, getSettings } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "오시는 길",
};

export default async function LocationPage() {
  const [page, settings] = await Promise.all([
    getPage("location"),
    getSettings(),
  ]);

  return (
    <main className="site-main">
      <Hero
        title={page.hero_title}
        subtitle={page.hero_subtitle}
        imagePath={settings.banner_image_path}
      />
      <LocationSection settings={settings} />
    </main>
  );
}
