document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split(/[\\/]/).pop() || "index.html";
  const isAuthPage = path === "login.html" || path === "register.html";
  const isAuthenticated = localStorage.getItem("dreambetterAuthenticated") === "true";
  document.querySelectorAll("[data-page]").forEach(link => {
    if (link.dataset.page === path) link.classList.add("active");
  });
  document.querySelectorAll("[data-toast]").forEach(button => {
    button.addEventListener("click", () => {
      const toast = document.querySelector(".toast");
      if (toast) { toast.textContent = button.dataset.toast; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2400); }
    });
  });
  document.querySelectorAll("[data-menu]").forEach(button => {
    button.setAttribute("aria-label", "Toggle navigation");
    button.addEventListener("click", () => document.querySelector(".sidebar")?.classList.toggle("open"));
  });
  document.querySelectorAll(".nav a").forEach(link => link.addEventListener("click", () => document.querySelector(".sidebar")?.classList.remove("open")));
  if (!isAuthPage) {
    const nav = document.querySelector(".nav");
    if (nav) {
      const authItem = document.createElement("a");
      authItem.href = isAuthenticated ? "#" : "login.html";
      authItem.className = "nav-auth-link";
      authItem.innerHTML = isAuthenticated
        ? '<span class="nav-icon">↪</span><span>Log out</span>'
        : '<span class="nav-icon">⇥</span><span>Sign in</span>';
      nav.appendChild(authItem);
      authItem.addEventListener("click", event => {
        if (isAuthenticated) {
          event.preventDefault();
          window.DreamBetterSupabase?.auth.signOut().finally(() => {
            localStorage.removeItem("dreambetterAuthenticated");
            localStorage.removeItem("dreambetterName");
            window.location.href = "login.html";
          });
        }
      });
    }
    const topUser = document.querySelector(".top-user");
    if (topUser && isAuthenticated) {
      const name = localStorage.getItem("dreambetterName") || "DreamBetter member";
      const displayName = name.split(/\s+/)[0];
      const nameText = Array.from(topUser.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
      if (nameText) nameText.nodeValue = `${displayName}⌄`;
      topUser.title = "Signed in account";
    }
  }
});
