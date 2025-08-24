// SEO utility functions for dynamic meta tag management

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const updateSEO = (data: SEOData) => {
  // Update document title
  document.title = data.title;

  // Update or create meta tags
  updateMetaTag('description', data.description);
  
  if (data.keywords) {
    updateMetaTag('keywords', data.keywords);
  }

  // Update Open Graph tags
  updateMetaProperty('og:title', data.title);
  updateMetaProperty('og:description', data.description);
  
  if (data.image) {
    updateMetaProperty('og:image', data.image);
  }
  
  if (data.url) {
    updateMetaProperty('og:url', data.url);
    updateCanonicalUrl(data.url);
  }
  
  if (data.type) {
    updateMetaProperty('og:type', data.type);
  }

  // Update Twitter Card tags
  updateMetaTag('twitter:title', data.title, 'name');
  updateMetaTag('twitter:description', data.description, 'name');
  
  if (data.image) {
    updateMetaTag('twitter:image', data.image, 'name');
  }
};

const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (element) {
    element.content = content;
  } else {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    element.content = content;
    document.head.appendChild(element);
  }
};

const updateMetaProperty = (property: string, content: string) => {
  let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  
  if (element) {
    element.content = content;
  } else {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    element.content = content;
    document.head.appendChild(element);
  }
};

const updateCanonicalUrl = (url: string) => {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (element) {
    element.href = url;
  } else {
    element = document.createElement('link');
    element.rel = 'canonical';
    element.href = url;
    document.head.appendChild(element);
  }
};

// Page-specific SEO data
export const seoData = {
  home: {
    title: "Interior Villa - Premium Interior Design Services in Bangladesh",
    description: "Transform your space with Interior Villa's expert interior design services. Specializing in residential, commercial, and architectural consultancy in Bangladesh. 9+ years of experience, 1000+ projects completed.",
    keywords: "interior design, Bangladesh, residential interior, commercial interior, architectural consultancy, home design, office design, interior decorator, Dhaka",
    url: "https://interiorvillabd.com",
    type: "website"
  },
  about: {
    title: "About Us - Interior Villa | Leading Interior Design Company in Bangladesh",
    description: "Learn about Interior Villa's journey, mission, and expert team. 9+ years of experience in creating beautiful, functional spaces across Bangladesh with 1000+ completed projects.",
    keywords: "about interior villa, interior design company Bangladesh, interior design team, mission vision, experience",
    url: "https://interiorvillabd.com/about",
    type: "website"
  },
  contact: {
    title: "Contact Us - Interior Villa | Get Your Free Design Consultation",
    description: "Contact Interior Villa for your interior design needs. Located in Dhaka, Bangladesh. Call +88 01748981590 or email info@interiorvillabd.com for free consultation.",
    keywords: "contact interior villa, interior design consultation, Dhaka interior designer, free consultation",
    url: "https://interiorvillabd.com/contact",
    type: "website"
  },
  blog: {
    title: "Interior Design Blog - Tips, Trends & Inspiration | Interior Villa",
    description: "Discover the latest interior design trends, tips, and inspiration from Interior Villa's experts. Get insights into creating beautiful, functional spaces.",
    keywords: "interior design blog, design tips, home decor trends, interior inspiration, design ideas",
    url: "https://interiorvillabd.com/blog",
    type: "website"
  },
  portfolio: {
    title: "Portfolio - Interior Villa | Our Best Interior Design Projects",
    description: "Explore Interior Villa's portfolio of stunning residential, commercial, and architectural projects. See our expertise in transforming spaces across Bangladesh.",
    keywords: "interior design portfolio, residential projects, commercial projects, architectural consultancy, before after",
    url: "https://interiorvillabd.com/portfolio",
    type: "website"
  },
  residentialInterior: {
    title: "Residential Interior Design Services | Interior Villa Bangladesh",
    description: "Transform your home with Interior Villa's residential interior design services. Personalized designs, premium materials, and expert craftsmanship for your dream home.",
    keywords: "residential interior design, home interior, house design, bedroom design, living room design, kitchen design",
    url: "https://interiorvillabd.com/residential-interior",
    type: "service"
  },
  commercialInterior: {
    title: "Commercial Interior Design Services | Interior Villa Bangladesh",
    description: "Enhance your business space with Interior Villa's commercial interior design services. Office design, retail spaces, and corporate interiors that boost productivity.",
    keywords: "commercial interior design, office design, retail interior, corporate interior, workspace design",
    url: "https://interiorvillabd.com/commercial-interior",
    type: "service"
  },
  architecturalConsultancy: {
    title: "Architectural Consultancy Services | Interior Villa Bangladesh",
    description: "Expert architectural consultancy services from Interior Villa. Structural design, building planning, and technical documentation for your construction projects.",
    keywords: "architectural consultancy, building design, structural planning, architectural services, construction planning",
    url: "https://interiorvillabd.com/architectural-consultancy",
    type: "service"
  },
  bookAppointment: {
    title: "Book an Appointment - Interior Villa | Schedule Your Free Design Consultation",
    description: "Schedule a free consultation with Interior Villa's expert designers. Book your appointment today and start transforming your space with professional interior design services in Bangladesh.",
    keywords: "book appointment, interior design consultation, free consultation, schedule meeting, interior designer appointment, design consultation Bangladesh",
    url: "https://interiorvillabd.com/book-appointment",
    type: "website"
  },
  faq: {
    title: "FAQ - Interior Villa | Frequently Asked Questions About Interior Design",
    description: "Find answers to common questions about Interior Villa's interior design services, pricing, timelines, and process. Get all the information you need before starting your project.",
    keywords: "interior design FAQ, frequently asked questions, interior design process, pricing questions, design consultation FAQ",
    url: "https://interiorvillabd.com/faq",
    type: "website"
  },
  notFound: {
    title: "Page Not Found - Interior Villa | 404 Error",
    description: "The page you're looking for doesn't exist. Explore Interior Villa's interior design services, portfolio, and blog to find what you need.",
    keywords: "404 error, page not found, interior villa, interior design services",
    url: "https://interiorvillabd.com/404",
    type: "website"
  }
};