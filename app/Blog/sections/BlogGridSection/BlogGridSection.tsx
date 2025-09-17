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
  const [visiblePosts, setVisiblePosts] = useState(6); // Start with 6 posts
  const [loading, setLoading] = useState(false);
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

  // Extended blog posts array for infinite scroll simulation
  const allBlogPosts: BlogPost[] = [
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
      title: "Small Space, Big Impact: Interior Design Hacks for Compact Living",
      excerpt: "Learn clever design strategies to maximize your small space and create a home that feels spacious and organized.",
      author: "Admin",
      readTime: "5 min",
      date: "Dec 14, 2024",
      image: "/create-an-image-where-a-beautiful-girl-shows-her-bedroom-interio.png",
      category: "Home Decor"
    },
    {
      id: 3,
      title: "Sustainable Chic: Eco-Friendly Interior Design Ideas You'll Love",
      excerpt: "Explore how to create beautiful, environmentally conscious interiors using sustainable materials.",
      author: "Admin",
      readTime: "7 min",
      date: "Dec 13, 2024",
      image: "/a-office-interior-image.png",
      category: "Sustainability"
    },
    {
      id: 4,
      title: "The Psychology of Color in Interior Design",
      excerpt: "Understand how different colors affect mood and atmosphere in your home design choices.",
      author: "Admin",
      readTime: "6 min",
      date: "Dec 12, 2024",
      image: "/dining-interior.png",
      category: "Color Theory"
    },
    {
      id: 5,
      title: "Modern Kitchen Design Trends for 2025",
      excerpt: "Stay ahead of the curve with the latest kitchen design trends that combine functionality with style.",
      author: "Admin",
      readTime: "8 min",
      date: "Dec 11, 2024",
      image: "/rectangle-8.png",
      category: "Kitchen Design"
    },
    {
      id: 6,
      title: "Creating the Perfect Home Office: Design Tips for Productivity",
      excerpt: "Transform your workspace into a productive and inspiring environment with these design tips.",
      author: "Admin",
      readTime: "6 min",
      date: "Dec 10, 2024",
      image: "/rectangle-9.png",
      category: "Workspace Design"
    },
    {
      id: 7,
      title: "Luxury Living: High-End Interior Design Elements",
      excerpt: "Discover the key elements that define luxury interior design and how to incorporate them into your home.",
      author: "Admin",
      readTime: "9 min",
      date: "Dec 9, 2024",
      image: "/a-residential-interior-image.png",
      category: "Luxury Design"
    },
    {
      id: 8,
      title: "Minimalist Design: Less is More in Modern Interiors",
      excerpt: "Embrace the beauty of simplicity with minimalist design principles that create calm, clutter-free spaces.",
      author: "Admin",
      readTime: "4 min",
      date: "Dec 8, 2024",
      image: "/create-an-image-where-a-beautiful-girl-shows-her-bedroom-interio.png",
      category: "Minimalism"
    },
    {
      id: 9,
      title: "Smart Home Integration in Interior Design",
      excerpt: "Learn how to seamlessly integrate smart home technology into your interior design for a modern lifestyle.",
      author: "Admin",
      readTime: "7 min",
      date: "Dec 7, 2024",
      image: "/a-office-interior-image.png",
      category: "Technology"
    },
    {
      id: 10,
      title: "Seasonal Decorating: Refreshing Your Space Throughout the Year",
      excerpt: "Discover how to update your home's look with seasonal decorating tips that keep your space fresh and inviting.",
      author: "Admin",
      readTime: "5 min",
      date: "Dec 6, 2024",
      image: "/dining-interior.png",
      category: "Seasonal Design"
    }
  ];

  // Get currently visible posts
  const displayedPosts = allBlogPosts.slice(0, visiblePosts);
  const hasMorePosts = visiblePosts < allBlogPosts.length;

  const handleLoadMore = () => {
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setVisiblePosts(prev => Math.min(prev + 6, allBlogPosts.length));
      setLoading(false);
    }, 1000);
  };

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
          {displayedPosts.map((post, index) => (
            <motion.article
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
              onClick={handleBlogDetailsClick}
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
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <span className="text-[#626161]">{post.date}</span>
                </div>

                {/* Title */}
                <h3 
                  className="text-xl md:text-2xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-tight transition-colors duration-300 group-hover:text-primary"
                >
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Read More Link */}
                <div className="flex items-center space-x-2 text-sm text-primary [font-family:'Fahkwang',Helvetica] group-hover:text-secondary transition-colors duration-300">
                  <span>Read More</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Load More Section */}
        {hasMorePosts && (
          <div className="text-center">
            <Button 
              ref={loadMoreRef}
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-[#1d1e24] text-white px-8 py-3 rounded-full [font-family:'Fahkwang',Helvetica] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[#2a2b31] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}

        {/* End message */}
        {!hasMorePosts && displayedPosts.length > 6 && (
          <div className="text-center">
            <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] mb-4">
              You've reached the end of our blog posts.
            </p>
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-primary text-white px-6 py-2 rounded-lg [font-family:'Fahkwang',Helvetica] font-medium hover:bg-primary-hover transition-colors duration-300"
            >
              Back to Top
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};