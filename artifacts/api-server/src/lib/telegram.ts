const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(text: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn("[telegram] Failed to send message:", body);
    }
  } catch (err) {
    console.warn("[telegram] Error sending message:", err);
  }
}

export async function notifyNewRegistration(opts: {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  userId: number;
}): Promise<void> {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const text =
    `🆕 <b>New Registration</b>\n\n` +
    `👤 <b>Name:</b> ${opts.fullName}\n` +
    `📧 <b>Email:</b> ${opts.email}\n` +
    `📱 <b>Phone:</b> ${opts.phone}\n` +
    `🌍 <b>Country:</b> ${opts.country}\n` +
    `🆔 <b>User ID:</b> #${opts.userId}\n` +
    `🕐 <b>Time:</b> ${now} UTC`;

  await sendTelegramMessage(text);
}

export async function notifyKycSubmission(opts: {
  fullName: string;
  email: string;
  userId: number;
}): Promise<void> {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const text =
    `📋 <b>KYC Submitted — Pending Review</b>\n\n` +
    `👤 <b>Name:</b> ${opts.fullName}\n` +
    `📧 <b>Email:</b> ${opts.email}\n` +
    `🆔 <b>User ID:</b> #${opts.userId}\n` +
    `🕐 <b>Time:</b> ${now} UTC\n\n` +
    `⚠️ Action required: review in admin portal`;

  await sendTelegramMessage(text);
}
