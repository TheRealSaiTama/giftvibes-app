import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import nodemailer from 'nodemailer';

const createTransporter = (opts?: { secure?: boolean; port?: number }) => {
  const user = (process.env.GMAIL_EMAIL || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, ''); // remove spaces if pasted
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: opts?.port ?? 587,
    secure: opts?.secure ?? false, // true for 465
    auth: { user, pass },
    authMethod: 'PLAIN',
  });
  return transporter;
};

export async function POST(request: NextRequest) {
  try {
    // Log env vars (masked for security)
    console.log('GMAIL_EMAIL configured:', process.env.GMAIL_EMAIL ? 'Yes' : 'No');
    console.log('GMAIL_APP_PASSWORD length:', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 'Missing');

    const formData = await request.formData();
    
    // Log form data summary
    console.log('Form submission received');
    console.log('Full Name:', formData.get('fullName'));
    console.log('Email:', formData.get('email'));
    console.log('Selected Products Count:', formData.get('selectedProducts') ? 'Present' : 'None');
    console.log('Files Count:', formData.getAll('files').length);
    
    // Extract form fields (with fallbacks)
    const fullName = (formData.get('fullName') as string)?.trim() || 'N/A';
    const companyName = (formData.get('companyName') as string)?.trim() || 'N/A';
    const phone = (formData.get('phone') as string)?.trim() || 'N/A';
    const email = (formData.get('email') as string)?.trim() || 'N/A';
    const quantity = formData.get('quantity') as string || 'N/A';
    const pincode = formData.get('pincode') as string || 'N/A';
    const address = (formData.get('address') as string)?.replace(/\n/g, '<br>') || 'N/A';
    const description = (formData.get('description') as string)?.replace(/\n/g, '<br>') || 'N/A';
    const gst = (formData.get('gst') as string)?.trim() || 'N/A';
    const orderNotes = (formData.get('orderNotes') as string)?.replace(/\n/g, '<br>') || 'N/A';
    
    // Parse selected products
    let selectedProducts: any[] = [];
    const selectedProductsStr = formData.get('selectedProducts') as string;
    if (selectedProductsStr) {
      try {
        selectedProducts = JSON.parse(selectedProductsStr);
        console.log('Parsed selected products:', selectedProducts.length);
      } catch (e) {
        console.error('Error parsing selected products:', e);
      }
    }
    
    // Handle attachments
    const files = formData.getAll('files') as File[];
    const attachments: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 0) { // Skip empty files
        attachments.push({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type || 'application/octet-stream',
        });
        console.log('Attachment added:', file.name, file.size);
      }
    }
    
    // Build HTML email body
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #124559;">New Product Enquiry Submission</h2>
        <table border="1" cellpadding="12" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>Full Name:</strong></td><td style="padding: 8px;">${fullName}</td></tr>
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>Company Name:</strong></td><td style="padding: 8px;">${companyName}</td></tr>
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>Phone:</strong></td><td style="padding: 8px;">${phone}</td></tr>
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>Email:</strong></td><td style="padding: 8px;">${email}</td></tr>
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>GST Number:</strong></td><td style="padding: 8px;">${gst}</td></tr>
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>Quantity:</strong></td><td style="padding: 8px;">${quantity}</td></tr>
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>Pincode:</strong></td><td style="padding: 8px;">${pincode}</td></tr>
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>Address:</strong></td><td style="padding: 8px;">${address}</td></tr>
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>Description/Requirements:</strong></td><td style="padding: 8px;">${description}</td></tr>
          <tr><td style="background: #f5f5f5; font-weight: bold; padding: 8px;"><strong>Order Notes:</strong></td><td style="padding: 8px;">${orderNotes}</td></tr>
        </table>
        
        ${selectedProducts.length > 0 ? `
          <h3 style="color: #124559; margin-top: 20px;">Selected Products (${selectedProducts.length})</h3>
          <ul style="padding-left: 20px;">
            ${selectedProducts.map((prod: any, index: number) => `
              <li style="margin-bottom: 10px;">
                <strong>${prod.name}</strong> - ${prod.currency || '₹'}${prod.price}<br>
                <small>Image Reference: ${prod.image}</small>
              </li>
            `).join('')}
          </ul>
        ` : '<p style="color: #666;"><em>No specific products selected.</em></p>'}
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          <strong>Submitted on:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}<br>
          <em>This is an automated message from your website enquiry form.</em>
        </p>
      </div>
    `;
    
    const mailOptions = {
      from: `"Gift Vibes Diaries" <${process.env.GMAIL_EMAIL}>`,  // Sender name
      to: process.env.GMAIL_EMAIL,  // Your inbox
      replyTo: email,  // Allow replies to customer
      subject: `New Product Enquiry: ${fullName} - ${selectedProducts.length > 0 ? `${selectedProducts.length} Products` : 'General Enquiry'}`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    
    console.log('Sending email with options:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasAttachments: attachments.length > 0,
      productsCount: selectedProducts.length
    });
    
    let info;
    try {
      // Try STARTTLS (587)
      info = await createTransporter({ port: 587, secure: false }).sendMail(mailOptions);
    } catch (firstErr: any) {
      console.error('First attempt (587/STARTTLS) failed:', firstErr?.message || firstErr);
      // Fallback to SSL (465)
      info = await createTransporter({ port: 465, secure: true }).sendMail(mailOptions);
    }
    console.log('Email sent successfully:', info.messageId);
    
    return NextResponse.json({ success: true, message: 'Enquiry sent successfully to our team!' });
  } catch (error: any) {
    const err = {
      message: error?.message,
      code: error?.code,
      response: error?.response,
    };
    console.error('Detailed Email Error:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to send enquiry.',
      error: err,
    }, { status: 500 });
  }
}

// Simple diagnostics endpoint (GET /api/enquiry)
export async function GET() {
  try {
    // Create a fresh transporter for diagnostics
    const t = createTransporter({ port: 587, secure: false });
    const verified = await new Promise<boolean>((resolve) => {
      t.verify((err) => resolve(!err));
    });
    return NextResponse.json({
      ok: true,
      env: {
        emailConfigured: !!process.env.GMAIL_EMAIL,
        passConfigured: !!process.env.GMAIL_APP_PASSWORD,
      },
      smtpVerified: verified,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 });
  }
}
