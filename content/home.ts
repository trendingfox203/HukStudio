export type HomeImage = {
  id: string;
  alt: string;
  orientation: "portrait" | "landscape";
};

function img(
  id: string,
  alt: string,
  orientation: HomeImage["orientation"],
): HomeImage {
  return { id, alt, orientation };
}

export const homeImages: HomeImage[] = [
  img("1719953146138-e3d54f36a25c", "Bride and groom sharing a quiet embrace", "landscape"),
  img("1492175742197-ed20dc5a6bed", "Bridal portrait detail", "portrait"),
  img("1533392151650-269f96231f65", "Editorial bridal portrait", "portrait"),
  img("1783818413085-b6ec40e8e818", "Destination wedding venue at golden hour", "landscape"),
  img("1621621667797-e06afc217fb0", "Editorial couple portrait", "portrait"),
  img("1711721017982-3e1808a870eb", "Moody bridal portrait", "portrait"),
  img("1646842503656-8bd3066306d9", "Editorial bridal detail", "portrait"),
  img("1596457221755-b96bc3a6df18", "Wedding couple editorial", "landscape"),
  img("1768488292781-4e72a8aeb897", "Wedding venue flowers", "landscape"),
  img("1769038950045-39d384b97929", "Destination wedding detail", "landscape"),
  img("1603214924133-5c2c78471b73", "Wedding couple portrait", "portrait"),
  img("1720535874037-a873d303ea75", "Moody editorial portrait", "landscape"),
  img("1536113906904-15bfc5b63fc9", "Wedding couple editorial", "portrait"),
  img("1621621668101-d5c8329b3784", "Editorial couple portrait", "portrait"),
  img("1762504013915-c1faf57f291b", "Editorial bridal portrait", "landscape"),
  img("1768777273699-1f8ccd51aaff", "Destination wedding venue", "landscape"),
  img("1783818412499-9f0125ffc44f", "Wedding venue flowers", "landscape"),
  img("1654994088609-ffd4c1d2b605", "Wedding couple editorial", "portrait"),
  img("1505428215601-90f0007b9e83", "Wedding couple portrait", "landscape"),
  img("1762926627960-18e533c63134", "Destination wedding venue detail", "landscape"),
  img("1763560836989-d3636e2f82d8", "Wedding venue flowers detail", "portrait"),
  img("1768488292726-9c850289925a", "Destination wedding venue", "landscape"),
  img("1766104799876-cd2916a7903a", "Wedding venue at golden hour", "landscape"),
  img("1766104804419-0f66016716de", "Wedding venue detail", "portrait"),
  img("1766104799948-b55b3c759ddc", "Destination wedding venue", "landscape"),
];
