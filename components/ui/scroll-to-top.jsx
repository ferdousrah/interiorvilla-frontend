import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      if (scrollPosition > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    toggleVisibility();

    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 z-[9999] p-4 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl transition-all duration-300 hover:scale-110 ${
        isVisible ? "bottom-28 opacity-100" : "bottom-28 opacity-0 pointer-events-none"
      }`}
      aria-label="Scroll to top"
      style={{
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <ArrowUp className="w-6 h-6" strokeWidth={2.5} />
    </button>
  );
};
