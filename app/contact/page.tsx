import type { Metadata } from "next";
import Hero from "@/components/public/Hero";
import ContactMethodCards from "@/components/public/ContactMethodCards";
import { getContactMethods, getPage, getSettings } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "상담예약",
};

export default async function ContactPage() {
  const [page, settings, methods] = await Promise.all([
    getPage("contact"),
    getSettings(),
    getContactMethods(),
  ]);

  return (
    <main className="site-main">
      <Hero
        title={page.hero_title}
        subtitle={page.hero_subtitle}
        imagePath={settings.banner_image_path}
      />
      <ContactMethodCards methods={methods} />
    </main>
  );
}
