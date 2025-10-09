import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Clock, User, Calendar, Tag, MessageCircle, Search } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Comment {
  id: number;
  author: string;
  date: string;
  content: string;
  avatar: string;
}

export const BlogContentSection = (): JSX.Element => {
  const [newComment, setNewComment] = useState({
    name: "",
    email: "",
    message: ""
  });

  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Content animation
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
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
            trigger: contentRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Sidebar animation
    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current,
        {
          opacity: 0,
          x: 50
        },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sidebarRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Comments animation
    if (commentsRef.current) {
      gsap.fromTo(commentsRef.current,
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
            trigger: commentsRef.current,
            start: "top 85%",
            end: "top 55%",
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

  const comments: Comment[] = [
    {
      id: 1,
      author: "William Oli",
      date: "Dec 15, 2024",
      content: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.",
      avatar: "/avatar-image-1.png"
    },
    {
      id: 2,
      author: "Adam Hafez",
      date: "Dec 14, 2024",
      content: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.",
      avatar: "/avatar-image-1.png"
    }
  ];

  const categories = [
    { name: "Interior", count: 5, active: true },
    { name: "UI Design", count: 3, active: false },
    { name: "Development", count: 8, active: false },
    { name: "Digital Marketing", count: 2, active: false },
    { name: "UX Design", count: 4, active: false }
  ];

  const recentPosts = [
    {
      title: "Marketing and business writing a document",
      date: "Dec 15, 2024",
      image: "/a-residential-interior-image.png"
    },
    {
      title: "New trends and tips to make an impact in design",
      date: "Dec 14, 2024",
      image: "/create-an-image-where-a-beautiful-girl-shows-her-bedroom-interio.png"
    }
  ];

  const tags = ["Interior", "Business", "Design", "Marketing", "Development"];

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle comment submission
    console.log("Comment submitted:", newComment);
    setNewComment({ name: "", email: "", message: "" });
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-20 bg-white -mt-48 relative z-10"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div 
            ref={contentRef}
            className="lg:col-span-2"
          >
            {/* Featured Image */}
            <div className="mb-8">
              <div className="w-full h-[400px] bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="/a-residential-interior-image.png"
                  alt="Blog Featured Image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Blog Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Admin</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>15 Comments</span>
              </div>
            </div>

            {/* Blog Title */}
            <h1 className="text-3xl md:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-8 leading-tight">
              Why Are Team Leadership Skills So Important?
            </h1>

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed">
              <p className="mb-6">
                Business and professional writing requires a unique set of skills and an understanding of the audience. Whether you're writing a business proposal, a marketing email, or a professional report, the way you communicate can significantly impact your success.
              </p>

              <p className="mb-6">
                Effective business writing is clear, concise, and purposeful. It gets straight to the point while maintaining a professional tone that resonates with your target audience. Understanding your readers' needs, expectations, and level of expertise is crucial for crafting messages that not only inform but also persuade and inspire action.
              </p>

              {/* Leadership Skills Section */}
              <h2 className="text-2xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4 mt-8">
                Leadership Skills
              </h2>

              <p className="mb-6">
                Strong leadership skills are essential for business success and team effectiveness. Great leaders inspire their teams, drive innovation, and create environments where everyone can thrive. They possess emotional intelligence, strategic thinking abilities, and the capacity to make difficult decisions under pressure.
              </p>

              {/* Quote Block */}
              <div className="bg-[#f7f9fb] border-l-4 border-primary p-6 my-8 rounded-r-lg">
                <blockquote className="text-lg italic text-[#01190c] [font-family:'Fahkwang',Helvetica]">
                  "The main thing is there among us there of trust or increase of desire to obtain goal of trust, because it is gain, but because occasionally chooses to enjoy a pleasure"
                </blockquote>
              </div>

              <p className="mb-6">
                When we think about effective leadership, we often focus on the technical skills and experience that leaders bring to their organizations. However, some of the most important leadership qualities are intangible - things like emotional intelligence, empathy, and the ability to inspire others.
              </p>

              <p className="mb-6">
                There are many variations of passages of team members, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possunt, omnis voluptas assumenda est, omnis dolor repellendus.
              </p>

              {/* Team Leadership Section */}
              <h2 className="text-2xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4 mt-8">
                Team Leadership
              </h2>

              <p className="mb-6">
                Team leadership involves more than just managing people - it's about creating a shared vision, fostering collaboration, and empowering team members to reach their full potential. Successful team leaders understand that their role is to serve their team, not the other way around.
              </p>

              <p className="mb-6">
                Effective team leaders create psychological safety within their teams, encouraging open communication, innovation, and calculated risk-taking. They recognize and celebrate individual strengths while working to address areas for improvement through coaching and development opportunities.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div>
                  <h3 className="text-lg font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-3">
                    Leadership & Productivity
                  </h3>
                  <p className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                    Great leaders understand that productivity comes from empowering their teams and creating the right environment for success.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-3">
                    Project & Management
                  </h3>
                  <p className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                    Effective project management requires strong leadership skills to coordinate teams and deliver results on time.
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c]">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#f7f9fb] text-sm [font-family:'Fahkwang',Helvetica] text-[#626161] rounded-full hover:bg-primary hover:text-white transition-colors duration-300 cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div 
              ref={commentsRef}
              className="mt-16"
            >
              <h3 className="text-2xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-8">
                2 Comments
              </h3>

              {/* Comments List */}
              <div className="space-y-8 mb-12">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-4">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c]">
                          {comment.author}
                        </h4>
                        <span className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                          {comment.date}
                        </span>
                        <Button 
                          size="sm" 
                          className="bg-primary text-white px-3 py-1 text-xs rounded-full hover:bg-primary-hover"
                        >
                          Reply
                        </Button>
                      </div>
                      <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Form */}
              <div className="bg-[#f7f9fb] rounded-lg p-8">
                <h4 className="text-xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6">
                  Leave a Reply
                </h4>
                
                <form onSubmit={handleCommentSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      placeholder="Your Name*"
                      value={newComment.name}
                      onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                      className="bg-white border-gray-200 [font-family:'Fahkwang',Helvetica]"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your Email*"
                      value={newComment.email}
                      onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                      className="bg-white border-gray-200 [font-family:'Fahkwang',Helvetica]"
                      required
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Post your comment"
                    value={newComment.message}
                    onChange={(e) => setNewComment({...newComment, message: e.target.value})}
                    className="bg-white border-gray-200 [font-family:'Fahkwang',Helvetica] min-h-[120px]"
                    required
                  />
                  
                  <Button 
                    type="submit"
                    className="bg-primary text-white px-8 py-3 rounded-lg [font-family:'Fahkwang',Helvetica] font-medium hover:bg-primary-hover transition-colors duration-300"
                  >
                    Post Comment
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div 
            ref={sidebarRef}
            className="lg:col-span-1"
          >
            <div className="space-y-8">
              {/* Categories */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6 uppercase tracking-wider">
                  Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-300 ${
                        category.active 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-[#f7f9fb] text-[#626161]'
                      }`}
                    >
                      <span className="[font-family:'Fahkwang',Helvetica]">{category.name}</span>
                      <span className="text-sm">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Posts */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6 uppercase tracking-wider">
                  Latest Post
                </h3>
                <div className="space-y-6">
                  {recentPosts.map((post, index) => (
                    <div key={index} className="flex space-x-4 group cursor-pointer">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
                          {post.title}
                        </h4>
                        <span className="text-xs text-[#626161] [font-family:'Fahkwang',Helvetica]">
                          {post.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post Tags */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6 uppercase tracking-wider">
                  Post Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-[#f7f9fb] text-sm [font-family:'Fahkwang',Helvetica] text-[#626161] rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Help Widget */}
              <div className="bg-[#1d1e24] text-white rounded-lg p-6 text-center">
                <h3 className="text-xl font-medium [font-family:'Fahkwang',Helvetica] mb-4">
                  How Can We Help?
                </h3>
                <p className="text-sm text-gray-300 [font-family:'Fahkwang',Helvetica] mb-6">
                  Contact our experts
                </p>
                <Button className="bg-primary text-white px-6 py-2 rounded-lg [font-family:'Fahkwang',Helvetica] font-medium hover:bg-primary-hover transition-colors duration-300 w-full">
                  Start Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};