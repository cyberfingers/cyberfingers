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

const sendToRelay = async ({ env, name, email, website, message, request }) => {
  const response = await fetch(env.CONTACT_RELAY_URL, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      secret: env.CONTACT_RELAY_SECRET,
      name,
      email,
      website,
      message,
      submittedAt: new Date().toISOString(),
      source: singleLine(request.headers.get("referer") || request.url, 500),
    }),
    redirect: "follow",
  });

  if (!response.ok) return false;
  const result = await response.json().catch(() => null);
  return result?.ok === true;
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

  if (!env.TURNSTILE_SECRET_KEY || !env.CONTACT_RELAY_URL || !env.CONTACT_RELAY_SECRET) {
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
    const sent = await sendToRelay({ env, name, email, website, message, request });
    if (!sent) throw new Error("Relay rejected the message.");
  } catch {
    return json({ ok: false, message: "Your message could not be sent. Please try again shortly." }, 502);
  }

  return json({ ok: true, message: "Thanks—your message has been sent to CyberFingers." });
}

export function onRequest() {
  return json({ ok: false, message: "Method not allowed." }, 405);
}
