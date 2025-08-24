import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../../ui/button";
import { Clock, User, ArrowRight, Calendar, Tag } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  date: string;
  image: string;
  category: string;
}

export const BlogGridSection = (): JSX.Element => {
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Header animation
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Grid animation
    if (gridRef.current) {
      const posts = gridRef.current.children;
      
      gsap.fromTo(posts,
        {
          opacity: 0,
          y: 80,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Load more button animation
    if (loadMoreRef.current) {
      gsap.fromTo(loadMoreRef.current,
        {
          opacity: 0,
          y: 40
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: loadMoreRef.current,
            start: "top 90%",
            end: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "7 Classic Interior Design Styles That Never Go Out of Fashion",
      excerpt: "Discover the charm of design styles that have stood the test of time. From minimalist Scandinavian to ornate Victorian, explore how you can incorporate classic elements into modern spaces.",
      author: "MERKULOVE",
      readTime: "5 min",
      date: "Dec 15, 2024",
      image: "/create-an-image-for-a-residential-interior-design-blog-post.svg",
      category: "Interior Design"
    },
    {
      id: 2,
      title: "Small Space, Big Impact: Interior Design Hacks for Compact Living",
      excerpt: "Transform your small space into a stylish and functional home with these expert tips and tricks for maximizing every square foot.",
      author: "MERKULOVE",
      readTime: "4 min",
      date: "Dec 12, 2024",
      image: "/create-an-image-where-a-beautiful-girl-shows-her-bedroom-interio.png",
      category: "Home Decor"
    },
    {
      id: 3,
      title: "Sustainable Chic: Eco-Friendly Interior Design Ideas You'll Love",
      excerpt: "Learn how to create beautiful, environmentally conscious interiors that don't compromise on style or comfort.",
      author: "MERKULOVE",
      readTime: "6 min",
      date: "Dec 10, 2024",
      image: "/create-an-image-that-a-couple-represent-their-home-interior.png",
      category: "Sustainability"
    },
    {
      id: 4,
      title: "The Psychology of Color in Interior Design",
      excerpt: "Understand how different colors affect mood and behavior, and learn to use color psychology to create the perfect atmosphere in your home.",
      author: "MERKULOVE",
      readTime: "7 min",
      date: "Dec 8, 2024",
      image: "/create-an-image-a-corporate-officer-represent-his-office-interio.png",
      category: "Color Theory"
    },
    {
      id: 5,
      title: "Modern Kitchen Design Trends for 2025",
      excerpt: "Explore the latest kitchen design trends that combine functionality with stunning aesthetics for the modern home.",
      author: "MERKULOVE",
      readTime: "5 min",
      date: "Dec 5, 2024",
      image: "/create-an-image-where-a-women-showing-her-kitchen-interior.svg",
      category: "Kitchen Design"
    },
    {
      id: 6,
      title: "Creating the Perfect Home Office: Design Tips for Productivity",
      excerpt: "Design a home office that boosts productivity and creativity while maintaining style and comfort.",
      author: "MERKULOVE",
      readTime: "6 min",
      date: "Dec 3, 2024",
      image: "/create-an-image-for-interior-design-about-us-section.png",
      category: "Workspace Design"
    }
  ];

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

  const handleBlogDetailsClick = (postId: number) => {
    // Navigate to blog details page
    navigate('/blog-details');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Interior Design": "bg-primary text-white",
      "Home Decor": "bg-secondary text-white",
      "Sustainability": "bg-green-500 text-white",
      "Color Theory": "bg-purple-500 text-white",
      "Kitchen Design": "bg-orange-500 text-white",
      "Workspace Design": "bg-blue-500 text-white"
    };
    return colors[category as keyof typeof colors] || "bg-gray-500 text-white";
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-20 bg-white -mt-48 relative z-10"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div 
          ref={headerRef}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
            <div className="mx-3 [font-family:'Fahkwang',Helvetica] font-normal text-[#48515c] text-sm text-center tracking-[0.90px]">
              LATEST INSIGHTS
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
              className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(0)',
              }}
            >
              Get Interesting Insights into <span className="text-secondary">Interior Designs</span>
            </h2>
          </div>
          
          <p className="text-lg [font-family:'Fahkwang',Helvetica] text-[#626161] max-w-3xl mx-auto leading-relaxed">
            Discover the latest trends, tips, and inspiration for creating beautiful spaces that reflect your unique style
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-12 md:mb-16"
        >
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
              onClick={() => handleBlogDetailsClick(post.id)}
              style={{
                transform: hoveredPost === post.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: hoveredPost === post.id 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 25px rgba(117, 191, 68, 0.15)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* Blog Post Image */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold [font-family:'Fahkwang',Helvetica] ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div 
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    background: hoveredPost === post.id 
                      ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(117, 191, 68, 0.2) 100%)'
                      : 'transparent',
                    opacity: hoveredPost === post.id ? 1 : 0
                  }}
                />

                {/* Read More Button Overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                  style={{
                    opacity: hoveredPost === post.id ? 1 : 0,
                    transform: hoveredPost === post.id ? 'scale(1)' : 'scale(0.8)'
                  }}
                >
                  <Button className="bg-white text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full px-6 py-2 font-semibold">
                    Read Article
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Blog Post Content */}
              <div className="p-6 space-y-4">
                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 
                  className="text-xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-tight transition-colors duration-300 group-hover:text-primary line-clamp-2"
                >
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] text-sm leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Read More Link */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-primary [font-family:'Fahkwang',Helvetica] font-medium group-hover:text-secondary transition-colors duration-300">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-[#626161]">
                    <Tag className="w-3 h-3" />
                    <span>{post.category}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <Button 
            ref={loadMoreRef}
            className="bg-primary text-white px-8 py-3 rounded-full [font-family:'Fahkwang',Helvetica] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary-hover"
          >
            Load More Articles
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};