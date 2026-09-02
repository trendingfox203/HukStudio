export type AboutHeadline = {
  text: string;
  tag?: string;
};

export const aboutCopy = {
  heading: "Hi, I'm HUK — a Vietnamese wedding photographer based between Saigon and Danang.",
  paragraphs: [
    "I'm drawn to the beauty of honest moments — the quiet glances, spontaneous laughter, and emotions that unfold naturally. My approach is intuitive and unobtrusive, allowing each celebration to reveal itself authentically through my lens.",
    "Inspired by travel, art, and the poetry of candid photography, I believe the most meaningful images are never forced. They are felt, lived, and remembered.\nIf you're looking for someone to capture not only how your wedding looked, but how it truly felt, I'd love to tell your story.",
  ],
  exploreHref: "/portfolio",
  exploreLabel: "Explore More",
  portraitSrc: "/images/about/huk-portrait.jpg",
  portraitAlt: "Portrait of HUK, wedding photographer",
  headlines: [
    { text: "About HUK", tag: "Wedding Photographer, Vietnam" },
    { text: "Behind the Lens", tag: "Natural & Emotional" },
    { text: "Nice to Meet You", tag: "A Note from HUK" },
    { text: "My Story", tag: "Saigon · Danang · Worldwide" },
    { text: "More Than" },
    { text: "a Photographer", tag: "Art, Travel & Stories" },
  ] satisfies AboutHeadline[],
  closingBold:
    "With an intuitive, unobtrusive approach, I capture the fleeting gestures, quiet emotions, and honest moments that make your celebration uniquely yours.",
  closingItalic: "Your story, naturally observed. Authentically captured.",
};
