import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "../../../../ui/card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const ExperienceSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const experienceHeadingRef = useRef<HTMLHeadingElement>(null);
  const experienceHeadingWrapperRef = useRef<HTMLDivElement>(null);
  // Refs for the animated counters
  const projectsCountRef = useRef<HTMLDivElement>(null);
  const corporateCountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  // Initialize Fancybox for video
    Fancybox.bind("[data-fancybox='intro-video']", {
      Html: {
        video: {
          autoplay: true,
          ratio: 16 / 9,
        },
      },
      animated: true,
      showClass: "fancybox-fadeIn",
      hideClass: "fancybox-fadeOut",
      dragToClose: false,
      Toolbar: {
        display: {
          left: [],
          middle: [],
          right: ["close"],
        },
      },
      on: {
        reveal: (fancybox, slide) => {
          if (slide.type === "html" || slide.type === "iframe") {
            const content = slide.$content;
            if (content) {
              const video = content.querySelector("video");
              if (video) {
                video.play().catch((e) => console.log("Video autoplay failed:", e));
              }
            }
          }
        },
        destroy: (fancybox, slide) => {
          if (slide && slide.$content) {
            const video = slide.$content.querySelector("video");
            if (video) {
              video.pause();
            }
          }
        },
      },
    });

    return () => {
      Fancybox.destroy();
    };
  }, []);

  // Hover animation for the heading
  useEffect(() => {
    if (!experienceHeadingRef.current) return;

    // Split text into chars and words
    const splitText = new SplitText(experienceHeadingRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    const wrapper = experienceHeadingWrapperRef.current;
    if (!wrapper) {
      return () => {
        splitText.revert();
      };
    }

    // Define the handlers so they can be removed in cleanup
    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      gsap.to(splitText.chars, {
        duration: 0.5,
        y: (i: number) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
        x: (i: number) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
        rotationY: (x - 0.5) * 20,
        rotationX: (y - 0.5) * -20,
        ease: "power2.out",
        stagger: {
          amount: 0.3,
          from: "center",
        },
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
        stagger: {
          amount: 0.3,
          from: "center",
        },
      });
    };

    wrapper.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      splitText.revert();
      wrapper.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Animations for columns and button
  useEffect(() => {
    if (!sectionRef.current) return;

    // Left column animation
    if (leftColumnRef.current) {
      const elements = leftColumnRef.current.children;
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          x: -60,
          y: 30,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: leftColumnRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }

    // Right column animation
    if (rightColumnRef.current) {
      const cards = rightColumnRef.current.children;
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          x: 60,
          y: 30,
          scale: 0.9,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rightColumnRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }

    // Play button animation
    if (playButtonRef.current) {
      gsap.fromTo(
        playButtonRef.current,
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: playButtonRef.current,
            start: "top 90%",
            end: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Numeric counters (count up effect)
  useEffect(() => {
    const animateCount = (
      ref: HTMLDivElement | null,
      endValue: number,
      delay = 0,
    ) => {
      if (!ref) return;
      const obj = { value: 0 };
      gsap.to(obj, {
        value: endValue,
        duration: 2,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => {
          ref.textContent = `${Math.round(obj.value).toLocaleString()}+`;
        },
      });
    };

    animateCount(projectsCountRef.current, 1000);
    animateCount(corporateCountRef.current, 100, 0.2);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Handle video click
  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const videoHtml = `
      <video 
        controls 
        autoplay 
        style="width: 100%; height: 100%; max-width: 1200px; max-height: 675px;"
        poster="/create-an-image-for-interior-design-about-us-section.png"
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;

    Fancybox.show(
      [
        {
          src: videoHtml,
          type: "html",
          caption: "Interior Villa - Company Introduction",
        },
      ],
      {
        animated: true,
        showClass: "fancybox-fadeIn",
        hideClass: "fancybox-fadeOut",
      },
    );
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="py-16 md:py-20 bg-white -mt-48 relative z-10"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column - Title and Description */}
            <div ref={leftColumnRef} className="space-y-6">
              <div
                ref={experienceHeadingWrapperRef}
                className="perspective-[1000px] cursor-default"
                style={{ transformStyle: "preserve-3d" }}
              >
                <h2
                  ref={experienceHeadingRef}
                  className="text-3xl md:text-3xl lg:text-4xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-tight"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateZ(0)",
                  }}
                >
                  Experience Interior Villa: Where Design Meets Lifestyle
                </h2>
              </div>

              <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed text-justify">
                At Interior Villa, we believe that your home should be a
                reflection of your unique personality and lifestyle. We are a
                leading interior design firm in Bangladesh, passionate about
                creating spaces that are not only beautiful but also functional,
                comfortable, and inspiring.
              </p>

              {/* Intro Video Button */}
              <button
  ref={playButtonRef}
  className="flex items-center space-x-2 group transition-all duration-300 hover:scale-105 border border-[#1a1a2e] rounded-full px-4 py-2 shadow-md hover:border-[#EE5428]"
  onClick={handleVideoClick}
  aria-label="Play introduction video"
>
  <div className="w-8 h-8 bg-[#1a1a2e] rounded-full flex items-center justify-center group-hover:bg-[#EE5428] transition-colors duration-300">
    <svg
      className="w-3 h-3 text-white ml-0.5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  </div>
  <span className="text-xs text-[#1a1a2e] [font-family:'Fahkwang',Helvetica] font-medium group-hover:text-[#EE5428] transition-colors duration-300">
    Intro Video
  </span>
</button>

            </div>

            {/* Right Column - Statistics Cards */}
            <div
              ref={rightColumnRef}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {/* Projects Completed Card */}
              <Card
  className="backdrop-blur-md bg-white/30 border border-[#000]/20 rounded-[5px] p-6 md:p-8 text-center h-full transition-all duration-300 transform hover:scale-[1.03] hover:shadow-[0_0_20px_#00bfa6] hover:border-[#00bfa6]/50"
  style={{ backgroundColor: "#EBF8F7" }}
>

                <CardContent className="p-0 space-y-4">
                  <div
                    ref={projectsCountRef}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold [font-family:'Fahkwang',Helvetica] text-[#01190c]"
                  >
                    0+
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c]">
                    Projects Completed
                  </h3>

                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#AAEBEB" }}
                  >
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Corporate Served Card */}
              <Card
  className="backdrop-blur-md bg-white/30 border border-[#000]/20 rounded-[5px] p-6 md:p-8 text-center h-full transition-all duration-300 transform hover:scale-[1.03] hover:shadow-[0_0_20px_#ffd700] hover:border-[#ffd700]/50"
  style={{ backgroundColor: "#FEFCEC" }}
>

                <CardContent className="p-0 space-y-4">
                  <div
                    ref={corporateCountRef}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold [font-family:'Fahkwang',Helvetica] text-[#01190c]"
                  >
                    0+
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c]">
                    Corporate Served
                  </h3>

                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#EFE058" }}
                  >
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Global Fancybox and animation styles omitted for brevity; keep your existing styles here */}
    </>
  );
};
