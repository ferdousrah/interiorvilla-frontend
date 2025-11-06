// ProjectInfoSection/ProjectInfoSection.tsx
'use client';

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProject } from "../../ProjectContext";

gsap.registerPlugin(ScrollTrigger);

export const ProjectInfoSection = (): JSX.Element => {
  const { project } = useProject();

  const sectionRef = useRef<HTMLElement>(null);
  const infoGridRef = useRef<HTMLDivElement>(null);

  const first = (keys: string[]): string => {
    for (const k of keys) {
      const v = (project as any)?.[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
    }
    return "—";
  };

  const year = first(["year", "Year"]);
  const sqft = first(["size", "squareFootage", "square_footage", "size"]);
  const location = first(["location", "address", "city", "district"]);
  const client = first(["client", "owner"]);

  useEffect(() => {
    if (!sectionRef.current) return;

    if (infoGridRef.current) {
      const items = infoGridRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: infoGridRef.current,
            start: "top 85%",
            end: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-8 md:py-12 bg-white -mt-8 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-8">
          {/* Year */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4 uppercase tracking-wider">
              Year
            </h3>
            <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161]">{year}</p>
          </div>

          {/* Square Footage */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4 uppercase tracking-wider">
              Square Footage
            </h3>
            <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161]">{sqft}</p>
          </div>

          {/* Location */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4 uppercase tracking-wider">
              Location
            </h3>
            <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161]">{location}</p>
          </div>

          {/* Client */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4 uppercase tracking-wider">
              Client
            </h3>
            <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161]">{client}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
