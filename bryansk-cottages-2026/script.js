(function () {
  const state = {
    data: window.BRYANSK_ANALYSIS || null,
    filter: "all",
    votes: null
  };

  const statusClass = {
    verified_full: "verified_full",
    verified_compromise: "verified_compromise",
    fallback_1n: "fallback_1n"
  };

  const demoCounts = {
    "Экопарк Святобор": 9,
    "Отень как бюджетный план Б": 2,
    "Империал как самый дешевый ночлег": 1,
    "Дом мечты на одну ночь": 4,
    "Ковшовка как бюджетный дом на 8-10 ночующих": 2
  };

  const keys = {
    counts: "bryansk-cottages-poll-counts-v1",
    vote: "bryansk-cottages-poll-vote-v1"
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function linkList(links) {
    return links
      .map(
        (link) =>
          `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(
            link.label
          )}</a>`
      )
      .join("");
  }

  function bulletList(items) {
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  async function loadData() {
    if (state.data) return state.data;

    const response = await fetch("data/analysis.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Не удалось загрузить data/analysis.json");
    state.data = await response.json();
    return state.data;
  }

  function renderHero(data) {
    document.title = data.meta.title;
    document.getElementById("core-conclusion").textContent = data.meta.coreConclusion;
    document.getElementById("best-fit").textContent = data.summary.bestFullFit;
  }

  function renderRecommendation(data) {
    const grid = document.getElementById("recommendation-grid");
    const cards = [
      ["Бронировать первым", data.summary.bestFullFit, "Единственный подтвержденный загородный вариант на всю компанию."],
      ["Премиальный запас", data.summary.bestFallback, "Сильный дом на одну ночь, если ночуют примерно 8 человек."],
      ["Бюджетный план Б", data.summary.bestBudget, "Разместит всех номерами, но не даст приватный коттеджный формат."],
      ["Главный промах даты", "Новоселов 3", "Хороший коттедж на 25 гостей занят на обе целевые даты."]
    ];

    grid.innerHTML = cards
      .map(
        ([label, title, text]) => `
          <article>
            <span class="fact-label">${escapeHtml(label)}</span>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(text)}</p>
          </article>
        `
      )
      .join("");
  }

  function optionCard(option) {
    const cls = statusClass[option.status] || "";
    return `
      <article class="option-card" data-status="${escapeHtml(option.status)}">
        <img src="${escapeHtml(option.image)}" alt="Скриншот: ${escapeHtml(option.title)}" loading="lazy" />
        <div class="option-body">
          <div class="option-title-row">
            <div>
              <span class="status ${cls}">${escapeHtml(option.statusLabel)}</span>
              <h3>${escapeHtml(option.rank)}. ${escapeHtml(option.title)}</h3>
              <p class="option-meta">${escapeHtml(option.type)} · ${escapeHtml(option.location)}</p>
            </div>
            <div class="score" aria-label="Оценка ${escapeHtml(option.score)} из 100">${escapeHtml(option.score)}</div>
          </div>

          <div class="fact-grid">
            <div class="fact">
              <span class="fact-label">Цена</span>
              <strong>${escapeHtml(option.price)}</strong>
            </div>
            <div class="fact">
              <span class="fact-label">1 ночь</span>
              <strong>${escapeHtml(option.priceOneNight)}</strong>
            </div>
            <div class="fact">
              <span class="fact-label">Вместимость</span>
              <strong>${escapeHtml(option.capacity)}</strong>
            </div>
            <div class="fact">
              <span class="fact-label">Отзывы</span>
              <strong>${escapeHtml(option.rating)}</strong>
            </div>
          </div>

          <p>${escapeHtml(option.sleepingFit)}</p>
          <p><strong>Расчет:</strong> ${escapeHtml(option.priceCalc)}</p>
          <p><strong>Проверка:</strong> ${escapeHtml(option.availabilityProof)}</p>

          <div class="list-cols">
            <div>
              <h4>Плюсы</h4>
              <ul>${bulletList(option.pros)}</ul>
            </div>
            <div class="cons">
              <h4>Минусы</h4>
              <ul>${bulletList(option.cons)}</ul>
            </div>
          </div>

          <div>
            <h4>Частые темы отзывов</h4>
            <ul class="source-list">${bulletList(option.reviewThemes)}</ul>
          </div>

          <div class="source-links">${linkList(option.links)}</div>
        </div>
      </article>
    `;
  }

  function renderOptions(data) {
    const grid = document.getElementById("option-grid");
    const options = data.options.filter((option) => state.filter === "all" || option.status === state.filter);
    grid.innerHTML = options.map(optionCard).join("");
  }

  function renderCompare(data) {
    const body = document.getElementById("compare-body");
    body.innerHTML = data.options
      .map(
        (option) => `
          <tr>
            <td>
              <strong>${escapeHtml(option.rank)}. ${escapeHtml(option.title)}</strong>
              <span class="table-note">${escapeHtml(option.location)}</span>
            </td>
            <td>${escapeHtml(option.type)}</td>
            <td>${escapeHtml(option.capacity)}<br /><span class="table-note">${escapeHtml(option.statusLabel)}</span></td>
            <td>${escapeHtml(option.price)}<br /><span class="table-note">${escapeHtml(option.deposit)}</span></td>
            <td>${escapeHtml(option.rating)}</td>
            <td>${escapeHtml(option.bestFor)}<br /><span class="table-note">Оценка: ${escapeHtml(option.score)}/100</span></td>
          </tr>
        `
      )
      .join("");
  }

  function renderExcluded(data) {
    const list = document.getElementById("excluded-list");
    list.innerHTML = data.screenedOut
      .map(
        (item) => `
          <article class="excluded-item">
            <img src="${escapeHtml(item.image)}" alt="Скриншот: ${escapeHtml(item.title)}" loading="lazy" />
            <div>
              <span class="excluded-status">${escapeHtml(item.status)}</span>
              <h3>${escapeHtml(item.title)}</h3>
              <p><strong>Почему смотрели:</strong> ${escapeHtml(item.whyImportant)}</p>
              <p><strong>Почему не берем:</strong> ${escapeHtml(item.reason)}</p>
              <div class="source-links">${linkList(item.links)}</div>
            </div>
          </article>
        `
      )
      .join("");
  }

  function setupFilters(data) {
    document.querySelectorAll(".filter").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        state.filter = button.dataset.filter;
        renderOptions(data);
      });
    });
  }

  function loadVotes(data) {
    const saved = localStorage.getItem(keys.counts);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem(keys.counts);
      }
    }

    const counts = {};
    data.poll.choices.forEach((choice) => {
      counts[choice] = demoCounts[choice] || 0;
    });
    return counts;
  }

  function saveVotes() {
    localStorage.setItem(keys.counts, JSON.stringify(state.votes));
  }

  function renderPoll(data) {
    const question = document.getElementById("poll-question");
    const options = document.getElementById("poll-options");
    question.textContent = data.poll.question;

    options.innerHTML = data.poll.choices
      .map(
        (choice, index) => `
          <label class="choice">
            <input type="radio" name="choice" value="${escapeHtml(choice)}" ${index === 0 ? "checked" : ""} />
            <span>${escapeHtml(choice)}</span>
          </label>
        `
      )
      .join("");

    state.votes = loadVotes(data);
    renderResults(data);

    document.getElementById("poll-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const choice = form.get("choice");
      const name = String(form.get("name") || "").trim();
      if (!choice) return;

      const previous = localStorage.getItem(keys.vote);
      if (previous && state.votes[previous] > 0) {
        state.votes[previous] -= 1;
      }
      state.votes[choice] = (state.votes[choice] || 0) + 1;
      localStorage.setItem(keys.vote, choice);
      saveVotes();
      renderResults(data);

      if (window.POLL_API_URL) {
        await fetch(window.POLL_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            choice,
            source: "bryansk-cottages-landing",
            createdAt: new Date().toISOString()
          })
        }).catch(() => null);
      }

      const note = document.getElementById("poll-note");
      note.textContent = name
        ? `${name}, голос учтен.`
        : "Голос учтен в этом браузере.";
    });
  }

  function renderResults(data) {
    const target = document.getElementById("poll-results");
    const total = Object.values(state.votes).reduce((sum, value) => sum + Number(value || 0), 0) || 1;
    target.innerHTML = data.poll.choices
      .map((choice) => {
        const count = Number(state.votes[choice] || 0);
        const percent = Math.round((count / total) * 100);
        return `
          <div class="result-row">
            <strong>${escapeHtml(choice)}</strong>
            <span>${count}</span>
            <div class="bar"><span style="width: ${percent}%"></span></div>
          </div>
        `;
      })
      .join("");
  }

  async function init() {
    try {
      const data = await loadData();
      renderHero(data);
      renderRecommendation(data);
      renderOptions(data);
      renderCompare(data);
      renderExcluded(data);
      renderPoll(data);
      setupFilters(data);
    } catch (error) {
      document.getElementById("core-conclusion").textContent =
        "Не удалось загрузить данные отчета. Откройте страницу через локальный сервер или GitHub Pages.";
      console.error(error);
    }
  }

  init();
})();
