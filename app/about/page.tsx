import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import AboutFooterBand from "@/components/about/AboutFooterBand";
import { getAboutSettings, getGeneralSettings, getContactSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage() {
  const [about, general, contact] = await Promise.all([
    getAboutSettings(),
    getGeneralSettings(),
    getContactSettings(),
  ]);
  const whatsappPhone =
    contact.infoColumns.find((column) => column.label === "Phone:")?.lines[0] ?? "";

  return (
    <>
      <AboutHero about={about} />
      <AboutFooterBand
        siteName={general.siteName}
        contactEmail={general.contactEmail}
        instagramUrl={general.instagramUrl}
        whatsappPhone={whatsappPhone}
      />
    </>
  );
}
