import type { Metadata } from "next";
import Hero from "@/components/public/Hero";
import StaffCard from "@/components/public/StaffCard";
import { getPage, getSettings, getStaffMembers } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "구성원",
};

export default async function StaffPage() {
  const [page, settings, members] = await Promise.all([
    getPage("staff"),
    getSettings(),
    getStaffMembers(),
  ]);

  return (
    <main className="site-main">
      <Hero
        title={page.hero_title}
        subtitle={page.hero_subtitle}
        imagePath={settings.banner_image_path}
      />
      <section className="staff-section">
        {members.map((member) => (
          <StaffCard key={member.id} member={member} />
        ))}
      </section>
    </main>
  );
}
