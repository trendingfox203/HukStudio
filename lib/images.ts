/**
 * Placeholder image source. Swap this implementation to point at the
 * studio's real photo storage (e.g. a CDN or /public/images) once real
 * photos are available — every image reference in `content/` goes through
 * this single helper.
 */
export function unsplash(photoId: string, width = 1600): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}
