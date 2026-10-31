document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.querySelector("[data-analyze-insights]");
  const result = document.querySelector("[data-insight-result]");
  const quickQuestions = document.querySelectorAll("[data-insight-question]");
  if (!analyzeButton || !result || !window.DreamBetterAPI) return;

  if (!window.DreamBetterSupabase) {
    analyzeButton.disabled = true;
    renderError("Authentication is unavailable. Open the site over HTTP and reload.");
  }

  analyzeButton.addEventListener("click", async () => {
    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analyzing...";
    result.hidden = false;
    result.innerHTML = "<p class=\"muted\">Reviewing your recent sleep data...</p>";

    try {
      const logs = await DreamBetterAPI.request("/sleep-logs");
      if (!logs.length) {
        renderError("Log at least one sleep session before generating insights.");
        return;
      }

      const insight = await DreamBetterAPI.request("/insights", {
        method: "POST",
        body: JSON.stringify({
          sleepData: JSON.stringify(logs),
          lifestyleData: ""
        })
      });
      renderInsight(insight);
    } catch (error) {
      renderError(error.message || "Could not generate insights. Please try again.");
    } finally {
      analyzeButton.disabled = false;
      analyzeButton.textContent = "Analyze my sleep";
    }
  });

  quickQuestions.forEach(question => {
    question.addEventListener("click", () => {
      const originalText = question.textContent;
      question.disabled = true;
      question.textContent = "Generate insights to explore this question";
      setTimeout(() => {
        question.disabled = false;
        question.textContent = originalText;
      }, 2200);
    });
  });

  function renderInsight(insight) {
    const evidence = listItems(insight.evidence);
    const recommendations = listItems(insight.recommendations);
    result.innerHTML = `
      <div class="section-title"><h2>${escapeHtml(insight.title || "Your sleep insight")}</h2></div>
      <p>${escapeHtml(insight.summary || "No summary was returned.")}</p>
      ${section("Evidence", evidence)}
      ${section("Recommendations", recommendations)}
      <p class="muted">Confidence: ${escapeHtml(String(insight.confidence || "Not provided"))}</p>
      <p class="muted">${escapeHtml(insight.safetyMessage || "This is wellness information, not medical advice.")}</p>`;
  }

  function renderError(message) {
    result.hidden = false;
    result.innerHTML = `<p class="muted">${escapeHtml(message)}</p>`;
  }

  function section(title, items) {
    if (!items.length) return "";
    return `<h3>${title}</h3><ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function listItems(value) {
    return Array.isArray(value) ? value.map(String) : [];
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[character]));
  }
});
