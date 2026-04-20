const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MANDRILL_API_URL = "https://mandrillapp.com/api/1.0/messages/send.json";

const FROM_EMAIL = "support@intbrokers.app";
const FROM_NAME = "Vault Wealth";

interface EmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!MAILCHIMP_API_KEY) {
    console.warn("[email] MAILCHIMP_API_KEY not set — skipping email send");
    return;
  }

  const body = {
    key: MAILCHIMP_API_KEY,
    message: {
      html: payload.htmlContent,
      text: payload.textContent ?? "",
      subject: payload.subject,
      from_email: FROM_EMAIL,
      from_name: FROM_NAME,
      to: payload.to.map(r => ({ email: r.email, name: r.name ?? r.email, type: "to" })),
      important: false,
      track_opens: true,
      track_clicks: true,
      auto_text: false,
    },
  };

  try {
    const res = await fetch(MANDRILL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json() as any;

    if (!res.ok) {
      console.error(`[email] Mandrill API error ${res.status}:`, json);
      return;
    }

    const result = Array.isArray(json) ? json[0] : json;
    if (result?.status === "sent" || result?.status === "queued") {
      console.info(`[email] Email sent to ${payload.to.map(t => t.email).join(", ")}: "${payload.subject}" (${result.status})`);
    } else {
      console.warn(`[email] Mandrill unexpected status for "${payload.subject}":`, result);
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

const LOGO_URL = "https://20c145d0-7ea9-42f0-b115-f223a4c4ea88-00-2rfqdxecvl3ty.kirk.replit.dev/investment-platform/logo-dark.png";

export async function sendApplicationReceivedEmail(user: { email: string; fullName: string; applicationNumber: string }): Promise<void> {
  const firstName = user.fullName.split(" ")[0];
  const submittedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const submittedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Received — Vault Wealth</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e5ea;">

          <!-- Header -->
          <tr>
            <td style="background:#0d1520;padding:32px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="${LOGO_URL}" alt="Vault Wealth" height="34" style="display:block;height:34px;" />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="color:#8b9aae;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Institutional Investment</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background:#0a3d2e;padding:18px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block;width:8px;height:8px;background:#22c55e;border-radius:50%;margin-right:10px;vertical-align:middle;"></span>
                    <span style="color:#bbf7d0;font-size:13px;font-weight:600;letter-spacing:0.3px;vertical-align:middle;">Application Successfully Received</span>
                  </td>
                  <td align="right">
                    <span style="color:#86efac;font-size:12px;font-weight:500;">Ref: ${user.applicationNumber}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <p style="margin:0 0 6px;font-size:13px;color:#8b9aae;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Dear ${firstName},</p>
              <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#0d1520;line-height:1.25;letter-spacing:-0.5px;">Your application has<br/>been received.</h1>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#4a5568;">Thank you for applying to open an account with <strong>Vault Wealth</strong>. We have received all your submitted materials and our compliance team has begun the review process.</p>

              <!-- Application Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #e2e5ea;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px 12px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8b9aae;">Application Summary</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #e2e5ea;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#8b9aae;font-weight:500;width:45%;">Applicant Name</td>
                              <td style="font-size:13px;color:#0d1520;font-weight:600;text-align:right;">${user.fullName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #e2e5ea;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#8b9aae;font-weight:500;width:45%;">Application Number</td>
                              <td style="font-size:13px;color:#0d1520;font-weight:700;text-align:right;font-family:monospace;">${user.applicationNumber}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #e2e5ea;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#8b9aae;font-weight:500;width:45%;">Submission Date</td>
                              <td style="font-size:13px;color:#0d1520;font-weight:500;text-align:right;">${submittedDate}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #e2e5ea;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#8b9aae;font-weight:500;width:45%;">Submission Time</td>
                              <td style="font-size:13px;color:#0d1520;font-weight:500;text-align:right;">${submittedTime}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #e2e5ea;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#8b9aae;font-weight:500;width:45%;">Review Timeline</td>
                              <td style="font-size:13px;color:#0d1520;font-weight:500;text-align:right;">1–3 business days</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #e2e5ea;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#8b9aae;font-weight:500;width:45%;">Status</td>
                              <td style="text-align:right;">
                                <span style="display:inline-block;background:#fef9ec;color:#b45309;font-size:11px;font-weight:700;letter-spacing:0.5px;padding:3px 10px;border-radius:20px;border:1px solid #fde68a;">UNDER REVIEW</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What Happens Next -->
              <p style="margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:0.5px;color:#0d1520;text-transform:uppercase;">What happens next</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #e2e5ea;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px;">
                          <span style="display:inline-block;width:20px;height:20px;background:#0d1520;border-radius:50%;text-align:center;line-height:20px;font-size:10px;font-weight:700;color:#ffffff;">1</span>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0d1520;">Document Review</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Our compliance team verifies your submitted identity documents against global databases.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #e2e5ea;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px;">
                          <span style="display:inline-block;width:20px;height:20px;background:#0d1520;border-radius:50%;text-align:center;line-height:20px;font-size:10px;font-weight:700;color:#ffffff;">2</span>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0d1520;">Background & AML Checks</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Standard anti-money laundering and regulatory checks are performed in accordance with applicable laws.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #e2e5ea;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px;">
                          <span style="display:inline-block;width:20px;height:20px;background:#0d1520;border-radius:50%;text-align:center;line-height:20px;font-size:10px;font-weight:700;color:#ffffff;">3</span>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0d1520;">Account Activation</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Once approved, you'll receive a confirmation email and your account will be fully activated for trading.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="https://vaultwealth.com/dashboard" style="display:inline-block;background:#0d1520;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.3px;">Track Your Application</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">If you have any questions about your application, please quote your application number <strong style="color:#0d1520;font-family:monospace;">${user.applicationNumber}</strong> when contacting support at <a href="mailto:support@vaultwealth.com" style="color:#0d1520;font-weight:600;text-decoration:none;">support@vaultwealth.com</a>.</p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e5ea;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:12px;color:#8b9aae;line-height:1.6;">
                      <strong style="color:#0d1520;">Vault Wealth</strong> &nbsp;·&nbsp; INT Brokers LLC<br/>
                      Regulated institutional investment platform
                    </p>
                    <p style="margin:0;font-size:11px;color:#b0bac6;line-height:1.6;">
                      This email was sent to ${user.email} because you submitted an application with Vault Wealth.
                      &nbsp;<a href="#" style="color:#8b9aae;text-decoration:underline;">Unsubscribe</a>
                      &nbsp;·&nbsp;<a href="#" style="color:#8b9aae;text-decoration:underline;">Privacy Policy</a>
                    </p>
                  </td>
                  <td align="right" style="vertical-align:top;white-space:nowrap;">
                    <p style="margin:0;font-size:11px;color:#b0bac6;">© ${new Date().getFullYear()} Vault Wealth</p>
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
</html>`;

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: `Application Received — Ref: ${user.applicationNumber}`,
    htmlContent: html,
    textContent: `Dear ${user.fullName}, your application (Ref: ${user.applicationNumber}) has been received and is under review. Our team will respond within 1-3 business days.`,
  });
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

export async function sendAccountActivatedEmail(user: { email: string; fullName: string; tempPassword: string }): Promise<void> {
  const firstName = user.fullName.split(" ")[0];
  const html = baseLayout(`
    <h1>Your Account Has Been Activated</h1>
    <p>Hi ${firstName},</p>
    <p>Great news! Your identity has been verified and your <strong>Vault Wealth</strong> account is now fully activated. You can now log in and start investing.</p>
    <div class="info-box">
      <p><span class="label">Email:</span> &nbsp;${user.email}</p>
      <p style="margin-top:8px;"><span class="label">Temporary Password:</span></p>
      <p style="font-size:22px; font-family:monospace; font-weight:900; color:#0d1520; letter-spacing:0.2em; margin:8px 0;">${user.tempPassword}</p>
    </div>
    <p><strong>Important:</strong> When you log in for the first time, you will be asked to create a secure 6-digit passcode. This passcode will be required every time you sign in.</p>
    <a class="btn" href="https://vaultwealth.com/login">Log In to Your Account →</a>
    <hr class="divider" />
    <p style="font-size:12px; color:#8b9aae;">For security reasons, please do not share your temporary password with anyone. Change your passcode immediately after your first login. If you did not request this, contact us at support@vaultwealth.com</p>
  `);

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: "Your Vault Wealth account is activated — login details inside",
    htmlContent: html,
    textContent: `Hi ${firstName}, your Vault Wealth account has been activated. Your temporary password is: ${user.tempPassword}. Please log in and set your 6-digit passcode.`,
  });
}

export async function sendForgotPinEmail(user: { email: string; fullName: string; tempPassword: string }): Promise<void> {
  const firstName = user.fullName.split(" ")[0];
  const html = baseLayout(`
    <h1>Passcode Reset</h1>
    <p>Hi ${firstName},</p>
    <p>A passcode reset was requested for your Vault Wealth account. Use the temporary password below to log in, then you'll be prompted to create a new passcode.</p>
    <div class="info-box">
      <p><span class="label">Email:</span> &nbsp;${user.email}</p>
      <p style="margin-top:8px;"><span class="label">Temporary Password:</span></p>
      <p style="font-size:22px; font-family:monospace; font-weight:900; color:#0d1520; letter-spacing:0.2em; margin:8px 0;">${user.tempPassword}</p>
    </div>
    <p>After logging in, you'll be asked to create a new 6-digit passcode.</p>
    <a class="btn" href="https://vaultwealth.com/login">Log In Now →</a>
    <hr class="divider" />
    <p style="font-size:12px; color:#8b9aae;">If you did not request a passcode reset, please contact us immediately at support@vaultwealth.com</p>
  `);

  await sendEmail({
    to: [{ email: user.email, name: user.fullName }],
    subject: "Vault Wealth — Passcode Reset",
    htmlContent: html,
    textContent: `Hi ${firstName}, your temporary password is: ${user.tempPassword}. Log in and create a new passcode.`,
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
