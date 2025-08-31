// lib/media.ts

const CMS_BASE =
  import.meta.env.VITE_CMS_BASE_URL || "";

/**
 * Turn whatever the API gives you (string or object) into an absolute URL.
 * - Accepts a raw value (string or object with .url or .filename)
 * - Optionally accepts width/height for servers that support ?width= / ?height=
 */
export function toMediaUrl(
  raw: any,
  opts?: { width?: number; height?: number }
): string {
  if (!raw) return "";

  const ensureAbs = (u: string) => {
    if (!u) return "";
    if (u.startsWith("http")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${CMS_BASE}${u}`;
    return `${CMS_BASE}/${u}`;
  };

  // Most Payload uploads expose .url. Some put raw strings in the field.
  let base =
    (typeof raw === "string" ? raw : raw?.url || raw?.path || raw?.filename) ||
    "";

  base = ensureAbs(base);

  if (!opts || (!opts.width && !opts.height)) return base;

  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));

  return `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;
}

/**
 * Ask the server for WebP via querystring (common for Payload image endpoints).
 * We also provide a ".webp" swapped extension that works if your server
 * writes webp siblings. The <picture> element will try both.
 */
export function toWebpCandidate(url: string): string {
  if (!url) return "";
  const withParam = `${url}${url.includes("?") ? "&" : "?"}format=webp`;
  return withParam;
}

/** Simple helper to also try swapping the extension to .webp */
export function swapToWebp(url: string): string {
  if (!url) return "";
  return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, ".webp$2");
}

/** Extract a YouTube id from a full url (for video thumbnails) */
export function youtubeId(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    if (u.searchParams.get("v")) return u.searchParams.get("v") || "";
    // /embed/<id>
    const parts = u.pathname.split("/");
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}
