import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import { getAboutSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage() {
  const about = await getAboutSettings();
  return <AboutHero about={about} />;
}
