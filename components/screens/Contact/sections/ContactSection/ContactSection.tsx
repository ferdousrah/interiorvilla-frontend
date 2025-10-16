// ContactSection.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../../ui/button";
import { Input } from "../../../../ui/input";
import { Textarea } from "../../../../ui/textarea";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Loader2,   // 👈 add this line
} from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sendContactEmail } from "../../../../../src/services/emailService";

gsap.registerPlugin(ScrollTrigger);

/** ---- Types & helpers ---- */
type RawOffice = {
  id: string | number;
  title?: string; name?: string;
  address?: string;
  phone?: string; mobile?: string;
  email?: string;
  latitude?: number | string;
  longitude?: number | string;
  location?: { lat?: number; lng?: number } | null;
};

type Office = {
  id: string;
  title: string;
  address: string;
  phone: string;
  email: string;
  lat?: number;
  lng?: number;
};

function normalizeOffice(o: RawOffice): Office {
  const title = String(o.title ?? o.name ?? "Untitled Office");
  const address = String(o.address ?? "");
  const phone = String(o.phone ?? o.mobile ?? "");
  const email = String(o.email ?? "");
  const lat =
    typeof o.latitude === "string"
      ? parseFloat(o.latitude)
      : typeof o.latitude === "number"
      ? o.latitude
      : o.location?.lat;
  const lng =
    typeof o.longitude === "string"
      ? parseFloat(o.longitude)
      : typeof o.longitude === "number"
      ? o.longitude
      : o.location?.lng;

  return {
    id: String(o.id ?? title),
    title,
    address,
    phone,
    email,
    lat: Number.isFinite(lat as number) ? (lat as number) : undefined,
    lng: Number.isFinite(lng as number) ? (lng as number) : undefined,
  };
}

function buildMapSrc(office: Office): string {
  if (office.lat != null && office.lng != null) {
    return `https://www.google.com/maps?q=${office.lat},${office.lng}&z=15&output=embed`;
  }
  const q = encodeURIComponent(`${office.title} ${office.address}`.trim());
  return `https://www.google.com/maps?q=${q}&z=15&output=embed`;
}

