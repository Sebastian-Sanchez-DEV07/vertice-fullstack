(function redirectIfSignedIn() {
  if (getToken()) {
    window.location.replace("admin.html");
  }
})();

(function setupLogin() {
  const form = document.getElementById("login-form");
  const status = document.getElementById("login-status");

  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const button = form.querySelector('button[type="submit"]');

    status.className = "form-status";

    if (!email || !password) {
      status.textContent = "Enter your email and password.";
      status.classList.add("is-error");
      return;
    }

    button.disabled = true;
    button.textContent = "SIGNING IN…";

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email: email, password: password },
      });

      saveSession(data.token, data.user);
      window.location.replace("admin.html");
    } catch (error) {
      status.textContent =
        error.details && error.details.length > 0
          ? error.details.join(". ")
          : error.message;
      status.classList.add("is-error");
      button.disabled = false;
      button.textContent = "SIGN IN";
    }
  });
})();
