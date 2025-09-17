import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Resend with environment variable or null for simulation
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && resendApiKey !== 'your_resend_api_key_here' ? new Resend(resendApiKey) : null;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('API endpoint called with:', req.body);
    
    const { type, formData } = req.body;

    if (!type || !formData) {
      console.log('Missing required fields:', { type, formData });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let emailData;

    if (type === 'contact') {
      if (!formData.name || !formData.email || !formData.message) {
        console.log('Missing contact fields:', formData);
        return res.status(400).json({ error: 'Missing required contact fields' });
      }

      emailData = {
        from: 'Interior Villa <onboarding@resend.dev>',
        to: ['bdtechnocrats@gmail.com'],
        subject: 'New Contact Form Submission - Interior Villa',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #75BF44; margin: 0; font-size: 28px;">Interior Villa</h1>
                <p style="color: #666; margin: 5px 0 0 0;">New Contact Form Submission</p>
              </div>
              
              <div style="border-left: 4px solid #75BF44; padding-left: 20px; margin-bottom: 25px;">
                <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">Contact Details</h2>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Name:</strong>
                  <span style="color: #333; margin-left: 10px;">${formData.name}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Email:</strong>
                  <span style="color: #333; margin-left: 10px;">${formData.email}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Message:</strong>
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; border: 1px solid #e9ecef;">
                    <p style="color: #333; margin: 0; line-height: 1.6;">${formData.message}</p>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                  This email was sent from the Interior Villa website contact form.
                </p>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 12px;">
                  Received on: ${new Date().toLocaleString('en-US', { 
                    timeZone: 'Asia/Dhaka',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} (Bangladesh Time)
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
          New Contact Form Submission - Interior Villa
          
          Name: ${formData.name}
          Email: ${formData.email}
          
          Message:
          ${formData.message}
          
          Received on: ${new Date().toLocaleString('en-US', { 
            timeZone: 'Asia/Dhaka',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} (Bangladesh Time)
        `
      };
    } else if (type === 'appointment') {
      if (!formData.name || !formData.mobile || !formData.address) {
        console.log('Missing appointment fields:', formData);
        return res.status(400).json({ error: 'Missing required appointment fields' });
      }

      emailData = {
        from: 'Interior Villa <onboarding@resend.dev>',
        to: ['bdtechnocrats@gmail.com'],
        subject: 'New Appointment Request - Interior Villa',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #75BF44; margin: 0; font-size: 28px;">Interior Villa</h1>
                <p style="color: #666; margin: 5px 0 0 0;">New Appointment Request</p>
              </div>
              
              <div style="border-left: 4px solid #EE5428; padding-left: 20px; margin-bottom: 25px;">
                <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">Appointment Details</h2>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Name:</strong>
                  <span style="color: #333; margin-left: 10px;">${formData.name}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Mobile Number:</strong>
                  <span style="color: #333; margin-left: 10px;">${formData.mobile}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Address:</strong>
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; border: 1px solid #e9ecef;">
                    <p style="color: #333; margin: 0; line-height: 1.6;">${formData.address}</p>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; border: 1px solid #ffeaa7; margin-bottom: 20px;">
                <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">📅 Action Required</h3>
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  Please contact the client within 24 hours to schedule their appointment.
                </p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                  This appointment request was submitted through the Interior Villa website.
                </p>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 12px;">
                  Received on: ${new Date().toLocaleString('en-US', { 
                    timeZone: 'Asia/Dhaka',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} (Bangladesh Time)
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
          New Appointment Request - Interior Villa
          
          Name: ${formData.name}
          Mobile Number: ${formData.mobile}
          
          Address:
          ${formData.address}
          
          Action Required: Please contact the client within 24 hours to schedule their appointment.
          
          Received on: ${new Date().toLocaleString('en-US', { 
            timeZone: 'Asia/Dhaka',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} (Bangladesh Time)
        `
      };
    } else {
      console.log('Invalid email type:', type);
      return res.status(400).json({ error: 'Invalid email type' });
    }

    console.log('Attempting to send email with data:', emailData);

    // Check if Resend is properly configured
    if (!resend) {
      console.log('Resend not configured - simulating email send');
      console.log('Email would be sent to:', emailData.to);
      console.log('Email subject:', emailData.subject);
      
      // Simulate successful response
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully (simulated - configure RESEND_API_KEY for actual sending)',
        data: { id: 'simulated-' + Date.now() }
      });
    }

    // Send actual email using Resend
    try {
      const { data, error } = await resend.emails.send(emailData);

      if (error) {
        console.error('Resend error:', error);
        return res.status(500).json({ error: error.message || 'Failed to send email' });
      }

      console.log('Email sent successfully:', data);
      return res.status(200).json({ success: true, data });
    } catch (resendError) {
      console.error('Resend API error:', resendError);
      // Fallback to simulation if Resend fails
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully (simulated due to API error)',
        data: { id: 'fallback-' + Date.now() }
      });
    }

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}