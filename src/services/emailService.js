// src/services/emailService.js
import axios from "axios";

/**
 * This file sends form data to your backend API endpoint.
 * The backend will handle sending emails using Resend securely.
 *
 * Example backend endpoint: /api/send-email/
 */

// 🔧 Change this to match your backend API URL
// If using Next.js API route: '/api/send-email'
// If using Django backend: 'https://your-backend.com/api/send-email/'
const BACKEND_EMAIL_ENDPOINT = "/api/send-email/";

/* -------------------------------------------------------
   🧩 Appointment Email
------------------------------------------------------- */
export async function sendAppointmentEmail(data) {
  try {
    const payload = {
      type: "appointment",
      name: data.name,
      mobile: data.mobile,
      address: data.address,
      email: data.email || "",
    };

    const response = await axios.post(BACKEND_EMAIL_ENDPOINT, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to send appointment email:", error?.response?.data || error.message);
    throw new Error("Failed to send email");
  }
}

/* -------------------------------------------------------
   💬 Contact Email
------------------------------------------------------- */
export async function sendContactEmail(data) {
  try {
    const payload = {
      type: "contact",
      name: data.name,
      email: data.email,
      mobile: data.mobile || "",
      subject: data.subject || "",
      message: data.message,
    };

    const response = await axios.post(BACKEND_EMAIL_ENDPOINT, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to send contact email:", error?.response?.data || error.message);
    throw new Error("Failed to send email");
  }
}
