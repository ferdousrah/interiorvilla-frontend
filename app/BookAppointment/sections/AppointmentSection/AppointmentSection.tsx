import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sendAppointmentEmail } from "/src/services/emailService";

gsap.registerPlugin(ScrollTrigger);

export const AppointmentSection = (): JSX.Element => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const sectionRef = useRef<HTMLElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Left card animation
    if (leftCardRef.current) {
      gsap.fromTo(leftCardRef.current,
        {
          opacity: 0,
          x: -60,
          scale: 0.95
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: leftCardRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Right card animation
    if (rightCardRef.current) {
      gsap.fromTo(rightCardRef.current,
        {
          opacity: 0,
          x: 60,
          scale: 0.95
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rightCardRef.current,
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Reset status when user starts typing
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await sendAppointmentEmail(formData);
      setSubmitStatus('success');
      setFormData({ name: "", mobile: "", address: "" });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to send appointment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactClick = () => {
    window.location.href = '/contact';
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 bg-white"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Card - Let's Start Your Dream Project */}
          <motion.div
            ref={leftCardRef}
            className="relative overflow-hidden rounded-3xl p-8 md:p-12 h-full min-h-[500px] flex flex-col justify-center"
            style={{
              background: 'linear-gradient(135deg, #D4E157 0%, #C0CA33 50%, #AFB42B 100%)'
            }}
          >
            {/* Decorative Arrow Icon */}
            <div className="mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-tight">
                Let's Start Your Dream Project!
              </h2>
              
              <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-relaxed max-w-md">
                Fill out the form below to schedule a consultation. Our team will get back to you shortly to discuss your vision and how we can help!
              </p>
              
              <div className="pt-4">
                <p className="text-sm [font-family:'Fahkwang',Helvetica] text-[#01190c] font-medium mb-4">
                  Need More Information?
                </p>
                
                <Button onClick={handleContactClick} 
                  className="bg-[#01190c] text-white px-6 py-3 rounded-lg [font-family:'Fahkwang',Helvetica] font-medium hover:bg-[#2a2b31] transition-all duration-300 hover:scale-105"
                >
                  Contact Us
                </Button>
              </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/2"></div>
          </motion.div>

          {/* Right Card - Contact Form */}
          <motion.div
            ref={rightCardRef}
            className="bg-[#E8E8E8] rounded-3xl p-8 md:p-12 h-full min-h-[500px] flex flex-col justify-center"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-100 border border-green-300 rounded-lg"
                >
                  <p className="text-green-800 [font-family:'Fahkwang',Helvetica] font-medium">
                    ✅ Appointment request sent successfully! We'll contact you within 24 hours.
                  </p>
                </motion.div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-100 border border-red-300 rounded-lg"
                >
                  <p className="text-red-800 [font-family:'Fahkwang',Helvetica] font-medium">
                    ❌ {errorMessage}
                  </p>
                </motion.div>
              )}

              {/* Form Fields */}
              <div className="space-y-6">
                <Input
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-white border-gray-300 rounded-lg px-4 py-4 text-base [font-family:'Fahkwang',Helvetica] placeholder:text-gray-500 focus:border-primary focus:ring-primary h-auto"
                  disabled={isSubmitting}
                  required
                />

                <Input
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="bg-white border-gray-300 rounded-lg px-4 py-4 text-base [font-family:'Fahkwang',Helvetica] placeholder:text-gray-500 focus:border-primary focus:ring-primary h-auto"
                  disabled={isSubmitting}
                  required
                />

                <Textarea
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="bg-white border-gray-300 rounded-lg px-4 py-4 text-base [font-family:'Fahkwang',Helvetica] placeholder:text-gray-500 focus:border-primary focus:ring-primary min-h-[120px] resize-none"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white px-8 py-4 rounded-lg [font-family:'Fahkwang',Helvetica] font-medium text-lg hover:bg-primary-hover transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};