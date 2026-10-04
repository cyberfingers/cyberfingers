const form = document.querySelector("[data-contact-form]");

if (form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector("[data-form-status]");

  // Keep verification work off the initial hero render. Load it once the
  // contact form is nearby, or immediately when someone starts using it.
  let verificationScript;
  const loadVerification = () => {
    if (verificationScript) return;
    verificationScript = document.createElement("script");
    verificationScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    verificationScript.async = true;
    verificationScript.addEventListener("error", () => {
      verificationScript.remove();
      verificationScript = undefined;
      status.className = "form-status form-status-error";
      status.textContent = "Security verification could not load. Try submitting again to retry.";
    });
    document.head.append(verificationScript);
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadVerification();
        observer.disconnect();
      }
    }, { rootMargin: "600px" });
    observer.observe(form);
  } else {
    loadVerification();
  }
  form.addEventListener("focusin", loadVerification);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    loadVerification();
    if (!new FormData(form).get("cf-turnstile-response")) {
      status.className = "form-status form-status-error";
      status.textContent = "Please complete the security verification before sending your message.";
      status.focus();
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    status.className = "form-status";
    status.textContent = "Sending your message securely…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Unable to send your message.");

      form.reset();
      window.turnstile?.reset();
      status.className = "form-status form-status-success";
      status.textContent = result.message;
    } catch (error) {
      window.turnstile?.reset();
      status.className = "form-status form-status-error";
      status.textContent = error.message || "Unable to send your message. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send message";
      status.focus();
    }
  });
}
