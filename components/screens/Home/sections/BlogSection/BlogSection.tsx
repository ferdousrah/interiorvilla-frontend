import { ArrowRightIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "../../../../ui/badge";
import { Button } from "../../../../ui/button";
import { Card, CardContent } from "../../../../ui/card";
import VanillaTilt from 'vanilla-tilt';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const BlogSection = (): JSX.Element => {
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Refs for parallax effects
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const featuredPostRef = useRef<HTMLDivElement>(null);
  const featuredImageRef = useRef<HTMLDivElement>(null);
  const featuredContentRef = useRef<HTMLDivElement>(null);
  const blogCardsRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const backgroundElementsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (imageRef.current) {
      VanillaTilt.init(imageRef.current, {
        max: 10,
        speed: 400,
        glare: true,
        'max-glare': 0.3,
        scale: 1.1,
        transition: true,
        easing: "cubic-bezier(.03,.98,.52,.99)",
        perspective: 1000,
      });
    }
  }, []);

  // Add hover animation for main heading
  useEffect(() => {
    if (!headingRef.current) return;

    // Split text into characters
    const splitText = new SplitText(headingRef.current, { 
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word"
    });

    // Add hover animation
    if (headingWrapperRef.current) {
      headingWrapperRef.current.addEventListener('mousemove', (e) => {
        const rect = headingWrapperRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        gsap.to(splitText.chars, {
          duration: 0.5,
          y: (i, target) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
          x: (i, target) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
          rotationY: (x - 0.5) * 20,
          rotationX: (y - 0.5) * -20,
          ease: "power2.out",
          stagger: {
            amount: 0.3,
            from: "center"
          }
        });
      });

      headingWrapperRef.current.addEventListener('mouseleave', () => {
        gsap.to(splitText.chars, {
          duration: 1,
          y: 0,
          x: 0,
          rotationY: 0,
          rotationX: 0,
          ease: "elastic.out(1, 0.3)",
          stagger: {
            amount: 0.3,
            from: "center"
          }
        });
      });
    }

    // Cleanup function
    return () => {
      splitText.revert();
      if (headingWrapperRef.current) {
        headingWrapperRef.current.removeEventListener('mousemove', () => {});
        headingWrapperRef.current.removeEventListener('mouseleave', () => {});
      }
    };
  }, []);

  // Parallax and animation effects
  useEffect(() => {
    if (!sectionRef.current) return;

    // Split text animation for heading
    if (headingRef.current) {
      const splitText = new SplitText(headingRef.current, { 
        type: "words,chars",
        charsClass: "char",
        wordsClass: "word"
      });

      // Set initial state to be visible
      gsap.set(splitText.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        transformOrigin: "50% 50%"
      });

      // Create a subtle reveal animation
      gsap.fromTo(splitText.chars,
        {
          opacity: 0.2,
          y: 40,
          scale: 0.9,
          rotationY: -20
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationY: 0,
          duration: 1.2,
          stagger: {
            amount: 0.8,
            from: "start"
          },
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 90%",
            end: "top 60%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Parallax effect for heading
      gsap.to(headingRef.current, {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }

    // Header section animation and parallax
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        {
          opacity: 0,
          y: 60,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Subtle parallax for header
      gsap.to(headerRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
          invalidateOnRefresh: true
        }
      });
    }

    // Featured post animation and parallax
    if (featuredPostRef.current) {
      gsap.fromTo(featuredPostRef.current,
        {
          opacity: 0,
          y: 80,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuredPostRef.current,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Parallax for featured post
      gsap.to(featuredPostRef.current, {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
    }

    // Featured image parallax with enhanced effects
    if (featuredImageRef.current && imageRef.current) {
      // Image container parallax
      gsap.to(featuredImageRef.current, {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
          invalidateOnRefresh: true
        }
      });

      // Image scale effect
      gsap.fromTo(imageRef.current, 
        { scale: 1.1 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: featuredImageRef.current,
            start: "top bottom",
            end: "center center",
            scrub: 1,
            invalidateOnRefresh: true
          }
        }
      );
    }

    // Featured content parallax
    if (featuredContentRef.current) {
      gsap.to(featuredContentRef.current, {
        yPercent: -4,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.4,
          invalidateOnRefresh: true
        }
      });
    }

    // Blog cards animation and parallax
    if (blogCardsRef.current) {
      gsap.fromTo(blogCardsRef.current,
        {
          opacity: 0,
          y: 100,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: blogCardsRef.current,
            start: "top 85%",
            end: "top 45%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Parallax for blog cards container
      gsap.to(blogCardsRef.current, {
        yPercent: -3,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.3,
          invalidateOnRefresh: true
        }
      });
    }

    // Individual card animations with staggered parallax
    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Staggered entrance animation
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 120,
          rotationX: -20,
          scale: 0.8
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          duration: 1.5,
          delay: index * 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "top 60%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Individual parallax for each card
      gsap.to(card, {
        yPercent: -2 - (index * 2),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.2 + (index * 0.15),
          invalidateOnRefresh: true
        }
      });
    });

    // Pagination animation and parallax
    if (paginationRef.current) {
      const dots = paginationRef.current.querySelectorAll('div');
      
      gsap.fromTo(dots,
        {
          opacity: 0,
          scale: 0.5,
          y: 30
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: paginationRef.current,
            start: "top 90%",
            end: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Parallax for pagination
      gsap.to(paginationRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      });
    }

    // Background elements parallax
    if (backgroundElementsRef.current) {
      gsap.to(backgroundElementsRef.current, {
        yPercent: -20,
        rotation: 180,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
          invalidateOnRefresh: true
        }
      });
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Blog post data for mapping
  const blogPosts = [
    {
      id: 1,
      title:
        "Small Space, Big Impact: Interior Design Hacks for Compact Living",
      author: "MERKULOVE",
      date: "06.12.2024",
      readTime: "2 MIN READ",
      featured: false,
    },
    {
      id: 2,
      title: "Sustainable Chic: Eco-Friendly Interior Design Ideas You'll Love",
      author: "MERKULOVE",
      date: "06.12.2024",
      readTime: "2 MIN READ",
      featured: false,
    },
  ];

  const handleReadMoreClick = () => {
    navigate('/blog-details');
  };

  return (
    <section 
      ref={sectionRef}
      className="w-full py-20 bg-[#f7f9fb] relative overflow-hidden"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        zIndex: 1
      }}
    >
      {/* Background decorative elements */}
      <div 
        ref={backgroundElementsRef}
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          transformOrigin: 'center center',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        <div className="absolute top-20 left-10 w-6 h-6 bg-primary rounded-full opacity-15 animate-pulse" />
        <div className="absolute top-1/3 right-20 w-8 h-8 bg-secondary rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-10 h-10 bg-primary rounded-full opacity-8 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-secondary rounded-full opacity-12 animate-pulse" style={{ animationDelay: '3s' }} />
        
        {/* Geometric shapes */}
        <div className="absolute top-40 right-10 w-16 h-16 border-2 border-primary opacity-6 rotate-45" />
        <div className="absolute bottom-40 left-16 w-20 h-20 border border-secondary opacity-8 rounded-full" />
        <div className="absolute top-1/2 left-10 w-12 h-12 border-2 border-primary opacity-5" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </div>

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className="flex flex-col items-center mb-20 md:mb-24 will-change-transform"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          <div className="flex items-center justify-center mb-3">
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
            <div className="mx-3 [font-family:'Fahkwang',Helvetica] font-normal text-[#48515c] text-sm text-center tracking-[0.90px]">
              BLOG
            </div>
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
          </div>

          <div 
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h2 
              ref={headingRef}
              className="[font-family:'Fahkwang',Helvetica] font-medium text-[40px] text-center tracking-[0] leading-[62px] mb-6"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(0)',
              }}
            >
              <span className="text-[#0d1529]">Latest </span>
              <span className="text-secondary">Stories</span>
            </h2>
          </div>
        </div>

        {/* Featured Blog Post */}
        <div 
          ref={featuredPostRef}
          className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12 md:mb-16 will-change-transform"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          <div className="lg:w-1/2">
            <div 
              ref={featuredImageRef}
              className="relative overflow-hidden rounded-lg shadow-lg transform-gpu will-change-transform"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                transformOrigin: 'center center',
                backfaceVisibility: 'hidden',
                transform: 'translate3d(0, 0, 0)'
              }}
            >
              <img
                ref={imageRef}
                className="w-full h-auto object-cover rounded-lg transition-transform duration-500 ease-out hover:scale-110 will-change-transform"
                alt="Interior design blog post"
                src="/create-an-image-for-a-residential-interior-design-blog-post.svg"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  transformOrigin: 'center center'
                }}
              />
            </div>
          </div>

          <div 
            ref={featuredContentRef}
            className="lg:w-1/2 will-change-transform"
            style={{
              transformOrigin: 'center center',
              backfaceVisibility: 'hidden',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            <div className="flex items-center mb-3">
              <Badge className="bg-primary border-[6px] border-primary/35 rounded-full h-10 w-10 flex items-center justify-center p-0">
                <span className="text-white text-xs"></span>
              </Badge>

              <span className="ml-4 [font-family:'Fahkwang',Helvetica] font-medium text-[#48515c] text-xs tracking-[0.77px]">
                BY MERKULOVE | 06.12.2024 | 2 MIN READ
              </span>
            </div>

            <h3 className="[font-family:'Fahkwang',Helvetica] font-medium text-[#0d1529] text-[32px] tracking-[0.93px] leading-[51px] mb-6">
              7 Classic Interior Design Styles That Never Go Out of Fashion
            </h3>

            <p className="[font-family:'Fahkwang',Helvetica] font-normal text-[#48515c] text-sm tracking-[0] leading-6 mb-8">
              Discover the charm of design styles that have stood the test of
              time. From minimalist Scandinavian to ornate Victorian, this post
              explores how you can incorporate classic elements into modern
              spaces for a look that&apos;s always in style.
            </p>

            <Button 
              className="bg-primary rounded-[25px] h-9 px-6 relative transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary-hover"
            >
              <span className="[font-family:'Fahkwang',Helvetica] font-bold text-white text-xs tracking-[0.09px]">
                READ MORE
              </span>
              <div className="w-[26px] h-[26px] bg-white rounded-full ml-3 flex items-center justify-center">
                <ArrowRightIcon className="h-4 w-4 text-primary" />
              </div>
            </Button>
          </div>
        </div>

        {/* Blog Post Cards */}
        <div 
          ref={blogCardsRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-8 md:mb-12 will-change-transform"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          {blogPosts.map((post, index) => (
            <Card
              key={post.id}
              ref={el => cardRefs.current[index] = el}
              className="bg-[#f7f9fb] rounded-3xl border-none transform-gpu transition-all duration-500 ease-out hover:scale-[1.02] will-change-transform h-full"
              onMouseEnter={() => setHoveredCard(post.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                boxShadow: hoveredCard === post.id 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 25px rgba(117, 191, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transform: hoveredCard === post.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                background: hoveredCard === post.id 
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(247, 249, 251, 0.95) 100%)'
                  : '#f7f9fb',
                transformOrigin: 'center center',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d'
              }}
            >
              <CardContent className="p-6 relative overflow-hidden">
                {/* Animated background gradient on hover */}
                <div 
                  className="absolute inset-0 opacity-0 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(117, 191, 68, 0.05) 0%, transparent 70%)',
                    opacity: hoveredCard === post.id ? 1 : 0
                  }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="mb-6 [font-family:'Fahkwang',Helvetica] font-normal text-[#48515c] text-xs tracking-[0.77px] transition-colors duration-300"
                    style={{
                      color: hoveredCard === post.id ? '#75bf44' : '#48515c'
                    }}
                  >
                    BY {post.author} | {post.date} | {post.readTime}
                  </div>

                  <h3 
                    className="[font-family:'Fahkwang',Helvetica] font-medium text-[#0d1529] text-xl md:text-2xl lg:text-[28px] tracking-[0] leading-tight mb-8 transition-all duration-300"
                    style={{
                      transform: hoveredCard === post.id ? 'translateX(4px)' : 'translateX(0)',
                      color: hoveredCard === post.id ? '#0a1420' : '#0d1529'
                    }}
                  >
                    {post.title}
                  </h3>

                  <Button 
                    className="bg-primary rounded-[25px] h-10 px-8 relative transition-all duration-300 hover:bg-primary-hover hover:scale-105 mt-auto"
                    onClick={handleReadMoreClick}
                    style={{
                      transform: hoveredCard === post.id ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: hoveredCard === post.id 
                        ? '0 8px 25px rgba(117, 191, 68, 0.4)' 
                        : '0 2px 8px rgba(117, 191, 68, 0.2)'
                    }}
                  >
                    <span className="[font-family:'Fahkwang',Helvetica] font-bold text-white text-xs tracking-[0.09px]">
                      READ MORE
                    </span>
                    <div 
                      className="w-[28px] h-[28px] bg-white rounded-full ml-3 flex items-center justify-center transition-transform duration-300"
                      style={{
                        transform: hoveredCard === post.id ? 'rotate(45deg)' : 'rotate(0deg)'
                      }}
                    >
                      <ArrowRightIcon className="h-5 w-5 text-primary" />
                    </div>
                  </Button>
                </div>

                {/* Decorative elements */}
                <div 
                  className="absolute -top-12 -right-12 w-24 h-24 rounded-full transition-all duration-700"
                  style={{
                    background: `radial-gradient(circle, ${post.id === 1 ? '#4F46E5' : '#059669'}15 0%, transparent 70%)`,
                    transform: hoveredCard === post.id ? 'scale(1.5) translate(-10px, 10px)' : 'scale(1)',
                    opacity: hoveredCard === post.id ? 1 : 0
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Dots */}
        <div 
          ref={paginationRef}
          className="flex justify-center gap-4 will-change-transform"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          <div className="w-[9px] h-2.5 bg-[#d7d7d7] rounded-[5px] transition-all duration-300 hover:bg-primary"></div>
          <div className="w-[9px] h-2.5 bg-primary rounded-[5px]"></div>
          <div className="w-[9px] h-2.5 bg-[#d7d7d7] rounded-[5px] transition-all duration-300 hover:bg-primary"></div>
        </div>
      </div>
    </section>
  );
};