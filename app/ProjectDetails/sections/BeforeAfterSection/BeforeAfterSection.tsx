'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BeforeAfterSlider } from '../../../../components/ui/before-after-slider';
import { useProject } from '../../ProjectContext';

gsap.registerPlugin(ScrollTrigger);

export const BeforeAfterSection = (): JSX.Element => {
  const { title, plainDescription, beforeAfter } = useProject();

  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const pair = beforeAfter[0] || { before: '/before.jpg', after: '/after.jpg' };

  useEffect(() => {
    if (!sectionRef.current) return;

    if (titleRef.current) {
      gsap.fromTo(titleRef.current, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    }
    if (sliderRef.current) {
      gsap.fromTo(sliderRef.current, { opacity: 0, y: 60, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sliderRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    }
    if (descriptionRef.current) {
      gsap.fromTo(descriptionRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: descriptionRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    }
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [pair?.before, pair?.after]);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white -mt-48 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 ref={titleRef} className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-8">
            {title}
          </h1>
        </div>

        {(pair.before || pair.after) && (
          <div ref={sliderRef} className="mb-12 md:mb-16">
            <BeforeAfterSlider
              beforeImage={pair.before || '/before.jpg'}
              afterImage={pair.after || '/after.jpg'}
              beforeLabel="BEFORE"
              afterLabel="AFTER"
              height="500px"
              className="w-full"
              style={{ borderRadius: 20, overflow: 'hidden', boxShadow: 'none' }}
            />
          </div>
        )}

        {!!plainDescription && (
          <div ref={descriptionRef} className="max-w-1xl mx-auto">
            <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed text-justify">
              {plainDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
