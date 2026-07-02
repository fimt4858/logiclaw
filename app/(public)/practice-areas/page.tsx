import type { Metadata } from "next";
import Hero from "@/components/public/Hero";
import PracticeList from "@/components/public/PracticeList";
import { getPage, getPracticeAreas, getSettings } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "업무분야",
};

export default async function PracticeAreasPage() {
  const [page, settings, areas] = await Promise.all([
    getPage("practice-areas"),
    getSettings(),
    getPracticeAreas(),
  ]);

  return (
    <main className="site-main">
      <Hero
        title={page.hero_title}
        subtitle={page.hero_subtitle}
        imagePath={settings.banner_image_path}
      />
      <PracticeList areas={areas} />
    </main>
  );
}
