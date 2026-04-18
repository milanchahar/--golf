import { Resend } from 'resend';
import * as t from '../emails/templates';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@golfheroes.com';

const safeSend = async (params: any) => {
  if (!resend) {
    console.warn("RESEND_API_KEY NOT CONFIGURED. MOCKING EMAIL SEND.", params.subject, params.to);
    return;
  }
  try {
    const { data, error } = await resend.emails.send(params);
    if (error) console.error("Resend Error:", error);
    return data;
  } catch (err) {
    console.error("Resend Exception:", err);
  }
};

export async function sendWelcomeEmail(to: string, name: string) {
  await safeSend({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to Golf Heroes!",
    html: t.welcomeEmailHTML(name)
  });
}

export async function sendSubscriptionConfirmEmail(to: string, name: string, plan: string, renewalDate: string) {
  await safeSend({
    from: FROM_EMAIL,
    to,
    subject: "Subscription Activated",
    html: t.subscriptionConfirmedHTML(name, plan, renewalDate)
  });
}

export async function sendDrawResultEmail(to: string, name: string, drawMonth: string, matched: number, prizeAmount?: number) {
  await safeSend({
    from: FROM_EMAIL,
    to,
    subject: `Results are in for the ${drawMonth} Draw!`,
    html: t.drawResultHTML(name, drawMonth, matched, prizeAmount)
  });
}

export async function sendWinnerNotificationEmail(to: string, name: string, prizeTier: string, amount: number) {
  await safeSend({
    from: FROM_EMAIL,
    to,
    subject: "🎉 You've won the Golf Heroes Jackpot!",
    html: t.winnerNotificationHTML(name, prizeTier, amount)
  });
}

export async function sendVerificationApprovedEmail(to: string, name: string, amount: number) {
  await safeSend({
    from: FROM_EMAIL,
    to,
    subject: "Validation Approved!",
    html: t.verificationApprovedHTML(name, amount)
  });
}

export async function sendVerificationRejectedEmail(to: string, name: string, reason: string) {
  await safeSend({
    from: FROM_EMAIL,
    to,
    subject: "Draw Validation Issue",
    html: t.verificationRejectedHTML(name, reason)
  });
}

export async function sendPaymentCompletedEmail(to: string, name: string, amount: number, reference: string) {
  await safeSend({
    from: FROM_EMAIL,
    to,
    subject: "Your Winning Disbursment",
    html: t.paymentCompletedHTML(name, amount, reference)
  });
}

export async function sendContactFormEmail(from: string, name: string, message: string) {
  await safeSend({
    from: process.env.ADMIN_EMAIL || FROM_EMAIL,
    to: process.env.ADMIN_EMAIL || 'admin@golfheroes.com',
    subject: `Contact Request: ${name}`,
    html: t.contactFormHTML(from, name, message),
    reply_to: from
  });
}
