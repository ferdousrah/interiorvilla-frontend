import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY; // from your .env file

  try {
    const { subject, html } = req.body;
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Interior Villa <no-reply@interiorvillabd.com>",
        to: ["bdtechnocrats@gmail.com"],
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("Resend error:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data?.message || "Failed to send email",
    });
  }
}
