export type BlogCaption = { title?: string; text: string };

export type BlogImagesBlock = {
  type: "images";
  columns: 2 | 3;
  items: { imageId: string; alt: string }[];
  caption?: BlogCaption;
};
export type BlogFullImageBlock = {
  type: "full-image";
  imageId: string;
  alt: string;
  tall?: boolean;
  caption?: BlogCaption;
};
export type BlogHeadingBlock = { type: "heading"; text: string };
export type BlogParagraphBlock = { type: "paragraph"; text: string };

export type BlogBlock =
  | BlogImagesBlock
  | BlogFullImageBlock
  | BlogHeadingBlock
  | BlogParagraphBlock;

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  introParagraphs: string[];
  coverImageId: string;
  coverAlt: string;
  publishedAt: string;
  blocks: BlogBlock[];
};

function img(imageId: string, alt: string) {
  return { imageId, alt };
}

export const posts: BlogPost[] = [
  {
    slug: "a-love-story-told-across-borders",
    title: "A Love Story Told Across Borders, Beautifully Captured by Huk",
    excerpt:
      "From intimate moments to unforgettable celebrations, discover a collection of beautifully captured wedding stories filled with love, elegance, and timeless details. Explore the moments, destinations, and personal touches that make every celebration uniquely yours.",
    introParagraphs: [
      "This celebration was unlike anything we'd shot before — a three-chapter destination wedding that moved from the French Riviera to Dubai and finished on the black-sand coast of Iceland. Each stop brought its own light, its own pace, and its own version of the same two people falling more in love with the day as it unfolded.",
      "For our team, a wedding at this scale is never just about coverage. It's about earning enough trust to disappear into the day — to catch the unscripted second before the planned one, and to let the couple's own taste lead every frame. That trust is what made this particular story one of the most rewarding we've had the privilege to tell.",
    ],
    coverImageId: "1719953146138-e3d54f36a25c",
    coverAlt: "Bride and groom sharing a quiet embrace",
    publishedAt: "2026-06-12",
    blocks: [
      {
        type: "images",
        columns: 3,
        items: [
          img("1492175742197-ed20dc5a6bed", "Bridal portrait detail"),
          img("1533392151650-269f96231f65", "Editorial bridal portrait"),
          img("1621621667797-e06afc217fb0", "Editorial couple portrait"),
          img("1711721017982-3e1808a870eb", "Moody bridal portrait"),
          img("1646842503656-8bd3066306d9", "Editorial bridal detail"),
          img("1596457221755-b96bc3a6df18", "Wedding couple editorial"),
        ],
      },
      {
        type: "full-image",
        imageId: "1783818413085-b6ec40e8e818",
        alt: "Destination wedding venue at golden hour",
      },
      {
        type: "paragraph",
        text: "The ceremony itself was small by design — rows of simple folding chairs set into an open lawn, no arch, no fuss, just enough space for the people who mattered most to stand close. It's the kind of setup that photographs quietly, and somehow that made every reaction feel louder.",
      },
      {
        type: "images",
        columns: 2,
        items: [
          img("1768488292781-4e72a8aeb897", "Wedding venue flowers"),
          img("1769038950045-39d384b97929", "Destination wedding detail"),
        ],
        caption: {
          title: "How I shot this",
          text: "The tablescape photos were all shot on a tripod with exposures ranging from half a second to a full second, usually at f/5.6. Not every shadow needed to be lit, and I actually loved the contrast, even though it is different from the softer, pastel look I am usually known for.",
        },
      },
      {
        type: "full-image",
        imageId: "1603214924133-5c2c78471b73",
        alt: "Wedding couple portrait",
        tall: true,
      },
      {
        type: "images",
        columns: 3,
        items: [
          img("1720535874037-a873d303ea75", "Moody editorial portrait"),
          img("1536113906904-15bfc5b63fc9", "Wedding couple editorial"),
          img("1621621668101-d5c8329b3784", "Editorial couple portrait"),
        ],
      },
      {
        type: "heading",
        text: "Three Destinations, One Extraordinary Love Story.",
      },
      {
        type: "paragraph",
        text: "By the third location, the wardrobe changes and location scouting had become their own kind of ritual. Golden hour on the coast gave way to string lights in a courtyard, then to a quiet garden the next morning before anyone else was awake — three very different backdrops, one continuous story.",
      },
      {
        type: "images",
        columns: 2,
        items: [
          img("1762504013915-c1faf57f291b", "Editorial bridal portrait"),
          img("1768777273699-1f8ccd51aaff", "Destination wedding venue"),
        ],
      },
      {
        type: "full-image",
        imageId: "1783818412499-9f0125ffc44f",
        alt: "Wedding venue flowers",
      },
      {
        type: "heading",
        text: "A Celebration Built Around the Details.",
      },
      {
        type: "paragraph",
        text: "The last night belonged to the details we almost missed while chasing the bigger moments — a hand resting on a shoulder, a laugh caught mid-sentence, the exact shade of the sky right before the lanterns came on.",
      },
      {
        type: "images",
        columns: 3,
        items: [
          img("1654994088609-ffd4c1d2b605", "Wedding couple editorial"),
          img("1505428215601-90f0007b9e83", "Wedding couple portrait"),
          img("1762926627960-18e533c63134", "Destination wedding venue detail"),
        ],
      },
    ],
  },
  {
    slug: "the-art-of-celebration",
    title: "The Art of Celebration",
    excerpt: "Notes on pacing a wedding day so nothing important gets rushed.",
    introParagraphs: ["Notes on pacing a wedding day so nothing important gets rushed."],
    coverImageId: "1763560836989-d3636e2f82d8",
    coverAlt: "Wedding venue flowers detail",
    publishedAt: "2026-05-02",
    blocks: [
      {
        type: "full-image",
        imageId: "1763560836989-d3636e2f82d8",
        alt: "Wedding venue flowers detail",
      },
    ],
  },
  {
    slug: "stories-worth-telling",
    title: "Stories Worth Telling",
    excerpt: "What makes a wedding gallery feel like a story instead of a checklist.",
    introParagraphs: [
      "What makes a wedding gallery feel like a story instead of a checklist.",
    ],
    coverImageId: "1768488292726-9c850289925a",
    coverAlt: "Destination wedding venue",
    publishedAt: "2026-04-18",
    blocks: [
      {
        type: "full-image",
        imageId: "1768488292726-9c850289925a",
        alt: "Destination wedding venue",
      },
    ],
  },
  {
    slug: "celebrations-in-focus",
    title: "Celebrations in Focus",
    excerpt: "A closer look at the quiet, unscripted moments between the big ones.",
    introParagraphs: [
      "A closer look at the quiet, unscripted moments between the big ones.",
    ],
    coverImageId: "1766104799876-cd2916a7903a",
    coverAlt: "Wedding venue at golden hour",
    publishedAt: "2026-03-27",
    blocks: [
      {
        type: "full-image",
        imageId: "1766104799876-cd2916a7903a",
        alt: "Wedding venue at golden hour",
      },
    ],
  },
  {
    slug: "behind-the-story-celebration",
    title: "Behind the Story: Celebration",
    excerpt: "A look at how one destination wedding came together, from scouting to send-off.",
    introParagraphs: [
      "A look at how one destination wedding came together, from scouting to send-off.",
    ],
    coverImageId: "1766104804419-0f66016716de",
    coverAlt: "Wedding venue detail",
    publishedAt: "2026-03-05",
    blocks: [
      {
        type: "full-image",
        imageId: "1766104804419-0f66016716de",
        alt: "Wedding venue detail",
      },
    ],
  },
  {
    slug: "the-huk-edit",
    title: "The HUK Edit",
    excerpt: "Current favorites from recent shoots, collected in one place.",
    introParagraphs: ["Current favorites from recent shoots, collected in one place."],
    coverImageId: "1766104799948-b55b3c759ddc",
    coverAlt: "Destination wedding venue",
    publishedAt: "2026-02-14",
    blocks: [
      {
        type: "full-image",
        imageId: "1766104799948-b55b3c759ddc",
        alt: "Destination wedding venue",
      },
    ],
  },
  {
    slug: "love-style-and-stories",
    title: "Love, Style & Stories",
    excerpt: "On dressing for the day and letting the story lead anyway.",
    introParagraphs: ["On dressing for the day and letting the story lead anyway."],
    coverImageId: "1533392151650-269f96231f65",
    coverAlt: "Editorial bridal portrait",
    publishedAt: "2026-01-22",
    blocks: [
      {
        type: "full-image",
        imageId: "1533392151650-269f96231f65",
        alt: "Editorial bridal portrait",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, count = 6): BlogPost[] {
  return posts.filter((post) => post.slug !== slug).slice(0, count);
}
