import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { ChevronDown, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  isOpen?: boolean;
}

export const FAQSection = (): JSX.Element => {
  const [openFAQ, setOpenFAQ] = useState<number>(1); // First FAQ open by default
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const faqListRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

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

    // FAQ list animation
    if (faqListRef.current) {
      const faqItems = faqListRef.current.children;
      
      gsap.fromTo(faqItems,
        {
          opacity: 0,
          y: 60,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: faqListRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // CTA animation
    if (ctaRef.current) {
      gsap.fromTo(ctaRef.current,
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
            trigger: ctaRef.current,
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

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "What Services Do You Offer?",
      answer: "We Offer A Full Range Of Residential, Commercial Interior Design Services, Including Space Planning, Color Consultation, Material Selection, Furniture And Project Sourcing, And Complete Project Management."
    },
    {
      id: 2,
      question: "How Long Does An Interior Design Project Usually Take?",
      answer: "Project timelines vary depending on the scope and complexity. A typical residential project can take 8-16 weeks from initial consultation to completion, while commercial projects may take 12-24 weeks. We provide detailed timelines during our initial consultation."
    },
    {
      id: 3,
      question: "Do You Work With Specific Design Styles?",
      answer: "We work with all design styles and pride ourselves on adapting to our clients' preferences. Whether you prefer modern, traditional, contemporary, or eclectic styles, our team has the expertise to bring your vision to life."
    },
    {
      id: 4,
      question: "How Much Does An Interior Design Project Cost?",
      answer: "Project costs vary based on scope, materials, and timeline. We offer flexible pricing options including hourly consultation, flat-rate design packages, and full-service project management. We provide detailed estimates after our initial consultation."
    },
    {
      id: 5,
      question: "How Do I Start Working With You?",
      answer: "Getting started is easy! Simply contact us to schedule an initial consultation. During this meeting, we'll discuss your vision, budget, timeline, and project scope. From there, we'll create a customized proposal tailored to your specific needs."
    }
  ];

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? 0 : id);
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 bg-white"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div 
          ref={headerRef}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6">
            Find Answers To Your Questions
          </h2>
        </div>

        {/* FAQ List */}
        <div 
          ref={faqListRef}
          className="space-y-4 mb-16"
        >
          {faqData.map((faq, index) => (
            <motion.div
              key={faq.id}
              layout
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleFAQ(faq.id)}
                className={`w-full px-6 py-4 text-left flex items-center justify-between transition-all duration-300 ${
                  openFAQ === faq.id 
                    ? 'bg-[#A9F577] text-[#01190c]' 
                    : 'bg-white hover:bg-gray-50 text-[#01190c]'
                }`}
              >
                <span className="text-base md:text-lg font-medium [font-family:'Fahkwang',Helvetica] pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              {/* Answer Content */}
              <AnimatePresence>
                {openFAQ === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-white border-t border-gray-200">
                      <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div 
          ref={ctaRef}
          className="text-center mt-40"
        >
          <h3 className="text-2xl md:text-3xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4">
            Still have questions? We're here to help!
          </h3>
          
          <Button 
            className="bg-[#1d1e24] text-white px-8 py-3 rounded-full [font-family:'Fahkwang',Helvetica] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[#2a2b31] flex items-center space-x-2 mx-auto"
          >
            <span>Contact Us</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};