import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY not configured" });
  }

  try {
    const { type, name, email, mobile, address, subject, message } = req.body;

    let emailSubject = "";
    let emailHtml = "";

    if (type === "appointment") {
      emailSubject = "New Appointment Request - Interior Villa";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #75BF44; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Appointment Request</h1>
          </div>
          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 5px;">
            <h2 style="color: #333; border-bottom: 2px solid #75BF44; padding-bottom: 10px;">Client Details</h2>
            <table style="width: 100%; margin-top: 20px;">
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 10px 0; color: #333;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Mobile:</td>
                <td style="padding: 10px 0; color: #333;">${mobile}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Address:</td>
                <td style="padding: 10px 0; color: #333;">${address}</td>
              </tr>
            </table>
          </div>
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated message from Interior Villa BD website.</p>
          </div>
        </div>
      `;
    } else if (type === "contact") {
      emailSubject = subject || "New Contact Form Submission - Interior Villa";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #75BF44; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Contact Message</h1>
          </div>
          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 5px;">
            <h2 style="color: #333; border-bottom: 2px solid #75BF44; padding-bottom: 10px;">Contact Details</h2>
            <table style="width: 100%; margin-top: 20px;">
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 10px 0; color: #333;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Email:</td>
                <td style="padding: 10px 0; color: #333;">${email}</td>
              </tr>
              ${mobile ? `
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Mobile:</td>
                <td style="padding: 10px 0; color: #333;">${mobile}</td>
              </tr>
              ` : ''}
            </table>
            <div style="margin-top: 30px;">
              <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
              <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #75BF44; border-radius: 3px;">
                <p style="color: #333; line-height: 1.6; margin: 0;">${message}</p>
              </div>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated message from Interior Villa BD website.</p>
          </div>
        </div>
      `;
    } else {
      return res.status(400).json({ error: "Invalid request: type field required" });
    }

    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Interior Villa <onboarding@resend.dev>",
        to: ["bdtechnocrats@gmail.com"],
        subject: emailSubject,
        html: emailHtml,
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
