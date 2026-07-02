import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { getSettings } from "@/lib/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <Header />
      {children}
      <Footer
        phone={settings.phone}
        address={settings.address}
        copyright={settings.copyright}
      />
    </>
  );
}
