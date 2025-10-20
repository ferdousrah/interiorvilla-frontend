import React from "react";
import { CustomCursor } from "../../components/ui/cursor";
import { FooterSection } from "../../components/screens/Home/sections/FooterSection/FooterSection";
import { PageHero } from "../../components/ui/PageHero";
import {
  AppointmentSection
} from "./sections";

const BookAppointment = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <PageHero
              title="Book An Appointment"
              bgImage={
                "/image.png"
              }
              breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Book An Appointment", isActive: true },
              ]}
            />

      {/* Main Content Container */}
      <div className="w-full">
        {/* Appointment Form Section */}
        <AppointmentSection />
      </div>
      
      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default BookAppointment;