import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfoBar from "@/components/contact/ContactInfoBar";
import ContactBanner from "@/components/contact/ContactBanner";
import ContactFormSection from "@/components/contact/ContactFormSection";
import { getContactSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const contact = await getContactSettings();

  return (
    <div className="pb-20">
      <ContactHero photos={contact.photos} introParagraphs={contact.introParagraphs} />
      <ContactInfoBar infoColumns={contact.infoColumns} />
      <ContactBanner src={contact.banner.url} />
      <ContactFormSection
        formLabel={contact.formLabel}
        formHeadline={contact.formHeadline}
        formSubtitle={contact.formSubtitle}
      />
    </div>
  );
}
