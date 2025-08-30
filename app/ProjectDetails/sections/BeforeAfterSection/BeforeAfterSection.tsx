'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BeforeAfterSlider } from '../../../../components/ui/before-after-slider';
import { useProject } from '../../ProjectContext';

gsap.registerPlugin(ScrollTrigger);

export const BeforeAfterSection: React.FC = () => {
  const { project, beforeAfter, loading, error, title } = useProject();

  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

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
  }, []);

  // Show loading state
  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#626161] [font-family:'Fahkwang',Helvetica]">Loading project...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="py-16 md:py-20 bg-white relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <p className="text-red-600 [font-family:'Fahkwang',Helvetica]">Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Get the first before/after pair
  const beforeAfterPair = beforeAfter?.[0];
  const projectTitle = title || project?.title || "Project";
  const description = project?.shortDescription || project?.description || "";

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1
            ref={titleRef}
            className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-8"
          >
            {projectTitle}
          </h1>
        </div>

        {/* Before/After Slider - only show if we have both images */}
        {beforeAfterPair?.before && beforeAfterPair?.after && (
          <div ref={sliderRef} className="mb-12 md:mb-16">
            <BeforeAfterSlider
              beforeImage={beforeAfterPair.before}
              afterImage={beforeAfterPair.after}
              beforeLabel="BEFORE"
              afterLabel="AFTER"
              alt={`${projectTitle} — before/after transformation`}
              height="500px"
              className="w-full"
              style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: 'none' }}
            />
          </div>
        )}

        {/* Description */}
        {description && (
          <div ref={descriptionRef} className="max-w-3xl mx-auto text-center">
            <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Debug info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p>Debug - Before/After pairs: {beforeAfter?.length || 0}</p>
            <p>First pair: {beforeAfterPair ? 'Available' : 'Not available'}</p>
            <p>Before: {beforeAfterPair?.before ? 'Yes' : 'No'}</p>
            <p>After: {beforeAfterPair?.after ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </section>
  );
};