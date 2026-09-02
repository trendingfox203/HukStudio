export type ProjectItem = {
  name: string;
  imageId: string;
  alt: string;
  galleryUrl: string;
};

function picTimeUrl(slug: string): string {
  return `https://example.pic-time.com/gallery/${slug}`;
}

export type HeroImageEntry = { imageId: string; alt: string };

export const introCopy = {
  label: "Portfolio",
  tagline: "LOVE, TOLD THROUGH LIGHT & FORM",
  subtitle: "Stories of beauty, emotion and timeless moments.",
  headlineBefore: "THE ART",
  headlineAccent: "of",
  headlineAfter: "THE MOMENT",
  heroImages: [
    { imageId: "1719953146138-e3d54f36a25c", alt: "Bride and groom sharing a quiet embrace" },
    { imageId: "1783818413085-b6ec40e8e818", alt: "Destination wedding venue at golden hour" },
    { imageId: "1596457221755-b96bc3a6df18", alt: "Wedding couple editorial" },
    { imageId: "1621621667797-e06afc217fb0", alt: "Editorial couple portrait" },
    { imageId: "1768488292781-4e72a8aeb897", alt: "Wedding venue flowers" },
  ] satisfies HeroImageEntry[],
};

export const pressItems: ProjectItem[] = [
  {
    name: "Felicia & Markus",
    imageId: "1519741497674-611481863552",
    alt: "Felicia and Markus wedding",
    galleryUrl: picTimeUrl("felicia-markus"),
  },
  {
    name: "Jon & Annette",
    imageId: "1517456363055-5d162a453d6d",
    alt: "Jon and Annette wedding",
    galleryUrl: picTimeUrl("jon-annette"),
  },
  {
    name: "Emily & Mena",
    imageId: "1698802060875-2c2da865d28f",
    alt: "Emily and Mena wedding",
    galleryUrl: picTimeUrl("emily-mena"),
  },
  {
    name: "Kalani & Nate",
    imageId: "1694231270668-29aed6da9a8f",
    alt: "Kalani and Nate wedding",
    galleryUrl: picTimeUrl("kalani-nate"),
  },
];

export const weddingGalleries: ProjectItem[] = [
  {
    name: "Sophia & Daniel",
    imageId: "1669651970700-9ed6098002d5",
    alt: "Sophia and Daniel wedding gallery",
    galleryUrl: picTimeUrl("sophia-daniel"),
  },
  {
    name: "Ava & Lucas",
    imageId: "1539357521934-197bc014f047",
    alt: "Ava and Lucas wedding gallery",
    galleryUrl: picTimeUrl("ava-lucas"),
  },
  {
    name: "Isabella & Ethan",
    imageId: "1533417020304-c785906cd8f9",
    alt: "Isabella and Ethan wedding gallery",
    galleryUrl: picTimeUrl("isabella-ethan"),
  },
  {
    name: "Mia & Noah",
    imageId: "1519661111195-fd0704a351c5",
    alt: "Mia and Noah wedding gallery",
    galleryUrl: picTimeUrl("mia-noah"),
  },
  {
    name: "Charlotte & James",
    imageId: "1711721017978-1ed3347edf90",
    alt: "Charlotte and James wedding gallery",
    galleryUrl: picTimeUrl("charlotte-james"),
  },
  {
    name: "Amelia & Henry",
    imageId: "1711721018004-5765df2dd920",
    alt: "Amelia and Henry wedding gallery",
    galleryUrl: picTimeUrl("amelia-henry"),
  },
];

export const editorials: ProjectItem[] = [
  {
    name: "Tuscany Editorial",
    imageId: "1711721017983-6d24958fc265",
    alt: "Tuscany editorial shoot",
    galleryUrl: picTimeUrl("tuscany-editorial"),
  },
  {
    name: "Coastal Vows",
    imageId: "1772404245518-b88fac824c78",
    alt: "Coastal Vows editorial shoot",
    galleryUrl: picTimeUrl("coastal-vows"),
  },
  {
    name: "Garden Romance",
    imageId: "1783818412562-72cf9a682883",
    alt: "Garden Romance editorial shoot",
    galleryUrl: picTimeUrl("garden-romance"),
  },
  {
    name: "Villa Amore",
    imageId: "1769812344337-ec16a1b7cef8",
    alt: "Villa Amore editorial shoot",
    galleryUrl: picTimeUrl("villa-amore"),
  },
  {
    name: "Golden Hour",
    imageId: "1768488292627-7471f9881677",
    alt: "Golden Hour editorial shoot",
    galleryUrl: picTimeUrl("golden-hour"),
  },
];

export type ReviewEntry = {
  quote: string;
  author: string;
  platform: string;
  rating: number;
  avatarImageId: string;
};

export const reviews: ReviewEntry[] = [
  {
    quote:
      "Every image felt like it had already become a memory the moment we saw it. Effortless, timeless, and completely us.",
    author: "Felicia & Markus",
    platform: "Wezoree",
    rating: 5,
    avatarImageId: "1580489944761-15a19d654956",
  },
  {
    quote:
      "We didn't just get photos — we got a whole day retold with more feeling than we remembered living it.",
    author: "Sophia & Daniel",
    platform: "Google",
    rating: 5,
    avatarImageId: "1494790108377-be9c29b29330",
  },
  {
    quote:
      "Quiet, unobtrusive, and somehow everywhere at once. The gallery still stops us mid-scroll months later.",
    author: "Ava & Lucas",
    platform: "The Knot",
    rating: 5,
    avatarImageId: "1662850886700-4ec19bd30d11",
  },
];
