const form = document.querySelector("[data-contact-form]");

if (form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
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
