"use server";

import { serverClient } from "@/sanity/lib/serverClient";
import { mailOptions, transporter, autoReplyTransporter } from "../../config/nodemailer";

const CONTACT_MESSAGE_FIELDS: Record<string, string> = {
  name: "Name",
  email: "Email",
  subject: "Subject",
  message: "Message",
  phone: "Phone",
};

const generateEmailContent = (data: any) => {
  const stringData = Object.entries(data).reduce(
    (str, [key, val]) =>
      (str += `${CONTACT_MESSAGE_FIELDS[key] || key}: \n${val} \n \n`),
    ""
  );

  const htmlData = Object.entries(data).reduce((str, [key, val]) => {
     return (str += `<h3 class="form-heading" align="left">${CONTACT_MESSAGE_FIELDS[key] || key}</h3><p class="form-answer" align="left">${val}</p>`);
  }, "");

  return {
    text: stringData,
    html: `<!DOCTYPE html><html> <head> <title></title> <meta charset="utf-8"/> <meta name="viewport" content="width=device-width, initial-scale=1"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <style type="text/css"> body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}table{border-collapse: collapse !important;}body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}@media screen and (max-width: 525px){.wrapper{width: 100% !important; max-width: 100% !important;}.responsive-table{width: 100% !important;}.padding{padding: 10px 5% 15px 5% !important;}.section-padding{padding: 0 15px 50px 15px !important;}}.form-container{margin-bottom: 24px; padding: 20px; border: 1px dashed #ccc;}.form-heading{color: #2a2a2a; font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif; font-weight: 400; text-align: left; line-height: 20px; font-size: 18px; margin: 0 0 8px; padding: 0;}.form-answer{color: #2a2a2a; font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif; font-weight: 300; text-align: left; line-height: 20px; font-size: 16px; margin: 0 0 24px; padding: 0;}div[style*="margin: 16px 0;"]{margin: 0 !important;}</style> </head> <body style="margin: 0 !important; padding: 0 !important; background: #fff"> <div style=" display: none; font-size: 1px; color: #fefefe; line-height: 1px;  max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; " ></div><table border="0" cellpadding="0" cellspacing="0" width="100%"> <tr> <td bgcolor="#ffffff" align="center" style="padding: 10px 15px 30px 15px" class="section-padding" > <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px" class="responsive-table" > <tr> <td> <table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr> <td> <table width="100%" border="0" cellspacing="0" cellpadding="0" > <tr> <td style=" padding: 0 0 0 0; font-size: 16px; line-height: 25px; color: #232323; " class="padding message-content" > <h2>New Contact Message</h2> <div class="form-container">${htmlData}</div></td></tr></table> </td></tr></table> </td></tr></table> </td></tr></table> </body></html>`,
  };
};

const generateAutoResponseHtml = (name: string) => `
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    /* Reset & Base */
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #333; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; width: 100%; }

    /* Animation Keyframes */
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Container */
    .email-wrapper { width: 100%; background-color: #f3f4f6; padding: 40px 0; }
    .email-content { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); animation: fadeInUp 0.8s ease-out forwards; }

    /* Header */
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; color: #ffffff; animation: fadeInDown 0.8s ease-out forwards; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }

    /* Body */
    .body-content { padding: 40px 30px; text-align: left; }
    .greeting { font-size: 22px; color: #1f2937; margin-bottom: 15px; font-weight: 600; }
    .text { color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px; }

    /* Button */
    .btn-container { text-align: center; margin: 30px 0; font-size: 16px; font-weight: 600; color: #ffffff;  border-radius: 50px; border: 1px solid #f9fafb; }
    .btn { display: inline-block; font-size: 16px; font-weight: 600; color: #ffffff;  padding: 14px 32px; text-decoration: none; border-radius: 50px; transition: transform 0.2s; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }

    /* Divider */
    .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }

    /* Signature / Contact Info */
    .signature-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 15px; }
    .contact-list { list-style: none; padding: 0; margin: 0; }
    .contact-list li { margin-bottom: 8px; color: #4b5563; font-size: 15px; }
    .contact-list li strong { color: #111827; font-weight: 600; width: 80px; display: inline-block; }
    .contact-list a { color: #4f46e5; text-decoration: none; font-weight: 500; }

    /* Footer */
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6; }
    .footer p { margin: 0; color: #9ca3af; font-size: 13px; }

    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-content { width: 100% !important; border-radius: 0 !important; }
      .header { padding: 30px 20px; }
      .body-content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-content">
      <!-- Header Area -->
      <div class="header">
        <h1>Message Received!</h1>
        <p>Thanks for getting in touch, ${name}.</p>
      </div>

      <!-- Main Content -->
      <div class="body-content">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">
          Thank you for reaching out to me. I have received your message and wanted to let you know that I will get back to you as soon as possible, typically within 24 hours.
        </p>
        <p class="text">
          In the meantime, feel free to explore more of my work or connect with me on social media.
        </p>

        <div class="btn-container">
          <a href="https://mdabdurrahmansifat.vercel.app/" class="btn">View My Portfolio</a>
        </div>

        <div class="divider"></div>

        <!-- Contact Information Section -->
        <h3 class="signature-title">Contact Information:</h3>
        <ul class="contact-list">
          <li><strong>Phone:</strong> +8801521-788920</li>
          <li><strong>Email:</strong> <a href="mailto:mdabdurrahmansifat@gmail.com">mdabdurrahmansifat@gmail.com</a></li>
          <li><strong>Portfolio:</strong> <a href="https://mdabdurrahmansifat.vercel.app/">Md Abdur Rahman Sifat</a></li>
          <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/sifatmollah/">Md Abdur Rahman Sifat</a></li>
          <li><strong>Address:</strong> Dhaka, Bangladesh</li>
        </ul>

        <br>
        <p class="text" style="margin-bottom: 0;">
          Sincerely,<br>
          <strong style="color: #111827; font-size: 16px;">Md. Abdur Rahman Sifat</strong>
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Md. Abdur Rahman Sifat. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;


export async function submitContactForm(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    // Validate the required fields
    if (!name || !email || !message) {
      return {
        success: false,
        error: "Please fill in all required fields",
      };
    }

    // 1. Create the document in Sanity
    const result = await serverClient.create({
      _type: "contact",
      name,
      email,
      subject,
      message,
      submittedAt: new Date().toISOString(),
      status: "new",
    });

    // 2. Send Emails using Nodemailer
    const emailData = { name, email, subject, message };

    // Send admin notification
    const mailPromise = transporter.sendMail({
      ...mailOptions,
      ...generateEmailContent(emailData),
      subject: `New Contact Submission: ${subject || "No Subject"}`,
      replyTo: email,
    });

    // Send auto-reply
    const autoReplyPromise = autoReplyTransporter.sendMail({
        from: {
            name: "Md. Abdur Rahman Sifat",
            address: process.env.AUTO_REPLY_EMAIL as string
        },
        to: email,
        subject: `Re: ${subject || "Query"} - Received your message`,
        html: generateAutoResponseHtml(name),
    });

    await Promise.all([mailPromise, autoReplyPromise]);

    return {
      success: true,
      data: result,
      message: "Message sent successfully!",
    };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return {
      success: false,
      error: "Failed to submit the form. Please try again later.",
    };
  }
}
