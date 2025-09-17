import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface TeamMember {
  id: number;
  name: string;
  designation: string;
  licenseNumber: string | null;
  photo: number;
  photoUrl: string;
  updatedAt: string;
  createdAt: string;
}

interface TeamApiResponse {
  docs: TeamMember[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  page: number;
  pagingCounter: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}

// --- Force .jpeg/.jpg -> .webp ---
const convertToWebp = (url: string) => url.replace(/\.jpe?g(\?[^#]*)?$/i, ".webp$1");

export const TeamSection = (): JSX.Element => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Outer and inner containers for the team carousel
  const teamGridRef = useRef<HTMLDivElement>(null);
  const teamWrapperRef = useRef<HTMLDivElement>(null);

  // Hold the GSAP animation for pausing/resuming
  const autoScrollAnim = useRef<gsap.core.Tween | null>(null);

  // Fetch team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        //const response = await fetch('https://cms.interiorvillabd.com/api/team-members?depth=1');
        const response = await fetch('https://cms.interiorvillabd.com/api/team-members');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: TeamApiResponse = await response.json();
        
        // Sort team members by creation date (newest first) or by a specific order if needed
        const sortedMembers = data.docs.sort((a, b) => {
          // You can customize this sorting logic based on your needs
          // For now, sorting by creation date
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        
        setTeamMembers(sortedMembers);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch team members');
        
        // Fallback to static data if API fails
        setTeamMembers([
          {
            id: 1,
            name: "Md Ashikur Rahman",
            designation: "Founder & CEO",
            licenseNumber: null,
            photo: 15,
            photoUrl: "https://cms.interiorvillabd.com/api/media/file/ashikur-rahman.jpeg?v=1755157308373",
            updatedAt: "2025-08-14T07:41:55.124Z",
            createdAt: "2025-08-14T07:41:55.124Z"
          },
          {
            id: 2,
            name: "Nashiba Shahariar",
            designation: "Head of Business",
            licenseNumber: null,
            photo: 16,
            photoUrl: "https://cms.interiorvillabd.com/api/media/file/nashiba.jpeg?v=1755157615735",
            updatedAt: "2025-08-14T07:46:59.862Z",
            createdAt: "2025-08-14T07:46:59.861Z"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  /* ---------------------- Scroll-triggered animations ---------------------- */
  useEffect(() => {
    if (!sectionRef.current) return;

    // Heading animation on scroll
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Description animation on scroll
    if (descriptionRef.current) {
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 30, filter: "blur(5px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: descriptionRef.current,
            start: "top 85%",
            end: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Card entrance animation on scroll - only after data is loaded
    if (teamGridRef.current && !loading && teamMembers.length > 0) {
      const cards = teamGridRef.current.querySelectorAll(".team-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 80, rotationY: -20, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: teamGridRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [loading, teamMembers.length]);

  /* ------------------------ Hover animation for heading ------------------------ */
  useEffect(() => {
    const headingEl = headingRef.current;
    const wrapperEl = headingWrapperRef.current;
    if (!headingEl || !wrapperEl) return;

    const splitText = new SplitText(headingEl, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapperEl.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      gsap.to(splitText.chars, {
        duration: 0.5,
        y: (i) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
        x: (i) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
        rotationY: (x - 0.5) * 20,
        rotationX: (y - 0.5) * -20,
        ease: "power2.out",
        stagger: { amount: 0.3, from: "center" },
      });
    };

    const handleMouseLeave = () => {
      gsap.to(splitText.chars, {
        duration: 1,
        y: 0,
        x: 0,
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1, 0.3)",
        stagger: { amount: 0.3, from: "center" },
      });
    };

    wrapperEl.addEventListener("mousemove", handleMouseMove);
    wrapperEl.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      splitText.revert();
      wrapperEl.removeEventListener("mousemove", handleMouseMove);
      wrapperEl.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Duplicate members for seamless loop (only if we have members)
  const extendedTeamMembers = teamMembers.length > 0 ? [...teamMembers, ...teamMembers] : [];

  /* --------------------- Infinite scroll animation on desktop --------------------- */
  useLayoutEffect(() => {
    const wrapper = teamWrapperRef.current;
    if (!wrapper || loading || teamMembers.length === 0) return;

    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop) return;

    let animation: gsap.core.Tween | null = null;

    const startLoop = () => {
      gsap.set(wrapper, { x: 0 });
      const loopWidth = wrapper.scrollWidth / 2;
      animation = gsap.to(wrapper, {
        x: -loopWidth,
        ease: "none",
        duration: 20,
        repeat: -1,
      });
      autoScrollAnim.current = animation;
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(startLoop, 100);

    const onResize = () => {
      if (animation) {
        animation.kill();
        startLoop();
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timer);
      if (animation) animation.kill();
      autoScrollAnim.current = null;
      window.removeEventListener("resize", onResize);
    };
  }, [teamMembers.length, loading]);

  // Loading state
  if (loading) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-[#f7f9fb]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6">
              Meet Our <span className="text-secondary">Team</span>
            </h2>
            <p className="text-lg [font-family:'Fahkwang',Helvetica] text-[#626161] max-w-4xl mx-auto leading-relaxed">
              Our team of talented professionals brings together diverse expertise and creative vision to deliver exceptional results.
            </p>
          </div>
          
          {/* Loading skeleton */}
          <div className="flex gap-8 md:gap-12 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center bg-white rounded-[10px] p-6 animate-pulse">
                <div className="w-48 h-48 md:w-56 md:h-56 mx-auto bg-gray-200 rounded-3xl mb-8"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 w-32 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded mb-1 w-24 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && teamMembers.length === 0) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-[#f7f9fb]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6">
              Meet Our <span className="text-secondary">Team</span>
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 [font-family:'Fahkwang',Helvetica]">
                Unable to load team members. Please try again later.
              </p>
              <p className="text-red-600 text-sm mt-2 [font-family:'Fahkwang',Helvetica]">
                Error: {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="py-12 md:py-16 lg:py-20 bg-[#f7f9fb]"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Heading & description */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
            >
              Meet Our{" "}
              <span className="text-secondary">Team</span>
            </motion.h2>
          </div>
          <motion.p
            ref={descriptionRef}
            className="text-lg [font-family:'Fahkwang',Helvetica] text-[#626161] max-w-4xl mx-auto leading-relaxed"
          >
            Our team of talented professionals brings together diverse
            expertise and creative vision to deliver exceptional results.
          </motion.p>
        </div>

        

        {/* Carousel container */}
        <div
          ref={teamGridRef}
          className="overflow-x-auto md:overflow-hidden"
        >
          {/* Sliding wrapper */}
          <div
            ref={teamWrapperRef}
            className="flex flex-nowrap gap-8 md:gap-12 snap-x snap-mandatory md:snap-none"
          >
            {extendedTeamMembers.map((member, index) => {
              const hideOnMobile = index >= teamMembers.length;
              const itemClasses = `${
                hideOnMobile ? "hidden md:block" : ""
              } team-card snap-center shrink-0 text-center bg-white rounded-[10px] p-6 hover:shadow-lg transition-shadow duration-300`;
              
              return (
                <div
                  key={`${member.id}-${index}`}
                  className={itemClasses}
                  onMouseEnter={() => {
                    // Pause the auto-scroll when hovering over a card
                    autoScrollAnim.current?.pause();
                  }}
                  onMouseLeave={() => {
                    // Resume auto-scroll when leaving the card
                    autoScrollAnim.current?.play();
                  }}
                >
                  <div className="relative mb-8 group">
                    <div className="w-48 h-48 md:w-56 md:h-56 mx-auto bg-gray-200 rounded-3xl overflow-hidden">
                      <img
                        src={convertToWebp(member.photoUrl)}
                        alt={member.name}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = "./placeholder.png";
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-primary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <h3 className="text-xl md:text-1xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-2">
                    {member.name}
                  </h3>
                  
                  <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] text-base md:text-lg mb-1">
                    {member.designation}
                  </p>
                  
                  {member.licenseNumber && (
                    <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] text-sm md:text-sm mb-3">
                      {member.licenseNumber}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* API Status Indicator (only show if there's an error but we have fallback data) */}
        {error && teamMembers.length > 0 && (
          <div className="text-center mt-6">
            <p className="text-xs text-orange-600 [font-family:'Fahkwang',Helvetica]">
              ⚠️ Using cached data - API temporarily unavailable
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
