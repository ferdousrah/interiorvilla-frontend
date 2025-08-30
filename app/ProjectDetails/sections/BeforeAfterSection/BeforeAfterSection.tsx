// app/components/ProjectDetails/sections/BeforeAfterSection.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BeforeAfterSlider } from '../../../../components/ui/before-after-slider';

gsap.registerPlugin(ScrollTrigger);

/* ====================== Helpers & Types ====================== */

const CMS_ORIGIN = 'https://cms.interiorvillabd.com';
const absolutize = (u?: string | null) =>
  u ? (/^https?:\/\//i.test(u) ? u : new URL(u, CMS_ORIGIN).href) : '';

type MediaSize = { url?: string | null };
type Media = {
  url?: string | null;
  alt?: string | null;
  sizes?: Record<string, MediaSize | undefined>;
};

type BeforeAfterItem = { id: string; image?: Media | null };
type ProjectAPI = {
  id: number;
  title?: string;
  shortDescription?: string;
  beforeAfterImages?: BeforeAfterItem[];
};

function mediaUrl(m?: Media | null): string {
  if (!m) return '';
  // Prefer sized variants if present (you can tweak the order)
  const order = ['large', 'xlarge', 'medium', 'small', 'og', 'square', 'thumbnail', 'card'];
  for (const key of order) {
    const maybe = m.sizes?.[key]?.url;
    if (maybe) return absolutize(maybe);
  }
  return absolutize(m.url || '');
}

function mediaAlt(m?: Media | null, fallback = 'Before/After image'): string {
  const v = (m?.alt || '').trim();
  return v || fallback;
}

/** Take the first two items: first = BEFORE, second = AFTER */
function pickBeforeAfter(list?: BeforeAfterItem[]) {
  const first = list?.[0]?.image || null;
  const second = list?.[1]?.image || null;

  return {
    beforeUrl: mediaUrl(first) || '/before.jpg',
    afterUrl: mediaUrl(second) || '/after.jpg',
    beforeAlt: mediaAlt(first, 'Before'),
    afterAlt: mediaAlt(second, 'After'),
  };
}

/* ====================== Component ====================== */

type BeforeAfterSectionProps = {
  /** Which project to fetch; defaults to 2 */
  projectId?: number | string;
};

export const BeforeAfterSection: React.FC<BeforeAfterSectionProps> = ({ projectId = 2 }) => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectAPI | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Fetch the project
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const url = `${CMS_ORIGIN}/api/projects/${projectId}?depth=1&draft=false`;
        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ProjectAPI = await res.json();

        if (!cancelled) setProject(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load project');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Animations
  useEffect(() => {
    if (!sectionRef.current) return;

    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            end: 'top 55%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    if (sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sliderRef.current,
            start: 'top 85%',
            end: 'top 55%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    if (descriptionRef.current) {
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: descriptionRef.current,
            start: 'top 85%',
            end: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [project?.id]);

  // Derive before/after pair
  const { beforeUrl, afterUrl, beforeAlt, afterAlt } = pickBeforeAfter(project?.beforeAfterImages);
  const title = project?.title || 'Before & After';
  const description = project?.shortDescription || '';

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1
            ref={titleRef}
            className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-8"
          >
            {title}
          </h1>
        </div>

        {/* States */}
        {loading && (
          <div className="text-center text-gray-600 mb-10">Loading…</div>
        )}
        {err && (
          <div className="text-center text-red-600 mb-10">Error: {err}</div>
        )}

        {/* Slider (only when we have at least one of the two) */}
        {!loading && !err && (beforeUrl || afterUrl) && (
          <div ref={sliderRef} className="mb-12 md:mb-16">
            <BeforeAfterSlider
              beforeImage={beforeUrl || '/before.jpg'}
              afterImage={afterUrl || '/after.jpg'}
              beforeLabel="BEFORE"
              afterLabel="AFTER"
              alt={`${title} — before/after`}
              height="500px"
              className="w-full"
              style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: 'none' }}
            />
            {/* For accessibility, expose textual alts (the slider uses a single alt string).
                If you prefer, you can customize your BeforeAfterSlider to accept beforeAlt/afterAlt separately. */}
            <p className="sr-only">
              Before image alt: {beforeAlt}. After image alt: {afterAlt}.
            </p>
          </div>
        )}

        {/* Description */}
        {!loading && !err && description && (
          <div ref={descriptionRef} className="max-w-3xl mx-auto">
            <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed text-justify">
              {description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
