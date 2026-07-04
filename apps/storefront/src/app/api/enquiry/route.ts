import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import nodemailer from 'nodemailer';

const createTransporter = async (opts?: { secure?: boolean; port?: number }) => {
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
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Diary Enquiry</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .header {
                background-color: #f2f2f2;
                padding: 10px;
                text-align: center;
                border-bottom: 1px solid #ddd;
            }
            .header h2 {
                margin: 0;
                color: #124559;
            }
            .content {
                padding: 20px 0;
            }
            .content-table {
                width: 100%;
                border-collapse: collapse;
            }
            .content-table th, .content-table td {
                padding: 10px;
                border: 1px solid #ddd;
                text-align: left;
            }
            .content-table th {
                background-color: #f8f8f8;
                font-weight: bold;
                width: 30%;
            }
            .product-list {
                list-style-type: none;
                padding: 0;
            }
            .product-list li {
                margin-bottom: 10px;
                padding: 10px;
                border: 1px solid #eee;
                border-radius: 4px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Diary Enquiry</h2>
            </div>
            <div class="content">
                <table class="content-table">
                    <tr><th>Full Name</th><td>${fullName}</td></tr>
                    <tr><th>Company Name</th><td>${companyName}</td></tr>
                    <tr><th>Phone</th><td>${phone}</td></tr>
                    <tr><th>Email</th><td>${email}</td></tr>
                    <tr><th>GST Number</th><td>${gst}</td></tr>
                    <tr><th>Quantity</th><td>${quantity}</td></tr>
                    <tr><th>Pincode</th><td>${pincode}</td></tr>
                    <tr><th>Address</th><td>${address}</td></tr>
                    <tr><th>Description</th><td>${description}</td></tr>
                    <tr><th>Order Notes</th><td>${orderNotes}</td></tr>
                </table>
                
                ${selectedProducts.length > 0 ? `
                    <h3 style="color: #124559; margin-top: 20px;">Selected Products (${selectedProducts.length})</h3>
                    <ul class="product-list">
                        ${selectedProducts.map((prod: any) => `
                            <li>
                                <strong>${prod.name}</strong> - ${prod.currency || '₹'}${prod.price}<br>
                                <small>Image Reference: ${prod.image}</small>
                            </li>
                        `).join('')}
                    </ul>
                ` : '<p><em>No specific products selected.</em></p>'}
            </div>
            <div class="footer">
                <p>Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                <p>This is an automated message from your website enquiry form.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const primaryRecipient = process.env.ENQUIRY_RECIPIENT_EMAIL || process.env.GMAIL_EMAIL;
    const forwardRecipient = process.env.GIFT_VIBES_FORWARD_EMAIL || "giftvibes.in@gmail.com";
    const recipientList = Array.from(new Set([forwardRecipient, primaryRecipient].filter(Boolean))).join(",");

    const mailOptions = {
      from: `"Gift Vibes Diaries" <${process.env.GMAIL_EMAIL}>`,
      to: recipientList,
      replyTo: email,  // Allow replies to customer
      subject: `New Diary Enquiry: ${fullName} - ${selectedProducts.length > 0 ? `${selectedProducts.length} Products` : 'General Enquiry'}`,
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
      info = await (await createTransporter({ port: 587, secure: false })).sendMail(mailOptions);
    } catch (firstErr: any) {
      console.error('First attempt (587/STARTTLS) failed:', firstErr?.message || firstErr);
      // Fallback to SSL (465)
      info = await (await createTransporter({ port: 465, secure: true })).sendMail(mailOptions);
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
    const t = await createTransporter({ port: 587, secure: false });
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
