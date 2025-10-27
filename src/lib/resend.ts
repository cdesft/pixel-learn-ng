import { RESEND_API_KEY } from './constants';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SocialDev Nigeria <onboarding@resend.dev>',
        to: [to],
        subject,
        html
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export function generateSchoolAdminWelcomeEmail(
  schoolName: string,
  adminEmail: string,
  tempPassword: string,
  schoolSlug: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
        .credentials { background: white; padding: 20px; border-left: 4px solid #4ECDC4; margin: 20px 0; }
        .button { display: inline-block; background: #4ECDC4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to SocialDev Nigeria!</h1>
        </div>
        <div class="content">
          <p>Hello School Administrator,</p>
          <p>Your school "<strong>${schoolName}</strong>" has been successfully registered on SocialDev Nigeria!</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Login URL:</strong> ${window.location.origin}/${schoolSlug}/admin/login</p>
            <p><strong>Email:</strong> ${adminEmail}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          
          <p>Please log in and complete your school setup to start managing students and parents.</p>
          
          <a href="${window.location.origin}/${schoolSlug}/admin/login" class="button">Login to Dashboard</a>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            For security reasons, you will be asked to change your password on first login.
          </p>
          
          <p style="margin-top: 20px;">Best regards,<br><strong>SocialDev Nigeria Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateParentWelcomeEmail(
  parentName: string,
  parentEmail: string,
  parentPassword: string,
  studentName: string,
  studentEmail: string,
  studentPassword: string,
  schoolName: string,
  schoolSlug: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
        .credentials { background: white; padding: 20px; border-left: 4px solid #4ECDC4; margin: 20px 0; }
        .trial-notice { background: #FFE66D; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #F39C12; }
        .button { display: inline-block; background: #4ECDC4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Welcome to SocialDev Nigeria!</h1>
        </div>
        <div class="content">
          <p>Hello ${parentName},</p>
          <p>Your child <strong>${studentName}</strong> has been enrolled at <strong>${schoolName}</strong> on SocialDev Nigeria!</p>
          
          <div class="credentials">
            <h3>🧑 Parent Login Credentials:</h3>
            <p><strong>Login URL:</strong> ${window.location.origin}/${schoolSlug}/parent/login</p>
            <p><strong>Email:</strong> ${parentEmail}</p>
            <p><strong>Password:</strong> ${parentPassword}</p>
          </div>
          
          <div class="credentials">
            <h3>👦 Student Login Credentials:</h3>
            <p><strong>Login URL:</strong> ${window.location.origin}/${schoolSlug}/pupil/login</p>
            <p><strong>Username:</strong> ${studentEmail}</p>
            <p><strong>Password:</strong> ${studentPassword}</p>
          </div>
          
          <div class="trial-notice">
            <h3>🎉 7-Day FREE TRIAL</h3>
            <p>Your child gets <strong>7 days of free access</strong> starting from their first login! No payment required to get started.</p>
          </div>
          
          <a href="${window.location.origin}/${schoolSlug}/parent/login" class="button">Login to Parent Dashboard</a>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            You can monitor your child's learning progress and manage subscriptions from your parent dashboard.
          </p>
          
          <p style="margin-top: 20px;">Best regards,<br><strong>${schoolName}</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
