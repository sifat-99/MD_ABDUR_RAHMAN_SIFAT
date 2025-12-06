
import { mailOptions, transporter } from "../../../../config/nodemailer";
import { NextResponse } from "next/server";

const CONTACT_MESSAGE_FIELDS: Record<string, string> = {
  name: "Name",
  email: "Email",
  subject: "Subject",
  message: "Message",
  phone: "Phone", // Added based on context if needed, though not in original fields list but good to have type safety
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

export async function POST(req: Request) {
  const data = await req.json();

  if (!data.name || !data.email || !data.subject || !data.message) {
    return NextResponse.json({ message: "Invalid input" }, { status: 422 });
  }

  try {
    await transporter.sendMail({
      ...mailOptions,
      ...generateEmailContent(data),
      subject: data.subject,
      replyTo: data.email,
    });

    // Send auto-reply
    /* Note: Ideally we should await this or fire and forget properly.
       Original code awaited the first email then sent the second in .then().
       We can await both sequentially or parallel. */

    await transporter.sendMail({
        from: mailOptions.from,
        html: `<!DOCTYPE html>
        <html>
        <head>
            <title></title>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
            <style type="text/css">
                body, table, td, a {
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
                table {
                    border-collapse: collapse !important;
                }
                body {
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                }
                @media screen and (max-width: 525px) {
                    .wrapper {
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .responsive-table {
                        width: 100% !important;
                    }
                    .padding {
                        padding: 10px 5% 15px 5% !important;
                    }
                    .section-padding {
                        padding: 0 15px 50px 15px !important;
                    }
                }
                .form-container {
                    margin-bottom: 24px;
                    padding: 20px;
                    border: 1px dashed #ccc;
                }
                .form-heading {
                    color: #2a2a2a;
                    font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
                    font-weight: 400;
                    text-align: left;
                    line-height: 20px;
                    font-size: 18px;
                    margin: 0 0 8px;
                    padding: 0;
                }
                .form-answer {
                    color: #2a2a2a;
                    font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
                    font-weight: 300;
                    text-align: left;
                    line-height: 20px;
                    font-size: 16px;
                    margin: 0 0 24px;
                    padding: 0;
                }
                div[style*="margin: 16px 0;"] {
                    margin: 0 !important;
                }
            </style>
        </head>
        <body style="margin: 0 !important; padding: 0 !important; background: #fff">
        <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"></div>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff" align="center" style="padding: 10px 15px 30px 15px" class="section-padding">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px" class="responsive-table">
                        <tr>
                            <td>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td style="padding: 0 0 0 0; font-size: 16px; line-height: 25px; color: #232323;" class="padding message-content">
                                                        <h2>Dear ${data.name},</h2>
                                                        <p>Thank you for contacting with me. I am very glad that you contact with me. </p>
                                                        <p style="font-size:20px" >I wil respond as soon as possible. Thank you.</p>
                                                        <p>Best regards,</p>
                                                        <p>Md: Abdur Rahman Sifat<br/>madabdurrahmansifat@gmail.com<br/>+8801521788920 (Personal)</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        </body>
        </html>
        `,
        subject: data.subject,
        to: data.email,
    });

    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred while sending the message" }, { status: 500 });
  }
}
