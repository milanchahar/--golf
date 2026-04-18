export function welcomeEmailHTML(name: string) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F172A; color: #f8fafc; padding: 40px 20px;">
      <h2 style="color: #60A5FA;">Welcome to Golf Heroes, ${name}!</h2>
      <p style="font-size: 16px;">We're thrilled to have you join our community. You can now subscribe to start entering your golf scores and compete in our monthly draws while simultaneously supporting great causes.</p>
      <a href="https://your-vercel-url.vercel.app/dashboard" style="display: inline-block; background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Go to Dashboard</a>
      <p style="margin-top: 40px; font-size: 12px; color: #64748b;">© 2026 Golf Heroes.</p>
    </div>
  `;
}

export function subscriptionConfirmedHTML(name: string, plan: string, renewalDate: string) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F172A; color: #f8fafc; padding: 40px 20px;">
      <h2 style="color: #10B981;">Subscription Confirmed!</h2>
      <p style="font-size: 16px;">Hi ${name}, your ${plan} subscription to Golf Heroes is active. 10% of your contribution is mapped immediately to your chosen charity.</p>
      <div style="background-color: #1E293B; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin:0; font-weight:bold;">Next Renewal: ${renewalDate}</p>
      </div>
      <a href="https://your-vercel-url.vercel.app/dashboard/scores" style="display: inline-block; background-color: #10B981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log Your First Score</a>
    </div>
  `;
}

export function drawResultHTML(name: string, drawMonth: string, matched: number, prizeAmount?: number) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F172A; color: #f8fafc; padding: 40px 20px;">
      <h2 style="color: #F59E0B;">The ${drawMonth} Draw has been published!</h2>
      <p style="font-size: 16px;">Hi ${name}, the results are in.</p>
      <p style="font-size: 16px;">You matched <strong>${matched}</strong> numbers this month.</p>
      ${prizeAmount ? `<p style="font-size: 18px; color: #10B981; font-weight: bold;">Congratulations! You won €${prizeAmount}.</p>` : `<p>Better luck next month!</p>`}
      <a href="https://your-vercel-url.vercel.app/dashboard/draws" style="display: inline-block; background-color: #F59E0B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">View Full Results</a>
    </div>
  `;
}

export function winnerNotificationHTML(name: string, prizeTier: string, amount: number) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F172A; color: #f8fafc; padding: 40px 20px;">
      <h2 style="color: #10B981;">🏆 You're a Winner!</h2>
      <p style="font-size: 16px;">Incredible news ${name}, you successfully hit the ${prizeTier}-match tier in our latest draw, earning <strong>€${amount}</strong>!</p>
      <p style="font-size: 16px;">To claim your disbursement, you must log in and submit photographic evidence of your scorecard for validation.</p>
      <a href="https://your-vercel-url.vercel.app/dashboard/winnings" style="display: inline-block; background-color: #10B981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Claim Prize Now</a>
    </div>
  `;
}

export function verificationApprovedHTML(name: string, amount: number) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F172A; color: #f8fafc; padding: 40px 20px;">
      <h2 style="color: #10B981;">Validation Passed!</h2>
      <p style="font-size: 16px;">Hi ${name}, our administrative team has approved your scorecard evidence. Your €${amount} disbursement is now being processed.</p>
    </div>
  `;
}

export function verificationRejectedHTML(name: string, reason: string) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F172A; color: #f8fafc; padding: 40px 20px;">
      <h2 style="color: #EF4444;">Verification Issue</h2>
      <p style="font-size: 16px;">Hi ${name}, unfortunately, we could not validate your recent scorecard upload. Our admin noted:</p>
      <div style="background-color: #1E293B; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
        <p style="margin:0; font-family: monospace;">${reason}</p>
      </div>
      <p>Please contact support if you believe this is in error.</p>
    </div>
  `;
}

export function paymentCompletedHTML(name: string, amount: number, reference: string) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F172A; color: #f8fafc; padding: 40px 20px;">
      <h2 style="color: #3B82F6;">Payment Dispatched</h2>
      <p style="font-size: 16px;">Hi ${name}, your €${amount} winning has been officially transferred to your requested destination.</p>
      <p><strong>Reference Code:</strong> ${reference}</p>
      <p>Thank you for contributing to the Golf Heroes community!</p>
    </div>
  `;
}

export function contactFormHTML(from: string, name: string, message: string) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Contact Request</h2>
      <p><strong>From:</strong> ${name} &lt;${from}&gt;</p>
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6;">
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    </div>
  `;
}
