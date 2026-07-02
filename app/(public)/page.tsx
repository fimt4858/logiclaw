import Hero from "@/components/public/Hero";
import CoreValues from "@/components/public/CoreValues";
import ContactMethodCards from "@/components/public/ContactMethodCards";
import LocationSection from "@/components/public/LocationSection";
import { SITE_NAME } from "@/lib/constants";
import {
  getContactMethods,
  getCoreValues,
  getPage,
  getSettings,
} from "@/lib/queries";

export const revalidate = 3600;

export default async function Home() {
  const [page, settings, coreValues, contactMethods] = await Promise.all([
    getPage("home"),
    getSettings(),
    getCoreValues(),
    getContactMethods(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: SITE_NAME,
    telephone: settings.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "KR",
    },
    url: "https://logiclaw.co.kr",
  };

  return (
    <main className="site-main site-main--home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero
        title={page.hero_title}
        imagePath={settings.banner_image_path}
        fullscreen
      />
      <CoreValues values={coreValues} />
      <ContactMethodCards methods={contactMethods} showTitle />
      <LocationSection settings={settings} title="찾아오시는 길" />
    </main>
  );
}
