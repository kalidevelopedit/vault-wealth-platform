const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const FROM_EMAIL = "noreply@vaultwealth.com";
const FROM_NAME = "Vault Wealth";

interface EmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!BREVO_API_KEY) {
    console.warn("[email] BREVO_API_KEY not set — skipping email send");
    return;
  }

  const body = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: payload.to,
    subject: payload.subject,
    htmlContent: payload.htmlContent,
    ...(payload.textContent ? { textContent: payload.textContent } : {}),
  };

  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[email] Brevo API error ${res.status}: ${errText}`);
    } else {
      console.info(`[email] Email sent to ${payload.to.map(t => t.email).join(", ")}: "${payload.subject}"`);
    }
  } catch (err) {
    console.error("[email] Failed to send email:", err);
  }
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vault Wealth</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f6f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e6e8eb; }
    .header { background: #0d1520; padding: 28px 32px; text-align: center; }
    .header img { height: 32px; }
    .header-wordmark { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header-sub { color: #8b9aae; font-size: 12px; margin-top: 2px; letter-spacing: 1px; text-transform: uppercase; }
    .body { padding: 36px 32px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #0d1520; }
    p { font-size: 15px; line-height: 1.7; margin: 0 0 16px; color: #3d4a5c; }
    .btn { display: inline-block; background: #0d1520; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 8px 0 16px; }
    .divider { border: none; border-top: 1px solid #e6e8eb; margin: 24px 0; }
    .info-box { background: #f5f6f7; border: 1px solid #e6e8eb; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
    .info-box p { margin: 4px 0; font-size: 14px; }
    .label { font-weight: 600; color: #0d1520; }
    .footer { background: #f5f6f7; padding: 20px 32px; text-align: center; border-top: 1px solid #e6e8eb; }
    .footer p { font-size: 12px; color: #8b9aae; margin: 4px 0; }
    .footer a { color: #0d1520; text-decoration: none; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .badge-green { background: #e8f5e9; color: #2e7d32; }
    .badge-red { background: #ffebee; color: #c62828; }
    .badge-yellow { background: #fff8e1; color: #f57f17; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-wordmark">VAULT WEALTH</div>
      <div class="header-sub">Institutional Investment Platform</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Vault Wealth · INT Brokers LLC</p>
      <p>This email was sent to you because you have an account with Vault Wealth.</p>
      <p><a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a> · <a href="#">Terms of Service</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendWelcomeEmail(user: { email: string; fullName: string }): Promise<void> {
  const html = baseLayout(`
    <h1>Welcome to Vault Wealth, ${user.fullName.split(" ")[0]}!</h1>
    <p>Your account has been created successfully. You're now part of an elite investment platform trusted by institutional investors worldwide.</p>
    <p>To start investing, you'll need to complete your identity verification (KYC) process. It takes just a few minutes.</p>
    <a class="btn" href="https://vaultwealth.com/onboarding">Complete Verification →</a>
    <hr class="divider" />
    <p><strong>What's next?</strong></p>
    <div class="info-box">
      <p>✅ &nbsp;<span class="label">Step 1:</span> Account created (done!)</p>
      <p>⏳ &nbsp;<span class="label">Step 2:</span> Set your investment preferences</p>
      <p>⏳ &nbsp;<span class="label">Step 3:</span> Verify your identity</p>
      <p>⏳ &nbsp;<span class="label">Step 4:</span> Make your first deposit & trade</p>
    </div>
    <p>If you have any questions, our support team is available 24/7.</p>
  `);

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: "Welcome to Vault Wealth — Let's get started",
    htmlContent: html,
    textContent: `Welcome to Vault Wealth, ${user.fullName}! Your account has been created. Complete your verification at https://vaultwealth.com/onboarding`,
  });
}

