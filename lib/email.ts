import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function fromAddress() {
  const from = process.env.EMAIL_FROM ?? "Job Tracker Hub <onboarding@resend.dev>";
  const address = from.match(/<([^>]+)>/)?.[1] ?? from;
  const domain = address.split("@")[1]?.toLowerCase() ?? "";
  if (["gmail.com", "googlemail.com", "yahoo.com", "outlook.com", "hotmail.com"].includes(domain)) {
    throw new Error(
      `EMAIL_FROM uses ${domain}, which Resend cannot send from. Use beth.t@example.com for tests, or a domain verified at resend.com/domains.`,
    );
  }
  return from;
}

function appName() {
  return "Job Tracker Hub";
}

export async function sendVerificationCodeEmail(email: string, code: string) {
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: email,
    subject: `Your ${appName()} verification code`,
    html: `
      <p>Your verification code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
      <p>This code expires in 15 minutes.</p>
    `,
  });
  if (error) throw new Error(error.message);
}

export async function sendPasswordResetCodeEmail(email: string, code: string) {
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: email,
    subject: `Your ${appName()} password reset code`,
    html: `
      <p>Your password reset code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
      <p>This code expires in 15 minutes. If you did not request it, you can ignore this email.</p>
    `,
  });
  if (error) throw new Error(error.message);
}

export async function sendRecruiterUnlinkedEmail(
  email: string,
  applicantName: string,
  recruiterName: string,
) {
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: email,
    subject: `Your recruiter connection on ${appName()} has ended`,
    html: `
      <p>Hi ${applicantName},</p>
      <p>${recruiterName} has ended the recruiter relationship on ${appName()}.</p>
      <p>They will no longer see the applications you log. You can link a different recruiter from your profile anytime.</p>
    `,
  });
  if (error) throw new Error(error.message);
}
