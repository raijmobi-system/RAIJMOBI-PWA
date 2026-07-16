export const GATEWAY_URL = "http://localhost:8000";

/**
 * Resolves any photo value returned by the backend (Django absolute URL pointing at an
 * internal Docker host like `user-service:8000`/`ride-service:8000`, a relative `/media/...`
 * path, or a bare filename) into a URL that's actually reachable through the Kong gateway.
 */
export function getImageUrl(
  rawPhoto: string | null | undefined,
  defaultFolder: string = "avatars"
): string | null {
  if (!rawPhoto || typeof rawPhoto !== "string") return null;

  const cleanPhoto = rawPhoto.trim();
  if (!cleanPhoto) return null;

  // 1. Contains "/media/" anywhere (including behind an internal Docker host like
  // http://user-service:8000/media/... or http://ride-service:8000/media/...) — strip
  // everything before it and rebuild through the public gateway.
  const mediaIndex = cleanPhoto.indexOf("/media/");
  if (mediaIndex !== -1) {
    return `${GATEWAY_URL}${cleanPhoto.substring(mediaIndex)}`;
  }

  const mediaIndexNoSlash = cleanPhoto.indexOf("media/");
  if (mediaIndexNoSlash !== -1) {
    const mediaPath = cleanPhoto.substring(mediaIndexNoSlash - 1);
    return `${GATEWAY_URL}${mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`}`;
  }

  // 2. A legitimate external URL with no /media/ path (Google/Facebook avatar, S3, etc).
  if (cleanPhoto.startsWith("http://") || cleanPhoto.startsWith("https://")) {
    return cleanPhoto;
  }

  // 3. A bare relative path straight from the database (e.g. "avatars/foto.jpg").
  const pathWithoutSlash = cleanPhoto.startsWith("/") ? cleanPhoto.slice(1) : cleanPhoto;
  if (pathWithoutSlash.includes("/")) {
    return `${GATEWAY_URL}/media/${pathWithoutSlash}`;
  }

  return `${GATEWAY_URL}/media/${defaultFolder}/${pathWithoutSlash}`;
}
