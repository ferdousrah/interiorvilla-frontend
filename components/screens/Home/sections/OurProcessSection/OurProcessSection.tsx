import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle, Lightbulb, CheckCircle, Rocket, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface StepData {
  id: number;
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  bgColor: string;
}

type TooltipPos =
  | {
      id: number;
      left: number;           // px relative to desktop steps container
      top: number;            // px relative to desktop steps container
      placement: 'top' | 'bottom';
      color: string;
      width: number;
      caretOffset: number;    // px from tooltip's left edge to caret center
    }
  | null;

export const OurProcessSection: React.FC = () => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);

  const stepsDesktopRef = useRef<HTMLDivElement>(null);
  const stepsMobileRef = useRef<HTMLDivElement>(null);

  // rotated diamond nodes for accurate rects
  const diamondRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // ---- Heading hover (SplitText loaded dynamically to keep bundle small)
  useEffect(() => {
    if (!headingRef.current || !headingWrapperRef.current) return;
    if (prefersReducedMotion) return;

    let split: any | null = null;
    let cleanup = () => {};

    (async () => {
      const { SplitText } = await import('gsap/SplitText');
      gsap.registerPlugin(SplitText);

      split = new SplitText(headingRef.current!, {
        type: 'chars,words',
        charsClass: 'char',
        wordsClass: 'word',
      });

      const onMove = (e: MouseEvent) => {
        const rect = headingWrapperRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        gsap.to(split!.chars, {
          duration: 0.5,
          y: (i: number) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
          x: (i: number) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
          rotationY: (x - 0.5) * 20,
          rotationX: (y - 0.5) * -20,
          ease: 'power2.out',
          stagger: { amount: 0.3, from: 'center' },
        });
      };

      const onLeave = () => {
        gsap.to(split!.chars, {
          duration: 1,
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          ease: 'elastic.out(1, 0.3)',
          stagger: { amount: 0.3, from: 'center' },
        });
      };

      headingWrapperRef.current!.addEventListener('mousemove', onMove);
      headingWrapperRef.current!.addEventListener('mouseleave', onLeave);

      cleanup = () => {
        headingWrapperRef.current?.removeEventListener('mousemove', onMove);
        headingWrapperRef.current?.removeEventListener('mouseleave', onLeave);
        split?.revert?.();
      };
    })();

    return () => cleanup();
  }, [prefersReducedMotion]);

  // ---- Entrance animations (scoped)
  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (stepsDesktopRef.current) {
        const items = stepsDesktopRef.current.querySelectorAll(':scope > div');
        gsap.fromTo(
          items,
          { opacity: 0, scale: 0.9, y: 40 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            ease: 'back.out(1.6)',
            stagger: 0.15,
            scrollTrigger: {
              trigger: stepsDesktopRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (stepsMobileRef.current) {
        const cards = stepsMobileRef.current.querySelectorAll(':scope > div');
        gsap.fromTo(
          cards,
          { opacity: 0, scale: 0.95, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: stepsMobileRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // ---- Steps data
  const steps: StepData[] = [
    {
      id: 1,
      title: 'Chat and Talk',
      description:
        'We start with understanding your vision, needs, and preferences through detailed consultation and discovery sessions.',
      icon: <MessageCircle className="w-8 h-8" />,
      color: '#6366F1',
      bgColor: '#EEF2FF',
    },
    {
      id: 2,
      title: 'Design Development',
      description:
        'Our expert team creates detailed designs, stunning 3D visualizations, and carefully curated material selections.',
      icon: <Lightbulb className="w-8 h-8" />,
      color: '#06B6D4',
      bgColor: '#CFFAFE',
    },
    {
      id: 3,
      title: 'Confirm Your Order',
      description:
        'Review and approve the final design concepts, premium materials, detailed timeline, and comprehensive project specifications.',
      icon: <CheckCircle className="w-8 h-8" />,
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
    {
      id: 4,
      title: 'Deployment Process',
      description:
        'Professional installation and meticulous project management ensuring quality execution and timely delivery.',
      icon: <Rocket className="w-8 h-8" />,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      id: 5,
      title: "You'll be Happy",
      description:
        'Enjoy your beautifully transformed space that exceeds expectations and brings lasting joy and inspiration.',
      icon: <Heart className="w-8 h-8" />,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
    },
  ];

  // ---- Tooltip placement (desktop)
  const TOOLTIP_WIDTH = 256;      // Tailwind w-64
  const GAP = 12;                 // distance between diamond & tooltip
  const CLAMP = 12;               // min padding from container edges
  const TOOLTIP_HEIGHT_GUESS = 120; // rough average height for auto-flip
  const VIEWPORT_TOP_SAFE = 24;   // breathing room from top

  const computeAndSetTooltip = (stepId: number, intended: 'top' | 'bottom', color: string) => {
    const container = stepsDesktopRef.current;
    const diamond = diamondRefs.current[stepId];
    if (!container || !diamond) return;

    const cRect = container.getBoundingClientRect();
    const dRect = diamond.getBoundingClientRect();

    const centerX = dRect.left - cRect.left + dRect.width / 2;

    // ideal centered left
    let left = Math.round(centerX - TOOLTIP_WIDTH / 2);

    // clamp horizontally inside container
    const minLeft = CLAMP;
    const maxLeft = Math.max(CLAMP, cRect.width - TOOLTIP_WIDTH - CLAMP);
    left = Math.max(minLeft, Math.min(left, maxLeft));

    // caret follows diamond center (even when clamped)
    const caretOffset = Math.round(centerX - left);

    // pick placement; auto‑flip if space is tight
    const spaceAbove = dRect.top - cRect.top - GAP;
    const spaceBelow = cRect.height - (dRect.bottom - cRect.top) - GAP;

    let placement: 'top' | 'bottom' = intended;
    if (intended === 'top' && spaceAbove < TOOLTIP_HEIGHT_GUESS + VIEWPORT_TOP_SAFE && spaceBelow > spaceAbove) {
      placement = 'bottom';
    } else if (intended === 'bottom' && spaceBelow < TOOLTIP_HEIGHT_GUESS && spaceAbove > spaceBelow) {
      placement = 'top';
    }

    const top =
      placement === 'bottom'
        ? Math.round(dRect.bottom - cRect.top + GAP)
        : Math.round(dRect.top - cRect.top - GAP); // translateY(-100%) when top

    setTooltipPos({
      id: stepId,
      left,
      top,
      placement,
      color,
      width: TOOLTIP_WIDTH,
      caretOffset,
    });
  };

  // recompute on resize while visible
  useEffect(() => {
    if (!tooltipPos) return;
    const step = steps.find(s => s.id === tooltipPos.id)!;
    const idx = steps.findIndex(s => s.id === tooltipPos.id);
    const intended: 'top' | 'bottom' = idx % 2 === 1 ? 'top' : 'bottom';

    const onResize = () => computeAndSetTooltip(step.id, intended, step.color);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tooltipPos?.id]);

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen flex items-center relative overflow-hidden pt-6 pb-10 md:pt-10 md:pb-16 bg-[#f7f9fb]"
    >
      <div className="container mx-auto max-w-7xl relative z-10 px-4">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <div
            ref={headingWrapperRef}
            className="cursor-default perspective-[1000px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h2
              ref={headingRef}
              className="[font-family:'Fahkwang',Helvetica] font-medium text-[40px] leading-tight mb-6 mt-5"
              style={{ transform: 'translateZ(0)', transformStyle: 'preserve-3d' }}
            >
              <span className="text-[#0d1529]">Our </span>
              <span className="text-secondary">Process</span>
            </h2>
          </div>
          <p className="text-lg text-[#626161] max-w-3xl mx-auto leading-relaxed [font-family:'Fahkwang',Helvetica]">
            Follow our proven 5-step journey that transforms your vision into extraordinary reality
          </p>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block relative">
          {/* overflow-visible so tooltips don't get clipped */}
          <div ref={stepsDesktopRef} className="relative grid grid-cols-5 gap-8 py-20 overflow-visible">
            {steps.map((step, index) => {
              const isBottomRow = index % 2 === 1;
              const intended: 'top' | 'bottom' = isBottomRow ? 'top' : 'bottom';

              return (
                <div
                  key={step.id}
                  className={`relative flex flex-col items-center ${isBottomRow ? 'mt-32' : 'mt-0'}`}
                >
                  <motion.button
                    type="button"
                    tabIndex={0}
                    className="relative cursor-pointer group outline-none"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    onMouseEnter={() => {
                      setHoveredStep(step.id);
                      computeAndSetTooltip(step.id, intended, step.color);
                    }}
                    onMouseLeave={() => {
                      setHoveredStep(null);
                      setTooltipPos(null);
                    }}
                    onFocus={() => {
                      setHoveredStep(step.id);
                      computeAndSetTooltip(step.id, intended, step.color);
                    }}
                    onBlur={() => {
                      setHoveredStep(null);
                      setTooltipPos(null);
                    }}
                  >
                    {/* Rotated diamond */}
                    <div
                      ref={(el) => (diamondRefs.current[step.id] = el)}
                      className="w-48 h-48 rotate-45 border-4 transition-all duration-300 shadow-lg rounded-3xl"
                      style={{
                        backgroundColor: hoveredStep === step.id ? step.color : 'white',
                        borderColor: step.color,
                        boxShadow:
                          hoveredStep === step.id
                            ? `0 20px 40px ${step.color}40`
                            : '0 10px 30px rgba(0,0,0,0.1)',
                      }}
                      aria-hidden="true"
                    />

                    {/* Upright content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none">
                      <div
                        className="transition-all duration-300 mb-2"
                        style={{ color: hoveredStep === step.id ? 'white' : step.color }}
                      >
                        {step.icon}
                      </div>
                      <h3
                        className="text-lg font-bold [font-family:'Fahkwang',Helvetica] text-center transition-all duration-300 leading-tight tracking-wider"
                        style={{ color: hoveredStep === step.id ? 'white' : '#01190c' }}
                      >
                        {step.title}
                      </h3>
                    </div>
                  </motion.button>
                </div>
              );
            })}

            {/* One floating tooltip (desktop) */}
            <AnimatePresence>
              {tooltipPos && hoveredStep === tooltipPos.id && (
                <motion.div
                  key="desktop-tooltip"
                  initial={{ opacity: 0, y: tooltipPos.placement === 'top' ? -8 : 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: tooltipPos.placement === 'top' ? -12 : 12, scale: 1 }}
                  exit={{ opacity: 0, y: tooltipPos.placement === 'top' ? -8 : 8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute z-50 rounded-2xl border bg-white shadow-xl p-4 pointer-events-auto"
                  style={{
                    left: tooltipPos.left,
                    top: tooltipPos.top,
                    transform: tooltipPos.placement === 'top' ? 'translateY(-100%)' : 'translateY(0)',
                    width: tooltipPos.width,
                    borderColor: tooltipPos.color,
                    boxShadow: `0 10px 30px ${tooltipPos.color}26`,
                  }}
                  role="tooltip"
                  onMouseEnter={() => setHoveredStep(tooltipPos.id)} // keep-open on hover
                  onMouseLeave={() => {
                    setHoveredStep(null);
                    setTooltipPos(null);
                  }}
                >
                  {/* caret pinned to diamond center even when clamped */}
                  <div
                    className="absolute w-3 h-3 rotate-45 border bg-white"
                    style={{
                      borderColor: tooltipPos.color,
                      borderWidth: 1,
                      left: tooltipPos.caretOffset,
                      marginLeft: -6,
                      top: tooltipPos.placement === 'top' ? 'calc(100% - 6px)' : -6,
                    }}
                  />
                  <p className="text-sm leading-relaxed text-[#374151] [font-family:'Fahkwang',Helvetica]">
                    {steps.find((s) => s.id === tooltipPos.id)!.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile/Tablet (description always visible) */}
        <div className="lg:hidden">
          <div ref={stepsMobileRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className="relative bg-white rounded-3xl p-8 shadow-lg border-2 cursor-pointer overflow-hidden"
                style={{ borderColor: step.color }}
                whileHover={{ y: -8, scale: 1.02 }}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Background Gradient */}
                <div
                  className="absolute inset-0 rounded-3xl transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${step.bgColor} 0%, ${step.color}20 100%)`,
                    opacity: hoveredStep === step.id ? 1 : 0,
                  }}
                />
                <div className="relative z-10">
                  <div className="flex flex-col items-center mb-6">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300"
                      style={{
                        backgroundColor: hoveredStep === step.id ? step.color : step.bgColor,
                        color: hoveredStep === step.id ? 'white' : step.color,
                      }}
                    >
                      {step.icon}
                    </div>
                    <h3
                      className="text-xl font-bold [font-family:'Fahkwang',Helvetica] transition-colors duration-300 tracking-wider"
                      style={{ color: hoveredStep === step.id ? step.color : '#01190c' }}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-base text-[#626161] [font-family:'Fahkwang',Helvetica] leading-relaxed text-center">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decorative dots */}
        <div className="absolute top-10 left-10 w-8 h-8 bg-gray-200 rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-20 right-20 w-6 h-6 bg-cyan-200 rounded-full opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-20 w-10 h-10 bg-red-200 rounded-full opacity-30 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-4 h-4 bg-orange-200 rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-5 h-5 bg-purple-200 rounded-full opacity-30 animate-pulse" />
      </div>
    </section>
  );
};
