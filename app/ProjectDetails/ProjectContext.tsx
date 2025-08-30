'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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

const CMS_BASE = "https://cms.interiorvillabd.com";

// ---------- helpers ----------
function extractMediaUrl(raw: any): string | undefined {
  if (!raw) return;
  if (typeof raw === "string") return raw.startsWith("http") ? raw : CMS_BASE + raw;

  const candidate =
    raw.url ||
    raw.src ||
    raw.path ||
    raw.file?.url ||
    raw.image?.url ||
    raw.media?.url ||
    raw.sizes?.large?.url ||
    raw.sizes?.medium?.url ||
    raw.sizes?.card?.url ||
    raw.sizes?.preview?.url ||
    raw.sizes?.thumbnail?.url;

  if (candidate) return candidate.startsWith("http") ? candidate : CMS_BASE + candidate;
  if (raw.filename) return `${CMS_BASE}/api/media/file/${raw.filename}`;
  return;
}

const isVideoUrl = (u?: string) => !!u && /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(u);
const looksLikePlan = (x: any) => {
  const t = (x?.type || x?.kind || x?.imageType || "").toString().toLowerCase();
  return t.includes("plan") || t.includes("floor");
};

function collectRawGallery(project: any): any[] {
  const pools: any[] = [];
  const pushArr = (arr: any) => Array.isArray(arr) && pools.push(...arr);

  // Try different possible gallery field names
  pushArr(project?.gallery);
  pushArr(project?.galleries);
  pushArr(project?.images);
  pushArr(project?.media);
  pushArr(project?.mediaGallery);
  pushArr(project?.projectGallery);
  pushArr(project?.photoGallery);
  pushArr(project?.photos);
  pushArr(project?.galleryImages);
  pushArr(project?.floorPlans);
  pushArr(project?.plans);

  // Also check for nested gallery structures
  if (project?.projectGallery?.images) {
    pushArr(project.projectGallery.images);
  }
  if (project?.gallery?.images) {
    pushArr(project.gallery.images);
  }

  const single =
    project?.gallery ||
    project?.media ||
    project?.featuredImage ||
    project?.image;
  if (single && !Array.isArray(single)) pools.push(single);

  return pools;
}

function normalizeGalleryItem(raw: any, i: number): GalleryItem | undefined {
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
    `media-${i + 1}`;

  return { id: (cand?.id ?? raw?.id ?? `${i}`) + "", src: url, alt, type };
}

function buildGallery(project: any) {
  const photos: GalleryItem[] = [];
  const videos: GalleryItem[] = [];
  const plans:  GalleryItem[] = [];

  const raw = collectRawGallery(project);
  console.log('Raw gallery data:', raw); // Debug log
  
  raw.forEach((r, i) => {
    const it = normalizeGalleryItem(r, i);
    if (!it) return;
    console.log('Normalized gallery item:', it); // Debug log
    
    if (it.type === "photo") photos.push(it);
    else if (it.type === "video") videos.push(it);
    else plans.push(it);
  });

  console.log('Built gallery:', { photos: photos.length, videos: videos.length, plans: plans.length }); // Debug log
  return { photos, videos, plans };
}

function buildBeforeAfter(project: any): BeforeAfterPair[] {
  const out: BeforeAfterPair[] = [];

  if (Array.isArray(project?.beforeAfterImages)) {
    project.beforeAfterImages.forEach((row: any) => {
      const before = extractMediaUrl(row?.before || row?.beforeImage || row?.before_photo);
      const after  = extractMediaUrl(row?.after  || row?.afterImage  || row?.after_photo);
      if (before || after) out.push({ before, after });
    });
  }

  const singleBefore = extractMediaUrl(project?.beforeImage || project?.before_photo);
  const singleAfter  = extractMediaUrl(project?.afterImage  || project?.after_photo);
  if (singleBefore || singleAfter) out.push({ before: singleBefore, after: singleAfter });

  if (!out.length) {
    const feat = extractMediaUrl(project?.featuredImage);
    const firstGalleryItem = collectRawGallery(project)[0];
    const gUrl =
      extractMediaUrl(firstGalleryItem?.image) ||
      extractMediaUrl(firstGalleryItem);
    if (feat || gUrl) out.push({ before: feat, after: gUrl });
  }

  return out;
}

function lexicalToPlain(details: any): string {
  // payload lexical-style -> plain text
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

// ---------- provider ----------
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [proj, setProj] = useState<any | null>(null);

  useEffect(() => {
    if (!id) {
      setErr("No project ID provided");
      setLoading(false);
      return;
    }
    
    let alive = true;
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        console.log('Fetching project with ID:', id); // Debug log
        const res = await fetch(`${CMS_BASE}/api/projects/${id}?depth=2`, { 
          signal: ac.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!res.ok) {
          throw new Error(`Failed to load project ${id}: ${res.status} ${res.statusText}`);
        }
        
        const json = await res.json();
        console.log('Fetched project data:', json); // Debug log
        
        if (!alive) return;
        
        // Handle both direct project object and wrapped response
        const projectData = json?.doc || json || null;
        setProj(projectData);
        
        if (!projectData) {
          throw new Error(`Project ${id} not found`);
        }
      } catch (e: any) {
        if (!alive || e?.name === "AbortError") return;
        console.error('Project fetch error:', e); // Debug log
        setErr(e?.message || "Failed to load project");
        setProj(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, [id]);

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

    const title =
      proj?.title || proj?.name || proj?.heading || "Project";

    const description =
      lexicalToPlain(proj?.details) ||
      proj?.shortDescription ||
      proj?.description ||
      "";

    const beforeAfter = buildBeforeAfter(proj);
    const gallery = buildGallery(proj);

    return {
      loading,
      error: err,
      project: {
        ...proj,
        year: metaPick(proj, ["year", "Year", "projectYear"]),
        squareFootage: metaPick(proj, [
          "squareFootage",
          "square_footage",
          "squareFeet",
          "sqft",
          "area",
          "area_sqft",
        ]),
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