import React from "react";
import { CustomCursor } from "../../components/ui/cursor";
import { FooterSection } from "../../components/screens/Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  AppointmentSection
} from "./sections";

const BookAppointment = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <HeroSection />

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