export async function sendKycSubmittedEmail(user: { email: string; fullName: string }): Promise<void> {
  const html = baseLayout(`
    <h1>KYC Submitted — Under Review</h1>
    <p>Hi ${user.fullName.split(" ")[0]},</p>
    <p>We've received your identity verification documents. Our compliance team will review your submission and notify you of the outcome within <strong>1–3 business days</strong>.</p>
    <div class="info-box">
      <p><span class="label">Status:</span> &nbsp;<span class="badge badge-yellow">Under Review</span></p>
      <p style="margin-top:10px;"><span class="label">What happens next:</span></p>
      <p>Our team will review your documents and liveness verification. You'll receive an email once the review is complete.</p>
    </div>
    <p>In the meantime, you can explore our platform and prepare your investment strategy.</p>
    <a class="btn" href="https://vaultwealth.com/dashboard">Go to Dashboard →</a>
    <hr class="divider" />
    <p style="font-size:13px; color:#8b9aae;">If you have any questions, contact support at support@vaultwealth.com</p>
  `);

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: "Your KYC documents are under review",
    htmlContent: html,
    textContent: `Hi ${user.fullName}, we've received your KYC documents. Our team will review them within 1-3 business days.`,
  });
}

export async function sendKycApprovedEmail(user: { email: string; fullName: string }): Promise<void> {
  const html = baseLayout(`
    <h1>🎉 Identity Verified — Account Approved!</h1>
    <p>Hi ${user.fullName.split(" ")[0]},</p>
    <p>Congratulations! Your identity has been successfully verified. Your Vault Wealth account is now fully active and ready to use.</p>
    <div class="info-box">
      <p><span class="label">Account Status:</span> &nbsp;<span class="badge badge-green">Fully Verified</span></p>
      <p style="margin-top:10px;">You now have full access to all platform features including trading, deposits, withdrawals, and portfolio management.</p>
    </div>
    <p><strong>What you can do now:</strong></p>
    <div class="info-box">
      <p>💰 &nbsp;Make your first deposit</p>
      <p>📈 &nbsp;Trade stocks, crypto, commodities & more</p>
      <p>🌍 &nbsp;Access global markets 24/7</p>
      <p>📊 &nbsp;Track your portfolio performance</p>
    </div>
    <a class="btn" href="https://vaultwealth.com/dashboard">Start Investing →</a>
    <hr class="divider" />
    <p style="font-size:13px; color:#8b9aae;">Welcome to the Vault Wealth family. If you need assistance, we're always here to help.</p>
  `);

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: "✅ Your Vault Wealth account is verified and ready",
    htmlContent: html,
    textContent: `Hi ${user.fullName}, your identity has been verified! Your account is now fully active. Log in at https://vaultwealth.com/dashboard`,
  });
}

export async function sendKycRejectedEmail(user: { email: string; fullName: string }, notes?: string): Promise<void> {
  const html = baseLayout(`
    <h1>Action Required — Verification Unsuccessful</h1>
    <p>Hi ${user.fullName.split(" ")[0]},</p>
    <p>We were unable to verify your identity with the documents provided. Please review the information below and resubmit your verification.</p>
    <div class="info-box">
      <p><span class="label">Status:</span> &nbsp;<span class="badge badge-red">Verification Failed</span></p>
      ${notes ? `<p style="margin-top:10px;"><span class="label">Reason:</span> ${notes}</p>` : ""}
    </div>
    <p><strong>Common reasons for rejection:</strong></p>
    <div class="info-box">
      <p>📷 &nbsp;Document images were blurry or poorly lit</p>
      <p>⏰ &nbsp;Expired identity document</p>
      <p>✂️ &nbsp;Document was cropped or partially visible</p>
      <p>🔍 &nbsp;Name or details didn't match the registration</p>
    </div>
    <p>Please log in and resubmit with clear, valid documents. Our team will review your new submission promptly.</p>
    <a class="btn" href="https://vaultwealth.com/onboarding">Resubmit Documents →</a>
    <hr class="divider" />
    <p style="font-size:13px; color:#8b9aae;">If you believe this is an error, please contact support@vaultwealth.com</p>
  `);

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: "Action Required: Identity verification unsuccessful",
    htmlContent: html,
    textContent: `Hi ${user.fullName}, your KYC verification was unsuccessful. Please log in and resubmit your documents at https://vaultwealth.com/onboarding`,
  });
}

