import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function WhatsAppWidget() {
  const [isHovered, setIsHovered] = useState(false);

  const phoneNumber = '8801748981590';
  const message = 'Hello! I would like to inquire about your interior design services.';

  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ backgroundColor: '#25D366' }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="flex items-center gap-3 px-6 py-4">
        <MessageCircle
          className="w-6 h-6 transition-transform group-hover:rotate-12"
          strokeWidth={2}
        />
        <span
          className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isHovered ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-100'
          }`}
        >
          Chat with us
        </span>
      </div>

      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
    </button>
  );
}