/** ---- Component ---- */
export const ContactSection = (): JSX.Element => {
  // Refs (animations)
  const sectionRef = useRef<HTMLElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const mapRowRef = useRef<HTMLDivElement>(null);

  // Offices
  const [offices, setOffices] = useState<Office[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeOffice = useMemo(
    () => offices.find((o) => o.id === activeId) ?? offices[0],
    [offices, activeId]
  );

  const [loadingOffices, setLoadingOffices] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Form
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] =
    useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  /** Fetch offices, default to "Head Office" if present */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingOffices(true);
        setLoadError("");
        const res = await fetch("https://interiorvillabd.com/api/offices?sort=asc", { mode: "cors" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const raw: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.docs)
          ? data.docs
          : Array.isArray(data?.data)
          ? data.data
          : [];
        const mapped = raw.map(normalizeOffice).filter((o) => o.title);

        if (!cancelled) {
          setOffices(mapped);
          // default to "Head Office" if exists; otherwise first
          const head = mapped.find(
            (o) => o.title.toLowerCase().trim() === "head office"
          );
          setActiveId(head?.id ?? mapped[0]?.id ?? null);
        }
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || "Failed to load offices.");
      } finally {
        if (!cancelled) setLoadingOffices(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Animations */
  useEffect(() => {
    if (chipsRef.current) {
      gsap.fromTo(
        chipsRef.current,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: chipsRef.current, start: "top 90%" },
        }
      );
    }
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: cardsRef.current, start: "top 85%" },
        }
      );
    }
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: formRef.current, start: "top 85%" },
        }
      );
    }
    if (mapRowRef.current) {
      gsap.fromTo(
        mapRowRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: mapRowRef.current, start: "top 85%" },
        }
      );
    }
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  /** Form handlers */
  const handleInputChange = (field: "name" | "email" | "message", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOffice) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await sendContactEmail({
        ...formData,
        officeId: activeOffice.id,
        officeName: activeOffice.title,
        officeEmail: activeOffice.email,
      } as any);

      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(error?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <section ref={sectionRef} className="bg-white -mt-48 relative z-10"
    >
      {/* ---------- TOP: Horizontal office scroller ---------- */}
      <div className="w-full border-b bg-white">
        <div className="container mx-auto px-4 max-w-6xl py-6">
          {loadingOffices ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading offices…
            </div>
          ) : loadError ? (
            <p className="text-red-600">{loadError}</p>
          ) : offices.length === 0 ? (
            <p className="text-gray-600">No offices found.</p>
          ) : (
            <div
              ref={chipsRef}
              className="flex items-center gap-3 overflow-x-auto no-scrollbar snap-x"
            >
              {offices.map((o) => {
                const active = o.id === activeOffice?.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setActiveId(o.id)}
                    className={[
                      "shrink-0 snap-start rounded-full px-4 py-2 border transition-all",
                      "[font-family:'Fahkwang',Helvetica] text-sm",
                      active
                        ? "border-primary bg-primary/10 text-[#0f3b23]"
                        : "border-gray-300 hover:border-primary/60 hover:bg-primary/5 text-[#2D2D2D]",
                    ].join(" ")}
                    title={o.title}
                  >
                    {o.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ---------- MIDDLE: Info cards + Form ---------- */}
      <div className="bg-[#F5F3F0]">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Cards */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-0 relative"
          >
            {/* Address */}
            <div className="text-center py-12 px-8 relative">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#2D2D2D] mb-4">
                {activeOffice?.title || "Office"}
              </h3>
              <p className="text-[#666666] [font-family:'Fahkwang',Helvetica]">
                {activeOffice?.address || "—"}
              </p>
            </div>
            <div
              className="hidden md:block absolute top-8 bottom-8 w-px bg-[#D0D0D0]"
              style={{ left: "33.333%" }}
            />
            {/* Phone */}
            <div className="text-center py-12 px-8 relative">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#2D2D2D] mb-4">
                Have Any Question
              </h3>
              <p className="text-[#666666] [font-family:'Fahkwang',Helvetica]">
                {activeOffice?.phone ? (
                  <a className="hover:underline" href={`tel:${activeOffice.phone}`}>
                    {activeOffice.phone}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div
              className="hidden md:block absolute top-8 bottom-8 w-px bg-[#D0D0D0]"
              style={{ left: "66.666%" }}
            />
            {/* Email */}
            <div className="text-center py-12 px-8 relative">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#2D2D2D] mb-4">
                Email Address
              </h3>
              <p className="text-[#666666] [font-family:'Fahkwang',Helvetica] break-all">
                {activeOffice?.email ? (
                  <a className="hover:underline" href={`mailto:${activeOffice.email}`}>
                    {activeOffice.email}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl" ref={formRef}>
          <h2 className="text-3xl md:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-10 text-center">
            Need Any Help? Drop us a Line
          </h2>

          {submitStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg"
            >
              <p className="text-green-800 [font-family:'Fahkwang',Helvetica] font-medium">
                ✅ Message sent successfully! We'll get back to you soon.
              </p>
            </motion.div>
          )}
          {submitStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg"
            >
              <p className="text-red-800 [font-family:'Fahkwang',Helvetica] font-medium">
                ❌ {errorMessage}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              readOnly
              value={activeOffice?.title ? `Office: ${activeOffice.title}` : ""}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm [font-family:'Fahkwang',Helvetica]"
            />
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-4 text-base [font-family:'Fahkwang',Helvetica] placeholder:text-gray-500 focus:border-primary focus:ring-primary h-auto w-full"
              disabled={isSubmitting}
              required
            />
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-4 text-base [font-family:'Fahkwang',Helvetica] placeholder:text-gray-500 focus:border-primary focus:ring-primary h-auto w-full"
              disabled={isSubmitting}
              required
            />
            <Textarea
              placeholder="Type your Message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-4 text-base [font-family:'Fahkwang',Helvetica] placeholder:text-gray-500 focus:border-primary focus:ring-primary min-h-[120px] resize-none w-full"
              disabled={isSubmitting}
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting || !activeOffice}
              className="bg-primary text-white px-8 py-3 rounded-lg [font-family:'Fahkwang',Helvetica] font-medium text-base hover:bg-primary-hover transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* ---------- BOTTOM: FULL-WIDTH MAP ---------- */}
      <div ref={mapRowRef} className="w-full bg-gray-100">
        {activeOffice ? (
          <iframe
            key={`${activeOffice.id}-map`}
            src={buildMapSrc(activeOffice)}
            className="w-full h-[420px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            aria-label={`Map for ${activeOffice.title}`}
          />
        ) : (
          <div className="w-full h-[420px] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 [font-family:'Fahkwang',Helvetica]">
                Select an office to see the map
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
