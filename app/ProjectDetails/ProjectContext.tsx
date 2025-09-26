'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

type GalleryKind = "photo" | "video" | "plan";
export type GalleryItem = { id: string; src: string; alt: string; type: GalleryKind };
type BeforeAfterPair = { before?: string; after?: string };

type Ctx = {
  loading: boolean;
  error?: string | null;
  project: any;
  title: string;
  plainDescription: string;
  beforeAfter: BeforeAfterPair[];
  gallery: {
    photos: GalleryItem[];
    videos: GalleryItem[];
    plans: GalleryItem[];
  };
};

const ProjectContext = createContext<Ctx | null>(null);
export const useProject = () => {
  const v = useContext(ProjectContext);
  if (!v) throw new Error("useProject must be used inside <ProjectProvider>");
  return v;
};

const CMS_BASE = "https://interiorvillabd.com";

/* ---------------- helpers ---------------- */

const absolutize = (u?: string | null) =>
  u ? (/^https?:\/\//i.test(u) ? u : `${CMS_BASE}${u}`) : "";

const toWebp = (url: string) =>
  url.replace(/\.(jpe?g|png)(\?[^#]*)?$/i, ".webp$2");


function extractMediaUrl(raw: any): string | undefined {
  if (!raw) return;
  if (typeof raw === "string") return absolutize(raw);

  // payload media object or nested shapes
  const candidate =
    raw.url ||
    raw.src ||
    raw.path ||
    raw.file?.url ||
    raw.image?.url ||
    raw.media?.url ||
    raw.sizes?.card?.url ||
    raw.sizes?.preview?.url ||
    raw.sizes?.thumbnail?.url;

  if (candidate) return absolutize(candidate);
  if (raw.filename) return `${CMS_BASE}/api/media/file/${raw.filename}`;
  return;
}

const isVideoUrl = (u?: string) => !!u && /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(u);
const looksLikePlan = (x: any) => {
  const t = (x?.type || x?.kind || x?.imageType || "").toString().toLowerCase();
  return t.includes("plan") || t.includes("floor");
};

function normalizeGalleryItem(raw: any, i: number, fallbackAlt = "media"): GalleryItem | undefined {
  const cand = raw?.image ?? raw?.media ?? raw;
  const url = extractMediaUrl(cand);
  if (!url) return;

  const type: GalleryKind = looksLikePlan(cand) ? "plan" : isVideoUrl(url) ? "video" : "photo";
  const alt =
    cand?.alt ||
    cand?.title ||
    cand?.name ||
    raw?.alt ||
    raw?.title ||
    `${fallbackAlt}-${i + 1}`;

  return {
    id: String(cand?.id ?? raw?.id ?? i),
    src: toWebp(url),        // try WebP first
    alt,
    type,
  };

}

/** Pull arrays from many possible places, including nested `gallery.{photos,plans,videos}` */
function collectRawGallery(project: any): { photos: any[]; plans: any[]; videos: any[] } {
  const photos: any[] = [];
  const plans: any[] = [];
  const videos: any[] = [];

  // New: explicitly read your actual API shape
  if (Array.isArray(project?.gallery?.photos)) photos.push(...project.gallery.photos);
  if (Array.isArray(project?.gallery?.plans)) plans.push(...project.gallery.plans);
  if (Array.isArray(project?.gallery?.videos)) videos.push(...project.gallery.videos);

  // Fall-backs (legacy shapes)
  const pushArr = (arr?: any) => Array.isArray(arr) && photos.push(...arr);
  pushArr(project?.photos);
  pushArr(project?.galleryImages);
  pushArr(project?.mediaGallery);
  pushArr(project?.projectGallery);
  pushArr(project?.images);

  return { photos, plans, videos };
}

/** Build normalized gallery */
function buildGallery(project: any) {
  const { photos: rawPhotos, plans: rawPlans, videos: rawVideos } = collectRawGallery(project);

  const photos: GalleryItem[] = rawPhotos
    .map((r: any, i: number) => normalizeGalleryItem(r, i, "photo"))
    .filter(Boolean) as GalleryItem[];

  const plans: GalleryItem[] = rawPlans
    .map((r: any, i: number) => normalizeGalleryItem(r, i, "plan"))
    .filter(Boolean)
    .map((it) => ({ ...it, type: "plan" as const }));

  // Videos come as objects with videoUrl; normalize separately
  const videos: GalleryItem[] = rawVideos
    .map((v: any, i: number) => {
      const url = v?.videoUrl || v?.url;
      if (!url) return undefined;
      return {
        id: String(v?.id ?? i),
        src: url,
        alt: v?.title || project?.title || "video",
        type: "video" as const,
      };
    })
    .filter(Boolean) as GalleryItem[];

  return { photos, videos, plans };
}

/** Your API’s `beforeAfterImages` is a list of images.
 *  If there are at least two, treat [0] as BEFORE and [1] as AFTER. */
function buildBeforeAfter(project: any): BeforeAfterPair[] {
  const out: BeforeAfterPair[] = [];

  if (Array.isArray(project?.beforeAfterImages)) {
    const imgs = project.beforeAfterImages
      .map((row: any) => row?.image || row)
      .map((img: any) => extractMediaUrl(img))
      .filter(Boolean) as string[];

    if (imgs.length >= 2) {
      out.push({ before: imgs[0], after: imgs[1] });
      return out;
    }
  }

  // single-image fallbacks
  const singleBefore = extractMediaUrl(project?.beforeImage || project?.before_photo);
  const singleAfter = extractMediaUrl(project?.afterImage || project?.after_photo);
  if (singleBefore || singleAfter) {
    out.push({ before: singleBefore, after: singleAfter });
    return out;
  }

  // last resort: featured + first gallery photo
  const featured = extractMediaUrl(project?.featuredImage);
  const firstGallery = collectRawGallery(project).photos?.[0];
  const firstUrl = firstGallery ? extractMediaUrl(firstGallery?.image ?? firstGallery) : undefined;
  if (featured || firstUrl) out.push({ before: featured, after: firstUrl });

  return out;
}

// Flatten Payload lexical JSON to plain text
function lexicalToPlain(details: any): string {
  try {
    if (typeof details === "string") return details;
    const root = details?.root ?? details;
    const lines: string[] = [];
    const walk = (n: any) => {
      if (!n) return;
      if (Array.isArray(n)) return n.forEach(walk);
      if (typeof n === "object") {
        if (n.type === "text" && typeof n.text === "string") lines.push(n.text);
        if (n.children) walk(n.children);
      }
    };
    walk(root?.children ?? root);
    return lines.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

function metaPick(project: any, keys: string[]) {
  for (const k of keys) {
    const v = project?.[k];
    if (v != null && String(v).trim() !== "") return String(v);
    const mv = project?.meta?.[k];
    if (mv != null && String(mv).trim() !== "") return String(mv);
  }
  return "";
}

/* ---------------- provider ---------------- */

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { slug } = useParams<{ slug?: string }>();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [proj, setProj] = useState<any | null>(null);

  useEffect(() => {
  if (!slug) return;
  let alive = true;
  const ac = new AbortController();

  (async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(
        `${CMS_BASE}/api/projects?where[slug][equals]=${slug}&depth=1&draft=false`,
        { signal: ac.signal, cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Failed to load project ${slug} (HTTP ${res.status})`);

      const json = await res.json();
      if (!alive) return;

      // Payload returns { docs: [...] } for collection queries
      const projectDoc = Array.isArray(json?.docs) ? json.docs[0] : json?.doc || json;
      setProj(projectDoc || null);
    } catch (e: any) {
      if (!alive || e?.name === "AbortError") return;
      setErr(e?.message || "Failed to load");
      setProj(null);
    } finally {
      alive && setLoading(false);
    }
  })();

  return () => {
    alive = false;
    ac.abort();
  };
}, [slug]);

  const value: Ctx = useMemo(() => {
    if (!proj) {
      return {
        loading,
        error: err,
        project: null,
        title: "",
        plainDescription: "",
        beforeAfter: [],
        gallery: { photos: [], videos: [], plans: [] },
      };
    }

    const title = proj?.title || proj?.name || proj?.heading || "Project";
    const description = lexicalToPlain(proj?.details) || proj?.shortDescription || proj?.description || "";
    const beforeAfter = buildBeforeAfter(proj);
    const gallery = buildGallery(proj);

    return {
      loading,
      error: err,
      project: {
        ...proj,
        year: metaPick(proj, ["year", "Year", "projectYear"]),
        squareFootage: metaPick(proj, ["squareFootage", "square_footage", "squareFeet", "sqft", "area", "area_sqft", "size"]),
        location: metaPick(proj, ["location", "address", "city", "district"]),
        client: metaPick(proj, ["client", "owner", "customer"]),
      },
      title,
      plainDescription: description,
      beforeAfter,
      gallery,
    };
  }, [proj, loading, err]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
