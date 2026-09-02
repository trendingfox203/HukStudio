export type ContactPhoto = {
  src: string;
  alt: string;
};

export const contactCopy = {
  headline: "Contact",
  heroPhotos: [
    { src: "/images/contact/huk-photo-1.jpg", alt: "HUK holding a camera up to his face" },
    { src: "/images/contact/huk-photo-2.jpg", alt: "HUK holding a camera, looking to the side" },
    { src: "/images/contact/huk-photo-3.jpg", alt: "HUK, wedding photographer" },
  ] satisfies ContactPhoto[],
  bannerImage: {
    src: "/images/contact/huk-banner.jpg",
    alt: "Bride in a floral wedding gown next to a vintage Porsche Speedster",
  } satisfies ContactPhoto,
  introParagraphs: [
    "Hi, I'm Huk, a Vietnamese wedding photographer, based in Saigon and Danang.",
    'My style of shooting is "catching the moment", naturally and emotionally.',
    "If you love travelling, artsy, candid photos and looking for an enthusiatic photographer for your big day, I can't wait to tell your story.",
  ],
  infoColumns: [
    {
      label: "Address:",
      lines: ["Block A, No 590, CMT 8 Street, W.11, D.03,", "Ho Chi Minh City, Vietnam"],
    },
    { label: "Phone:", lines: ["(+84) 966457745"] },
    { label: "Google:", lines: ["Huk Studio"] },
    { label: "Instagram:", lines: ["@hukstudio"] },
    { label: "Pinterest:", lines: ["Huk Kế"] },
  ],
  formLabel: "Contact Form:",
  formHeadline: "Let's tell your story together",
  formSubtitle:
    "Have a wedding in mind or simply want to know more? We'd love to hear about your plans, your story, and what you're dreaming of for your day.",
};
