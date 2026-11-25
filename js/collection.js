(function () {
  const { api, toast, renderCards, tr, language } = window.CineVault;
  const root = document.getElementById("title-grid");
  const pageSize = 15;
  const filters = {
    search: document.getElementById("collection-search"),
    type: document.getElementById("type-filter"),
    genre: document.getElementById("genre-filter"),
    status: document.getElementById("status-filter"),
    year: document.getElementById("year-filter"),
    rating: document.getElementById("rating-filter"),
    sort: document.getElementById("sort-filter"),
  };
  let matches = [];
  let visibleCount = 0;
  let debounceTimer;

  function getParams() {
    return {
      search: filters.search.value.trim(),
      media_type: filters.type.value,
      genre: filters.genre.value,
      status: filters.status.value,
      year: filters.year.value,
      min_rating: filters.rating.value,
      sort: filters.sort.value,
      limit: 1000,
    };
  }

  async function load(reset = true) {
    if (reset) {
      visibleCount = 0;
      root.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    }
    try {
      matches = await api.list(getParams());
      const shown = reset ? matches.slice(0, pageSize) : matches.slice(0, visibleCount + pageSize);
      visibleCount = shown.length;
      document.getElementById("result-count").textContent = matches.length;
      document.getElementById("load-more").hidden = visibleCount >= matches.length;
      renderCards(root, shown, tr("Asar topilmadi", "No titles found"), tr("Filtrlarni o‘zgartiring yoki kinotekaga yangi asar qo‘shing.", "Try changing your filters, or add something new to your collection."), true);
    } catch (error) {
      root.innerHTML = `<div class="empty-state"><div class="empty-art">!</div><h3>${tr("To‘plamni yuklab bo‘lmadi", "Couldn't load your collection")}</h3><p>${window.CineVault.escape(error.message)}</p><button class="button button-outline button-small" id="retry-load">${tr("Qayta urinish", "Try again")}</button></div>`;
      root.querySelector("#retry-load").addEventListener("click", () => load());
      toast(error.message, "error");
    }
  }

  async function populateGenres() {
    try {
      const selectedGenre = filters.genre.value;
      const titles = await api.list({ limit: 1000 });
      const genres = [...new Set(titles.map((title) => title.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b));
      filters.genre.innerHTML = `<option value="">${tr("Barcha janrlar", "All genres")}</option>` + genres.map((genre) => `<option>${window.CineVault.escape(genre)}</option>`).join("");
      if (genres.includes(selectedGenre)) filters.genre.value = selectedGenre;
    } catch (error) {
      toast(error.message, "error");
    }
  }

  function scheduleLoad() {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => load(), 220);
  }

  Object.entries(filters).forEach(([key, element]) => {
    element.addEventListener(key === "search" || key === "year" ? "input" : "change", scheduleLoad);
  });
  document.getElementById("load-more").addEventListener("click", () => {
    visibleCount = Math.min(visibleCount + pageSize, matches.length);
    renderCards(root, matches.slice(0, visibleCount), tr("Asar topilmadi", "No titles found"), tr("Filtrlarni o‘zgartiring.", "Try changing your filters."), true);
    document.getElementById("load-more").hidden = visibleCount >= matches.length;
  });
  document.getElementById("advanced-toggle").addEventListener("click", (event) => {
    const filtersPanel = document.getElementById("advanced-filters");
    const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
    event.currentTarget.setAttribute("aria-expanded", String(!expanded));
    event.currentTarget.textContent = expanded
      ? (tr("＋ Boshqa filtrlar", "＋ More filters"))
      : (tr("− Filtrlarni yopish", "− Less filters"));
    filtersPanel.hidden = expanded;
  });
  document.getElementById("clear-filters").addEventListener("click", () => {
    Object.values(filters).forEach((element) => { if (element !== filters.sort) element.value = ""; });
    filters.sort.value = "newest";
    load();
  });
  document.getElementById("grid-view").addEventListener("click", () => setView(false));
  document.getElementById("list-view").addEventListener("click", () => setView(true));

  function setView(list) {
    root.classList.toggle("list-view", list);
    document.getElementById("grid-view").classList.toggle("active", !list);
    document.getElementById("list-view").classList.toggle("active", list);
  }

  const query = new URLSearchParams(window.location.search);
  if (query.has("search")) filters.search.value = query.get("search");
  if (query.has("status")) filters.status.value = query.get("status");

  document.getElementById("export-button").addEventListener("click", async () => {
    try {
      const titles = await api.export();
      const blob = new Blob([JSON.stringify(titles, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cinevault-collection-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast(tr(`${titles.length} ta asar yuklab olindi`, `Exported ${titles.length} titles`));
    } catch (error) { toast(error.message, "error"); }
  });
  document.getElementById("import-button").addEventListener("click", () => document.getElementById("import-file").click());
  document.getElementById("import-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const titles = Array.isArray(parsed) ? parsed : parsed.titles;
      if (!Array.isArray(titles)) throw new Error(tr("JSON fayli asarlar ro‘yxatini o‘z ichiga olishi kerak.", "JSON must contain a title array."));
      if (titles.length > 1000) throw new Error(tr("Bir importda 1,000 tagacha asar qo‘shish mumkin.", "Import is limited to 1,000 titles at a time."));
      const imported = await api.import(titles);
      toast(tr(`${imported.length} ta asar import qilindi`, `Imported ${imported.length} titles`));
      await Promise.all([load(), populateGenres()]);
    } catch (error) {
      toast(error.message, "error");
    } finally {
      event.target.value = "";
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    populateGenres();
    load();
  });
  window.addEventListener("cinevault:changed", () => {
    populateGenres();
    load();
  });
})();
