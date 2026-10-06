import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfoBar from "@/components/contact/ContactInfoBar";
import { getContactSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const contact = await getContactSettings();

  return (
    <div className="pb-20">
      <ContactHero
        bannerUrl={contact.banner.url}
        formLabel={contact.formLabel}
        formSubtitle={contact.formSubtitle}
      />
      <ContactInfoBar infoColumns={contact.infoColumns} />
    </div>
  );
}
