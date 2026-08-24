const JSON_MIME_TYPE = ContentService.MimeType.JSON;

function jsonResponse_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(JSON_MIME_TYPE);
}

function cleanLine_(value, maxLength) {
  return String(value || "").replace(/[\r\n\0]/g, " ").trim().slice(0, maxLength);
}

function cleanMessage_(value) {
  return String(value || "").replace(/\r\n?/g, "\n").replace(/\0/g, "").trim().slice(0, 5000);
}

function validEmail_(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeEqual_(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  if (!a || a.length !== b.length) return false;

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

function doGet() {
  return jsonResponse_({ ok: false, message: "Method not allowed." });
}

function doPost(event) {
  try {
    const payload = JSON.parse(event?.postData?.contents || "{}");
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty("CONTACT_RELAY_SECRET");
    const destination = properties.getProperty("CONTACT_DESTINATION");

    if (!destination || !safeEqual_(payload.secret, expectedSecret)) {
      return jsonResponse_({ ok: false, message: "Request rejected." });
    }

    const name = cleanLine_(payload.name, 100);
    const email = cleanLine_(payload.email, 254).toLowerCase();
    const website = cleanLine_(payload.website, 500);
    const message = cleanMessage_(payload.message);
    const submittedAt = cleanLine_(payload.submittedAt, 100);
    const source = cleanLine_(payload.source, 500);

    if (name.length < 2 || !validEmail_(email) || message.length < 20) {
      return jsonResponse_({ ok: false, message: "Request rejected." });
    }

    const body = [
      "New inquiry from the CyberFingers website",
      "",
      `Name: ${name}`,
      `Reply-to: ${email}`,
      `Website: ${website || "Not provided"}`,
      `Submitted: ${submittedAt || new Date().toISOString()}`,
      `Source: ${source || "CyberFingers contact form"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    MailApp.sendEmail({
      to: destination,
      replyTo: email,
      subject: `CyberFingers website inquiry from ${name}`,
      body,
      name: "CyberFingers Website",
    });

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, message: "Request failed." });
  }
}
