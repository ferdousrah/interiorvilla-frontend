import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Card, CardContent } from "../../../../ui/card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// ❌ DO NOT import SplitText statically
// import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger);

// Unique gradient background tones per card
const bgColors = [
  "from-[#fff7e6] to-[#ffe9cc]",
  "from-[#e6f7ff] to-[#ccf2ff]",
  "from-[#f0f5ff] to-[#d6e4ff]",
  "from-[#f6ffed] to-[#d9f7be]",
];

const approaches = [
  { icon: "🔍", title: "Discovery & Planning", description: "We begin by understanding your needs, preferences, and lifestyle to create a tailored design plan." },
  { icon: "🎨", title: "Design Development", description: "Our team develops detailed designs, including material selections, layouts, and 3D visualizations." },
  { icon: "🔨", title: "Execution & Management", description: "We manage all aspects of the project, from sourcing materials to overseeing construction and installation." },
  { icon: "✨", title: "Final Touches", description: "We add the finishing touches to bring your vision to life, ensuring every detail is perfect." },
];

export const ApproachSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Wait for fonts/images + 2 RAFs before initializing ScrollTrigger
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;

    const kick = () => {
      if (!mounted) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setReady(true));
      });
    };

    // fonts
    // @ts-ignore
    (document as any).fonts?.ready?.then(kick).catch(kick);
    // images
    window.addEventListener("load", kick);

    return () => {
      mounted = false;
      window.removeEventListener("load", kick);
    };
  }, []);

  // Entrance animations — use gsap.from with immediateRender:false
  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.from(headingRef.current, {
          opacity: 0,
          y: 50,
          scale: 0.95,
          duration: 0.9,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 92%",
            invalidateOnRefresh: true,
          },
        });
      }

      if (descriptionRef.current) {
        gsap.from(descriptionRef.current, {
          opacity: 0,
          y: 30,
          filter: "blur(5px)",
          duration: 0.7,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: descriptionRef.current,
            start: "top 92%",
            invalidateOnRefresh: true,
          },
        });
      }

      if (cardsContainerRef.current) {
        const items = cardsContainerRef.current.children;
        gsap.from(items, {
          opacity: 0,
          y: 60,
          rotationX: -15,
          scale: 0.9,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.15,
          immediateRender: false,
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: "top 96%",
            invalidateOnRefresh: true,
          },
        });
      }

      // multiple refresh passes catch late layout shifts
      const refresh = () => ScrollTrigger.refresh();
      refresh();
      setTimeout(refresh, 50);
      setTimeout(refresh, 250);

      const ro = new ResizeObserver(refresh);
      ro.observe(document.body);
      window.addEventListener("load", refresh);

      return () => {
        ro.disconnect();
        window.removeEventListener("load", refresh);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [ready]);

  // SplitText hover — lazy-load so prod build is safe even if plugin missing
  useLayoutEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const mod = await import("gsap/SplitText");
        const SplitText = (mod as any).SplitText;
        if (!SplitText || !headingRef.current || !headingWrapperRef.current) return;

        gsap.registerPlugin(SplitText);
        const split = new SplitText(headingRef.current, {
          type: "chars,words",
          charsClass: "char",
          wordsClass: "word",
        });

        const handleMouseMove = (e: MouseEvent) => {
          const rect = headingWrapperRef.current!.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;

          gsap.to(split.chars, {
            duration: 0.5,
            y: (i: number) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
            x: (i: number) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
            rotationY: (x - 0.5) * 20,
            rotationX: (y - 0.5) * -20,
            ease: "power2.out",
            stagger: { amount: 0.3, from: "center" },
          });
        };

        const handleMouseLeave = () => {
          gsap.to(split.chars, {
            duration: 1,
            y: 0,
            x: 0,
            rotationY: 0,
            rotationX: 0,
            ease: "elastic.out(1, 0.3)",
            stagger: { amount: 0.3, from: "center" },
          });
        };

        const el = headingWrapperRef.current!;
        el.addEventListener("mousemove", handleMouseMove);
        el.addEventListener("mouseleave", handleMouseLeave);

        cleanup = () => {
          el.removeEventListener("mousemove", handleMouseMove);
          el.removeEventListener("mouseleave", handleMouseLeave);
          split.revert();
        };
      } catch {
        // SplitText not available — skip effect silently
      }
    })();

    return () => cleanup?.();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-12 md:py-16 lg:py-20 bg-[#f7f9fb] dark:bg-[#0f1a1c]"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2
              ref={headingRef}
              className="text-3xl md:text-3xl lg:text-4xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] dark:text-white mb-6"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
            >
              Our <span className="text-secondary">Approach</span>
            </h2>
          </div>
          <p
            ref={descriptionRef}
            className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] dark:text-[#dddddd] max-w-5xl mx-auto leading-relaxed"
          >
            At Interior Villa, we believe that your home should be a reflection of your unique personality and lifestyle. We are a leading interior design firm in Bangladesh, passionate about creating spaces that are not only beautiful but also functional, comfortable, and inspiring.
          </p>
        </div>

        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {approaches.map((approach, index) => (
            <Card
              key={index}
              aria-label={`Approach step: ${approach.title}`}
              className={`group relative overflow-hidden rounded-[12px] p-6 md:p-8 h-full cursor-pointer bg-gradient-to-br ${bgColors[index % bgColors.length]} transition-all duration-500 ease-out shadow-md`}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                gsap.to(card, {
                  duration: 0.4,
                  ease: "power2.out",
                  rotateX,
                  rotateY,
                  scale: 1.05,
                  transformPerspective: 1000,
                  transformOrigin: "center",
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  duration: 0.6,
                  rotateX: 0,
                  rotateY: 0,
                  scale: 1,
                  ease: "elastic.out(1, 0.4)",
                });
              }}
            >
              {/* Shimmer effect */}
              <div className="pointer-events-none absolute inset-0 before:absolute before:inset-0 before:content-[''] before:bg-[linear-gradient(120deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-700" />

              <CardContent className="p-0 text-justify relative z-10">
                <div className="text-4xl mb-4 transition-all duration-500 group-hover:scale-110">
                  {approach.icon}
                </div>
                <h3 className="text-base md:text-1xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] dark:text-white mb-4 text-left transition-all duration-500">
                  {approach.title}
                </h3>
                <p className="text-[#626161] dark:text-[#dddddd] [font-family:'Fahkwang',Helvetica] text-base md:text-base leading-relaxed transition-all duration-500">
                  {approach.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
