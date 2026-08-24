import { EmailMessage } from "cloudflare:email";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const singleLine = (value, maxLength) =>
  String(value ?? "").replace(/[\r\n\0]/g, " ").trim().slice(0, maxLength);

const normalizeMessage = (value) =>
  String(value ?? "").replace(/\r\n?/g, "\n").replace(/\0/g, "").trim().slice(0, 5000);

const validEmail = (value) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validWebsite = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const verifyTurnstile = async (secret, token, remoteIp) => {
  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  if (remoteIp) form.set("remoteip", remoteIp);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form },
  );
  if (!response.ok) return false;

  const result = await response.json();
  return result.success === true && result.action === "contact";
};

const buildEmail = ({ name, email, website, message, request, sender, destination }) => {
  const submittedAt = new Date().toISOString();
  const source = singleLine(request.headers.get("referer") || request.url, 500);
  const subject = `CyberFingers website inquiry from ${name}`;
  const text = [
    "New inquiry from the CyberFingers website",
    "",
    `Name: ${name}`,
    `Reply-to: ${email}`,
    `Website: ${website || "Not provided"}`,
    `Submitted: ${submittedAt}`,
    `Source: ${source}`,
    "",
    "Message:",
    message,
  ].join("\r\n");

  return [
    `From: CyberFingers Website <${singleLine(sender, 254)}>`,
    `To: ${singleLine(destination, 254)}`,
    `Reply-To: ${email}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
  ].join("\r\n");
};

export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data") && !contentType.includes("application/x-www-form-urlencoded")) {
    return json({ ok: false, message: "Please submit the contact form." }, 415);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, message: "The form could not be read. Please try again." }, 400);
  }

  // Bots often fill this hidden field. Return success without sending anything.
  if (singleLine(form.get("company"), 200)) {
    return json({ ok: true, message: "Thanks. Your message has been received." });
  }

  const name = singleLine(form.get("name"), 100);
  const email = singleLine(form.get("email"), 254).toLowerCase();
  const website = singleLine(form.get("website"), 500);
  const message = normalizeMessage(form.get("message"));
  const turnstileToken = singleLine(form.get("cf-turnstile-response"), 2048);

  if (name.length < 2 || !validEmail(email) || !validWebsite(website) || message.length < 20) {
    return json({
      ok: false,
      message: "Please provide your name, a valid email, and a message of at least 20 characters.",
    }, 400);
  }

  if (!env.TURNSTILE_SECRET_KEY || !env.CONTACT_SENDER || !env.CONTACT_DESTINATION || !env.CONTACT_EMAIL) {
    return json({ ok: false, message: "The contact form is being configured. Please try again shortly." }, 503);
  }

  const verified = await verifyTurnstile(
    env.TURNSTILE_SECRET_KEY,
    turnstileToken,
    request.headers.get("CF-Connecting-IP"),
  );
  if (!verified) {
    return json({ ok: false, message: "Please complete the security check and try again." }, 400);
  }

  try {
    const raw = buildEmail({
      name,
      email,
      website,
      message,
      request,
      sender: env.CONTACT_SENDER,
      destination: env.CONTACT_DESTINATION,
    });
    const emailMessage = new EmailMessage(env.CONTACT_SENDER, env.CONTACT_DESTINATION, raw);
    await env.CONTACT_EMAIL.send(emailMessage);
  } catch {
    return json({ ok: false, message: "Your message could not be sent. Please try again shortly." }, 502);
  }

  return json({ ok: true, message: "Thanks—your message has been sent to CyberFingers." });
}

export function onRequest() {
  return json({ ok: false, message: "Method not allowed." }, 405);
}