export async function sendDepositConfirmationEmail(user: { email: string; fullName: string }, amount: number): Promise<void> {
  const formattedAmount = amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const html = baseLayout(`
    <h1>Deposit Confirmed</h1>
    <p>Hi ${user.fullName.split(" ")[0]},</p>
    <p>Your deposit has been successfully processed and credited to your account.</p>
    <div class="info-box">
      <p><span class="label">Amount:</span> ${formattedAmount}</p>
      <p><span class="label">Status:</span> &nbsp;<span class="badge badge-green">Completed</span></p>
      <p><span class="label">Date:</span> ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    <p>Your funds are now available for trading. Start exploring our markets!</p>
    <a class="btn" href="https://vaultwealth.com/dashboard/trade">Trade Now →</a>
    <hr class="divider" />
    <p style="font-size:13px; color:#8b9aae;">If you did not make this deposit, please contact us immediately at support@vaultwealth.com</p>
  `);

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: `Deposit of ${formattedAmount} confirmed`,
    htmlContent: html,
    textContent: `Hi ${user.fullName}, your deposit of ${formattedAmount} has been confirmed and is ready to trade.`,
  });
}

export async function sendWithdrawalConfirmationEmail(user: { email: string; fullName: string }, amount: number): Promise<void> {
  const formattedAmount = amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const html = baseLayout(`
    <h1>Withdrawal Initiated</h1>
    <p>Hi ${user.fullName.split(" ")[0]},</p>
    <p>Your withdrawal request has been processed successfully.</p>
    <div class="info-box">
      <p><span class="label">Amount:</span> ${formattedAmount}</p>
      <p><span class="label">Status:</span> &nbsp;<span class="badge badge-yellow">Processing</span></p>
      <p><span class="label">Date:</span> ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      <p><span class="label">Expected Arrival:</span> 1–3 business days</p>
    </div>
    <p>The funds will be transferred to your linked bank account. You'll receive another confirmation once the transfer is complete.</p>
    <a class="btn" href="https://vaultwealth.com/dashboard/transactions">View Transactions →</a>
    <hr class="divider" />
    <p style="font-size:13px; color:#8b9aae;">If you did not initiate this withdrawal, contact us immediately at support@vaultwealth.com</p>
  `);

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: `Withdrawal of ${formattedAmount} initiated`,
    htmlContent: html,
    textContent: `Hi ${user.fullName}, your withdrawal of ${formattedAmount} has been initiated and will arrive in 1-3 business days.`,
  });
}

export async function sendTradeConfirmationEmail(
  user: { email: string; fullName: string },
  trade: { type: "buy" | "sell"; symbol: string; name: string; quantity: number; price: number; total: number }
): Promise<void> {
  const formatCurrency = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const isBuy = trade.type === "buy";
  const actionLabel = isBuy ? "Purchase" : "Sale";
  const html = baseLayout(`
    <h1>Trade ${actionLabel} Executed</h1>
    <p>Hi ${user.fullName.split(" ")[0]},</p>
    <p>Your ${trade.type} order has been executed successfully.</p>
    <div class="info-box">
      <p><span class="label">Action:</span> &nbsp;<span class="badge ${isBuy ? "badge-green" : "badge-red"}">${isBuy ? "BUY" : "SELL"}</span></p>
      <p style="margin-top:8px;"><span class="label">Asset:</span> ${trade.name} (${trade.symbol})</p>
      <p><span class="label">Quantity:</span> ${trade.quantity.toFixed(4)} ${trade.symbol}</p>
      <p><span class="label">Price per unit:</span> ${formatCurrency(trade.price)}</p>
      <p><span class="label">Total ${isBuy ? "Cost" : "Proceeds"}:</span> ${formatCurrency(trade.total)}</p>
      <p><span class="label">Status:</span> &nbsp;<span class="badge badge-green">Completed</span></p>
      <p><span class="label">Date:</span> ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    <a class="btn" href="https://vaultwealth.com/dashboard/portfolio">View Portfolio →</a>
    <hr class="divider" />
    <p style="font-size:13px; color:#8b9aae;">Trade confirmations are provided for record-keeping purposes. Past performance is not indicative of future results.</p>
  `);

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: `Trade Confirmed: ${isBuy ? "Bought" : "Sold"} ${trade.quantity.toFixed(4)} ${trade.symbol}`,
    htmlContent: html,
    textContent: `Hi ${user.fullName}, your ${trade.type} order for ${trade.quantity.toFixed(4)} ${trade.symbol} at ${formatCurrency(trade.price)} has been executed.`,
  });
}
