import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { Clock, User } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

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
      title: "Unforgettable Experience: Finding Hidden Gems in Bromo Mountain, East Java",
      excerpt: "Discover the breathtaking beauty and hidden treasures of Bromo Mountain in East Java, Indonesia.",
      author: "Admin",
      readTime: "5 min",
      date: "Dec 15, 2024",
      image: "/a-residential-interior-image.png",
      category: "Interior Design"
    },
    {
      id: 2,
      title: "Unforgettable Experience: Finding Hidden Gems in Bromo Mountain, East Java",
      excerpt: "Discover the breathtaking beauty and hidden treasures of Bromo Mountain in East Java, Indonesia.",
      author: "Admin",
      readTime: "5 min",
      date: "Dec 15, 2024",
      image: "/create-an-image-where-a-beautiful-girl-shows-her-bedroom-interio.png",
      category: "Home Decor"
    },
    {
      id: 3,
      title: "Unforgettable Experience: Finding Hidden Gems in Bromo Mountain, East Java",
      excerpt: "Discover the breathtaking beauty and hidden treasures of Bromo Mountain in East Java, Indonesia.",
      author: "Admin",
      readTime: "5 min",
      date: "Dec 15, 2024",
      image: "/a-office-interior-image.png",
      category: "Commercial Design"
    },
    {
      id: 4,
      title: "Unforgettable Experience: Finding Hidden Gems in Bromo Mountain, East Java",
      excerpt: "Discover the breathtaking beauty and hidden treasures of Bromo Mountain in East Java, Indonesia.",
      author: "Admin",
      readTime: "5 min",
      date: "Dec 15, 2024",
      image: "/dining-interior.png",
      category: "Kitchen Design"
    },
    {
      id: 5,
      title: "Unforgettable Experience: Finding Hidden Gems in Bromo Mountain, East Java",
      excerpt: "Discover the breathtaking beauty and hidden treasures of Bromo Mountain in East Java, Indonesia.",
      author: "Admin",
      readTime: "5 min",
      date: "Dec 15, 2024",
      image: "/rectangle-8.png",
      category: "Modern Living"
    },
    {
      id: 6,
      title: "Unforgettable Experience: Finding Hidden Gems in Bromo Mountain, East Java",
      excerpt: "Discover the breathtaking beauty and hidden treasures of Bromo Mountain in East Java, Indonesia.",
      author: "Admin",
      readTime: "5 min",
      date: "Dec 15, 2024",
      image: "/rectangle-9.png",
      category: "Luxury Design"
    }
  ];

  const handleBlogDetailsClick = () => {
    navigate('/blog-details');
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-20 bg-white -mt-48 relative z-10"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div 
          ref={headerRef}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6">
            Get Interesting Insights into Interior Designs
          </h2>
        </div>

        {/* Blog Posts Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16"
        >
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              {/* Blog Post Image */}
              <div className="relative overflow-hidden rounded-lg mb-6 bg-gray-200 aspect-[4/3]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                
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
              </div>

              {/* Blog Post Content */}
              <div className="space-y-4" onClick={handleBlogDetailsClick}>
                {/* Meta Information */}
                <div className="flex items-center space-x-4 text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Read More</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 
                  className="text-xl md:text-2xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-tight transition-colors duration-300 group-hover:text-primary"
                >
                  {post.title}
                </h3>

                {/* Read More Link */}
                <div className="flex items-center space-x-2 text-sm text-[#626161] [font-family:'Fahkwang',Helvetica] group-hover:text-primary transition-colors duration-300">
                  <span>Read More</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
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
            className="bg-[#1d1e24] text-white px-8 py-3 rounded-full [font-family:'Fahkwang',Helvetica] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[#2a2b31]"
          >
            Load more
          </Button>
        </div>
      </div>
    </section>
  );
};