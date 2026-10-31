document.addEventListener("DOMContentLoaded", () => {
  const client = window.DreamBetterSupabase;
  const form = document.querySelector("form[data-auth]");
  const googleButton = form?.querySelector("[data-google-sign-in]");
  if (!client || !form) return;

  googleButton?.addEventListener("click", async () => {
    if (window.location.protocol === "file:") {
      showToast("Google sign-in requires opening the app over HTTP.");
      return;
    }
    googleButton.disabled = true;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href }
    });
    if (error) showToast(authErrorMessage(error));
    googleButton.disabled = false;
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    const email = form.querySelector("input[type='email']")?.value.trim();
    const passwords = form.querySelectorAll("input[type='password']");
    const password = passwords[0]?.value || "";
    submitButton.disabled = true;
    try {
      if (form.dataset.auth === "register") {
        if (password !== passwords[1]?.value) {
          showToast("Passwords do not match.");
          return;
        }
        const name = form.querySelector("#register-name")?.value.trim() || "";
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        if (!data.session) {
          showToast("Check your email to confirm your account.");
          return;
        }
        await finishAuthentication(data.user, "Account created successfully.");
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await finishAuthentication(data.user, "Welcome back to DreamBetter!");
      }
    } catch (error) {
      showToast(authErrorMessage(error));
    } finally {
      submitButton.disabled = false;
    }
  });

  async function finishAuthentication(user, message) {
    localStorage.setItem("dreambetterAuthenticated", "true");
    localStorage.setItem(
      "dreambetterName",
      user.user_metadata?.full_name || user.email?.split("@")[0] || "DreamBetter member"
    );
    showToast(message);
    setTimeout(() => { window.location.href = "index.html"; }, 700);
  }

  function showToast(message) {
    const toast = document.querySelector(".toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function authErrorMessage(error) {
    const message = error?.message || "";
    if (message.toLowerCase().includes("invalid login")) return "Email or password is incorrect.";
    if (message.toLowerCase().includes("already registered")) return "An account already exists for this email.";
    if (message.toLowerCase().includes("password")) return "Choose a password with at least six characters.";
    if (message.toLowerCase().includes("email")) return "Enter a valid email address.";
    return "Authentication failed. Please try again.";
  }
});
