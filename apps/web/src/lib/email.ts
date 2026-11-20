import { env } from "@/env";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function emailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

/**
 * Sends transactional email through Resend's REST API.
 * Returns `false` when email is not configured or the request fails; callers
 * must not treat delivery as a hard requirement for account creation.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM ?? "RateMyShelf <noreply@ratemyshelf.local>",
        to: [message.to],
        subject: message.subject,
        html: message.html,
        ...(message.text ? { text: message.text } : {}),
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
