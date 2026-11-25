(function () {
  const api = window.CineVaultAPI;
  const statuses = ["Want to Watch", "Currently Watching", "Completed", "On Hold", "Dropped"];
  const uzStatus = {
    "Want to Watch": "Ko‘rmoqchiman",
    "Currently Watching": "Ko‘ryapman",
    "Completed": "Ko‘rib bo‘ldim",
    "On Hold": "Tanaffusda",
    "Dropped": "To‘xtatdim",
  };
  const enStatus = Object.fromEntries(Object.entries(uzStatus).map(([en, uz]) => [uz, en]));
  const language = () => localStorage.getItem("cinevault-language") === "en" ? "en" : "uz";
  const statusText = (status) => language() === "uz" ? (uzStatus[status] || status) : status;
  const typeText = (type) => language() === "uz" ? (type === "TV Series" ? "Serial" : "Film") : type;
  const tr = (uzText, enText) => language() === "uz" ? uzText : enText;
  const dictionaries = {
    uz: {
      "Search": "Izlash",
      "Search your vault": "Kinotekadan izlash",
      "Add title": "Kino qo‘shish",
      "Toggle appearance": "Ko‘rinishni almashtirish",
      "Dark": "Qorong‘i",
      "Light": "Yorug‘",
      "Close": "Yopish",
    },
    en: {
      "Search": "Search",
      "Search your vault": "Search your vault",
      "Add title": "Add title",
      "Toggle appearance": "Toggle appearance",
      "Dark": "Dark",
      "Light": "Light",
      "Close": "Close",
    },
  };
  const applyStaticTranslations = () => {
    document.documentElement.lang = language();
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      const en = element.dataset.i18nEn || key;
      element.textContent = language() === "uz" ? key : en;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.placeholder = language() === "uz"
        ? element.dataset.i18nPlaceholder
        : (element.dataset.i18nPlaceholderEn || element.dataset.i18nPlaceholder);
    });
    const uzToEn = {
      "Bosh sahifa": "Dashboard",
      "To‘plamim": "My Collection",
      "Sevimlilar": "Favorites",
      "Ko‘rish rejasi": "Watchlist",
      "Kinoteka": "CineVault",
      "KINOTEKA": "LIBRARY",
      "Shaxsiy kinoteka": "Personal collection",
      "Mening CineVault’im": "My CineVault",
      "Qorong‘i": "Dark",
      "Yorug‘": "Light",
      "Ko‘rinish": "Appearance",
      "Kino qo‘shish": "Add title",
      "Kinotekadan izlash...": "Search your vault...",
    };
    if (language() === "en") {
      document.querySelectorAll(".side-nav .nav-link").forEach((element) => {
        const key = element.textContent.trim();
        if (uzToEn[key]) element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) node.textContent = uzToEn[key];
        });
      });
      document.querySelectorAll(".breadcrumb").forEach((element) => {
        element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace("Kinoteka", "Your space").replace("To‘plamim", "My Collection").replace("Sevimlilar", "Favorites").replace("Ko‘rish rejasi", "Watchlist");
        });
      });
      document.querySelectorAll(".side-label").forEach((element) => { element.textContent = "LIBRARY"; });
      document.querySelectorAll(".profile-row strong").forEach((element) => { element.textContent = "My CineVault"; });
      document.querySelectorAll(".profile-row small").forEach((element) => { element.textContent = "Personal collection"; });
      document.querySelectorAll(".theme-toggle > span:not(.nav-icon):not(.theme-state)").forEach((element) => { element.textContent = "Appearance"; });
      document.querySelectorAll("[data-open-form]").forEach((element) => {
        element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) node.textContent = " Add title";
        });
      });
      document.querySelectorAll("#global-search").forEach((element) => { element.placeholder = "Search your vault..."; });
    }
  };
  const fallbackPoster = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 430'%3E%3Cdefs%3E%3ClinearGradient id='g' x2='1' y2='1'%3E%3Cstop stop-color='%23282942'/%3E%3Cstop offset='1' stop-color='%2311111b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='430' fill='url(%23g)'/%3E%3Cpath d='M130 180h40v70h-40z' fill='%23a679ff' opacity='.6'/%3E%3Ccircle cx='150' cy='155' r='28' fill='%23a679ff' opacity='.3'/%3E%3Ctext x='150' y='300' fill='%23b5a4df' font-size='14' text-anchor='middle' font-family='sans-serif'%3ECINEVAULT%3C/text%3E%3C/svg%3E";
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
  const imageUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return fallbackPoster;
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? escape(value) : fallbackPoster;
    } catch (_) {
      return fallbackPoster;
    }
  };
  const setPosterFallbacks = (root) => root.querySelectorAll("img[data-poster]").forEach((img) => {
    img.addEventListener("error", () => { img.src = fallbackPoster; }, { once: true });
  });

  function toast(message, type = "success") {
    const root = document.getElementById("toast-root");
    const item = document.createElement("div");
    item.className = `toast ${type}`;
    item.textContent = message;
    root.appendChild(item);
    window.setTimeout(() => item.remove(), 3500);
  }

  function openModal(title, body, className = "") {
    const root = document.getElementById("modal-root");
    root.innerHTML = `<div class="modal-backdrop" role="presentation"><section class="modal ${className}" role="dialog" aria-modal="true" aria-label="${escape(title)}"><header class="modal-header"><h2>${escape(title)}</h2><button class="modal-close" type="button" aria-label="Close dialog">×</button></header>${body}</section></div>`;
    const backdrop = root.querySelector(".modal-backdrop");
    root.querySelector(".modal-close").addEventListener("click", closeModal);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeModal();
    });
    document.addEventListener("keydown", handleEscape, { once: true });
    return root.querySelector(".modal");
  }

  function handleEscape(event) {
    if (event.key === "Escape") closeModal();
  }

  function closeModal() {
    document.getElementById("modal-root").innerHTML = "";
  }

  function youtubeEmbed(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      let videoId = "";
      if (host === "youtu.be") videoId = url.pathname.slice(1).split("/")[0];
      if (host === "youtube.com" || host === "m.youtube.com") {
        videoId = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1] || "";
      }

      return /^[A-Za-z0-9_-]{6,}$/.test(videoId)
        ? `https://www.youtube.com/embed/${videoId}`
        : "";
    } catch (_) {
      return "";
    }
  }

  function validStreamUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol)) return "";
      return value;
    } catch (_) {
      return "";
    }
  }

  function cardMarkup(title, options = {}) {
    const statusClass = title.watch_status.toLowerCase().replaceAll(" ", "-");
    return `<article class="title-card" data-open-title="${title.id}" tabindex="0" aria-label="${tr("Ko‘rish:", "View")} ${escape(title.title)}">
      <div class="card-poster"><img data-poster src="${imageUrl(title.poster_url)}" alt="${escape(title.title)} poster" loading="lazy"><div class="card-shade"></div>
        <div class="card-topline"><span class="type-chip">${escape(typeText(title.media_type))}</span><button class="favorite-button ${title.is_favorite ? "is-favorite" : ""}" data-favorite="${title.id}" aria-label="${title.is_favorite ? tr("Sevimlilardan olib tashlash", "Remove from favorites") : tr("Sevimlilarga qo‘shish", "Add to favorites")}">${title.is_favorite ? "♥" : "♡"}</button></div>
        <div class="card-score">${title.personal_rating ? `★ ${title.personal_rating}<span>/10</span>` : "☆ —"}</div>
      </div><div class="card-content"><h3 class="card-title">${escape(title.title)}</h3><div class="card-meta"><span>${escape(title.release_year)} · ${escape(title.genre)}</span><span>${title.imdb_rating != null ? `IMDb ${escape(title.imdb_rating)}` : ""}</span></div>${options.hideStatus ? "" : `<span class="status-pill status-${statusClass}">${escape(statusText(title.watch_status))}</span>`}</div>
    </article>`;
  }

  function renderCards(root, titles, emptyTitle, emptyText, emptyAction = true) {
    if (!titles.length) {
      root.innerHTML = `<div class="empty-state"><div class="empty-art">✦</div><h3>${escape(emptyTitle)}</h3><p>${escape(emptyText)}</p>${emptyAction ? `<button class="button button-primary button-small" data-open-form>＋ ${tr("Birinchi asarni qo‘shish", "Add your first title")}</button>` : ""}</div>`;
    } else {
      root.innerHTML = titles.map((title) => cardMarkup(title)).join("");
    }
    setPosterFallbacks(root);
    wireCards(root);
  }

  function wireCards(root) {
    root.querySelectorAll("[data-open-title]").forEach((card) => {
      card.addEventListener("click", (event) => {
        if (event.target.closest("[data-favorite]")) return;
        showDetails(card.dataset.openTitle);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && event.target === card) showDetails(card.dataset.openTitle);
      });
    });
    root.querySelectorAll("[data-favorite]").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        try {
          const result = button.classList.contains("is-favorite")
            ? await api.unfavorite(button.dataset.favorite)
            : await api.favorite(button.dataset.favorite);
          toast(result.is_favorite ? tr("Sevimlilarga qo‘shildi", "Added to favorites") : tr("Sevimlilardan olindi", "Removed from favorites"));
          window.dispatchEvent(new CustomEvent("cinevault:changed", { detail: { id: result.id } }));
        } catch (error) {
          toast(error.message, "error");
        }
      });
    });
  }

  function formMarkup(title = {}) {
    const value = (key) => escape(title[key] ?? "");
    const selected = (key, option) => (title[key] || (key === "watch_status" ? "Want to Watch" : "Movie")) === option ? "selected" : "";
    return `<form class="title-form" id="title-form" novalidate><div class="form-grid">
      <div class="form-field"><label for="f-title">${tr("Asar nomi *", "Title *")}</label><input id="f-title" name="title" required maxlength="200" value="${value("title")}" placeholder="${tr("Masalan: Interstellar", "e.g. Interstellar")}"></div>
      <div class="form-field"><label for="f-type">${tr("Turi *", "Type *")}</label><select id="f-type" name="media_type"><option value="Movie" ${selected("media_type", "Movie")}>${tr("Film", "Movie")}</option><option value="TV Series" ${selected("media_type", "TV Series")}>${tr("Serial", "TV Series")}</option></select></div>
      <div class="form-field"><label for="f-year">${tr("Chiqqan yili *", "Release year *")}</label><input id="f-year" name="release_year" type="number" min="1888" max="2100" required value="${value("release_year")}" placeholder="2024"></div>
      <div class="form-field"><label for="f-genre">${tr("Janr", "Genre")}</label><input id="f-genre" name="genre" maxlength="120" value="${value("genre")}" placeholder="${tr("Drama, fantastika...", "Drama, Sci-Fi...")}"></div>
      <div class="form-field"><label for="f-poster">${tr("Poster havolasi", "Poster image URL")}</label><input id="f-poster" name="poster_url" type="url" maxlength="1000" value="${value("poster_url")}" placeholder="https://..."></div>
      <div class="form-field"><label for="f-trailer">${tr("YouTube treyler havolasi", "YouTube trailer URL")}</label><input id="f-trailer" name="trailer_url" type="url" maxlength="1000" value="${value("trailer_url")}" placeholder="https://www.youtube.com/watch?v=..."></div>
      <div class="form-field"><label for="f-stream">${tr("Video havolasi (MP4 / HLS)", "Video URL (MP4 / HLS)")}</label><input id="f-stream" name="stream_url" type="url" maxlength="1000" value="${value("stream_url")}" placeholder="https://.../video.mp4 yoki .m3u8"></div>
      <div class="form-field"><label for="f-director">${tr("Rejissyor / yaratuvchi", "Director / creator")}</label><input id="f-director" name="director" maxlength="200" value="${value("director")}"></div>
      <div class="form-field"><label for="f-imdb">IMDb ${tr("bahosi (0–10)", "rating (0–10)")}</label><input id="f-imdb" name="imdb_rating" type="number" min="0" max="10" step="0.1" value="${value("imdb_rating")}"></div>
      <div class="form-field"><label for="f-rating">${tr("Sizning bahoyingiz (1–10)", "Your rating (1–10)")}</label><input id="f-rating" name="personal_rating" type="number" min="1" max="10" value="${value("personal_rating")}"></div>
      <div class="form-field"><label for="f-status">${tr("Tomosha holati", "Watch status")}</label><select id="f-status" name="watch_status">${statuses.map((status) => `<option value="${status}" ${selected("watch_status", status)}>${statusText(status)}</option>`).join("")}</select></div>
      <div class="form-field"><label for="f-seasons">${tr("Mavsumlar (serial)", "Seasons (series)")}</label><input id="f-seasons" name="seasons" type="number" min="0" max="1000" value="${value("seasons")}"></div>
      <div class="form-field"><label for="f-episodes">${tr("Epizodlar (serial)", "Episodes (series)")}</label><input id="f-episodes" name="episodes" type="number" min="0" max="10000" value="${value("episodes")}"></div>
      <div class="form-field"><label for="f-date">${tr("Qo‘shilgan sana", "Date added")}</label><input id="f-date" name="date_added" type="date" value="${value("date_added") || new Date().toISOString().slice(0, 10)}"></div>
      <div class="form-field full"><label for="f-cast">${tr("Aktyorlar", "Cast")}</label><input id="f-cast" name="cast" maxlength="2000" value="${value("cast")}" placeholder="${tr("Ismlarini vergul bilan ajrating", "Separate names with commas")}"></div>
      <div class="form-field full"><label for="f-description">${tr("Tavsif", "Description")}</label><textarea id="f-description" name="description" maxlength="10000" placeholder="${tr("Hikoya nima haqida?", "What is this story about?")}">${value("description")}</textarea></div>
      <div class="form-field full"><label for="f-notes">${tr("Shaxsiy izohlar", "Personal notes")}</label><textarea id="f-notes" name="personal_notes" maxlength="10000" placeholder="${tr("Fikrlaringiz, sevimli lahzalaringiz...", "Your thoughts, favorite moments...")}">${value("personal_notes")}</textarea></div>
    </div><div class="form-actions"><button class="button button-outline button-small" type="button" data-cancel>${tr("Bekor qilish", "Cancel")}</button><button class="button button-primary button-small" type="submit">${title.id ? tr("O‘zgarishlarni saqlash", "Save changes") : tr("To‘plamga qo‘shish", "Add to collection")}</button></div></form>`;
  }

  function formData(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    ["release_year", "seasons", "episodes", "personal_rating"].forEach((key) => {
      data[key] = data[key] === "" ? null : Number(data[key]);
    });
    data.release_year = data.release_year ?? new Date().getFullYear();
    ["imdb_rating"].forEach((key) => {
      data[key] = data[key] === "" ? null : Number(data[key]);
    });
    data.genre = data.genre.trim() || "Uncategorized";
    data.title = data.title.trim();
    if (data.poster_url) {
      const parsed = new URL(data.poster_url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Poster URL must use HTTP or HTTPS.");
    }
    if (data.trailer_url) {
      const parsed = new URL(data.trailer_url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Trailer URL must use HTTP or HTTPS.");
      const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (!["youtube.com", "youtu.be"].includes(host)) throw new Error("Trailer havolasi faqat YouTube’dan bo‘lishi kerak.");
    }
    if (data.stream_url) {
      const parsed = new URL(data.stream_url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Video havolasi HTTP yoki HTTPS bo‘lishi kerak.");
    }
    return data;
  }

  function openTitleForm(title = null) {
    const dialog = openModal(title ? tr("Asarni tahrirlash", "Edit title") : tr("To‘plamingizga qo‘shish", "Add to your collection"), formMarkup(title || {}), "form-modal");
    dialog.querySelector("[data-cancel]").addEventListener("click", closeModal);
    dialog.querySelector("#f-type").addEventListener("change", (event) => {
      const isSeries = event.target.value === "TV Series";
      ["f-seasons", "f-episodes"].forEach((id) => {
        const input = dialog.querySelector(`#${id}`);
        input.disabled = !isSeries;
        if (!isSeries) input.value = "";
      });
    });
    dialog.querySelector("#f-type").dispatchEvent(new Event("change"));
    dialog.querySelector("#title-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      try {
        const payload = formData(form);
        const result = title ? await api.update(title.id, payload) : await api.create(payload);
        closeModal();
        toast(title ? tr("O‘zgarishlar saqlandi", "Changes saved") : tr("Kinoteka to‘plamiga qo‘shildi", "Added to your collection"));
        window.dispatchEvent(new CustomEvent("cinevault:changed", { detail: { id: result.id } }));
      } catch (error) {
        toast(error.message, "error");
      }
    });
  }

  async function showDetails(id) {
    try {
      const title = await api.get(id);
      const trailerEmbed = youtubeEmbed(title.trailer_url);
      const streamUrl = validStreamUrl(title.stream_url);
      const trailerButton = trailerEmbed
        ? `<button class="button button-primary button-small" data-watch-trailer>▶ ${tr("Treylerni ko‘rish", "Watch trailer")}</button>`
        : "";
      const streamButton = streamUrl
        ? `<button class="button button-primary button-small" data-watch-stream>▶ ${tr("Tomoshani boshlash", "Watch now")}</button>`
        : "";
      const dialog = openModal(title.title, `<div class="detail-layout"><img class="detail-poster" data-poster src="${imageUrl(title.poster_url)}" alt="${escape(title.title)} poster"><div class="detail-info">
        <p class="eyebrow">${escape(typeText(title.media_type))}</p><h2>${escape(title.title)}</h2><div class="detail-sub"><span>${escape(title.release_year)}</span><span>${escape(title.genre)}</span><span class="status-pill status-${title.watch_status.toLowerCase().replaceAll(" ", "-")}">${escape(statusText(title.watch_status))}</span></div>
        <div class="detail-ratings"><span class="rating-box">IMDb ★ ${title.imdb_rating ?? "—"}</span><span class="rating-box personal">${tr("Mening bahoyim", "Your rating")} ★ ${title.personal_rating ? `${title.personal_rating}/10` : "—"}</span></div>
        <p class="detail-description">${escape(title.description || tr("Tavsif hali qo‘shilmagan.", "No description added yet."))}</p>
        <div class="detail-facts"><div class="detail-fact"><span>${tr("Rejissyor / yaratuvchi", "Director / creator")}</span><strong>${escape(title.director || "—")}</strong></div><div class="detail-fact"><span>${tr("Qo‘shilgan", "Added")}</span><strong>${escape(title.date_added || "—")}</strong></div><div class="detail-fact"><span>${tr("Aktyorlar", "Cast")}</span><strong>${escape(title.cast || "—")}</strong></div><div class="detail-fact"><span>${tr("Mavsum / epizod", "Seasons / episodes")}</span><strong>${title.media_type === "TV Series" ? `${escape(title.seasons ?? "—")} / ${escape(title.episodes ?? "—")}` : "—"}</strong></div></div>
        <div class="detail-fact" style="margin-top:13px"><span>${tr("Tomosha holati", "Watch status")}</span><select class="detail-status" aria-label="${tr("Tomosha holati", "Watch status")}">${statuses.map((status) => `<option value="${status}" ${title.watch_status === status ? "selected" : ""}>${statusText(status)}</option>`).join("")}</select></div>
        ${title.personal_notes ? `<div class="detail-notes"><span>${tr("Shaxsiy izohlar", "Personal notes")}</span><p>${escape(title.personal_notes)}</p></div>` : ""}
        <div class="detail-actions"><button class="button button-primary button-small" data-edit>✎ ${tr("Tahrirlash", "Edit")}</button>${streamButton}${trailerButton}<button class="button button-outline button-small" data-detail-favorite>${title.is_favorite ? `♥ ${tr("Sevimlilardan olish", "Remove favorite")}` : `♡ ${tr("Sevimliga qo‘shish", "Add favorite")}`}</button><button class="button button-danger button-small" data-delete>${tr("O‘chirish", "Delete")}</button></div>
      </div></div>`, "detail-modal");
      setPosterFallbacks(dialog);
      dialog.querySelector("[data-watch-stream]")?.addEventListener("click", () => {
        const lowerUrl = streamUrl.toLowerCase();
        const player = lowerUrl.endsWith(".m3u8")
          ? `<video id="hls-player" controls autoplay playsinline></video>`
          : `<video controls autoplay playsinline><source src="${escape(streamUrl)}" type="${lowerUrl.includes(".webm") ? "video/webm" : "video/mp4"}">${tr("Brauzeringiz video ijrosini qo‘llab-quvvatlamaydi.", "Your browser does not support video playback.")}</video>`;
        openModal(title.title, `<div class="video-player">${player}</div>`);
        if (lowerUrl.endsWith(".m3u8")) {
          const video = document.getElementById("hls-player");
          if (window.Hls?.isSupported()) {
            const hls = new window.Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
          } else {
            toast(tr("Bu brauzer HLS formatini qo‘llab-quvvatlamaydi.", "This browser does not support HLS playback."), "error");
          }
        }
      });
      dialog.querySelector("[data-watch-trailer]")?.addEventListener("click", () => {
        openModal(tr("Rasmiy treyler", "Official trailer"), `<div class="trailer-player"><iframe src="${escape(trailerEmbed)}" title="${tr("YouTube treyleri", "YouTube trailer")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`);
      });
      dialog.querySelector("[data-edit]").addEventListener("click", () => openTitleForm(title));
      dialog.querySelector("[data-detail-favorite]").addEventListener("click", async () => {
        try {
          const updated = title.is_favorite ? await api.unfavorite(title.id) : await api.favorite(title.id);
          toast(updated.is_favorite ? tr("Sevimlilarga qo‘shildi", "Added to favorites") : tr("Sevimlilardan olindi", "Removed from favorites"));
          closeModal();
          window.dispatchEvent(new CustomEvent("cinevault:changed", { detail: { id: title.id } }));
        } catch (error) { toast(error.message, "error"); }
      });
      dialog.querySelector(".detail-status").addEventListener("change", async (event) => {
        try {
          const current = await api.get(title.id);
          current.watch_status = event.target.value;
          await api.update(title.id, current);
          toast(tr("Tomosha holati yangilandi", "Watch status updated"));
          window.dispatchEvent(new CustomEvent("cinevault:changed", { detail: { id: title.id } }));
        } catch (error) {
          event.target.value = title.watch_status;
          toast(error.message, "error");
        }
      });
      dialog.querySelector("[data-delete]").addEventListener("click", () => confirmDelete(title));
    } catch (error) {
      toast(error.message, "error");
    }
  }

  function confirmDelete(title) {
    const dialog = openModal(tr("Asarni o‘chirish?", "Remove title?"), `<div class="confirm-body">${tr("Rostdan ham", "Are you sure you want to delete")} <strong>${escape(title.title)}</strong> ${tr("asarini to‘plamdan o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.", "from your collection? This action cannot be undone.")}</div><div class="confirm-actions"><button class="button button-outline button-small" data-cancel>${tr("Saqlab qolish", "Keep title")}</button><button class="button button-danger button-small" data-confirm-delete>${tr("Asarni o‘chirish", "Delete title")}</button></div>`);
    dialog.querySelector("[data-cancel]").addEventListener("click", closeModal);
    dialog.querySelector("[data-confirm-delete]").addEventListener("click", async () => {
      try {
        await api.remove(title.id);
        closeModal();
        toast(tr("Asar o‘chirildi", "Title deleted"));
        window.dispatchEvent(new CustomEvent("cinevault:changed", { detail: { id: title.id } }));
      } catch (error) { toast(error.message, "error"); }
    });
  }

  function setupTheme() {
    const apply = () => {
      const light = localStorage.getItem("cinevault-theme") === "light";
      document.body.classList.toggle("light-mode", light);
      document.querySelectorAll(".theme-state").forEach((node) => {
        node.textContent = language() === "uz" ? (light ? "Yorug‘" : "Qorong‘i") : (light ? "Light" : "Dark");
      });
      document.querySelectorAll("#header-theme").forEach((node) => { node.textContent = light ? "☾" : "☼"; });
    };
    document.querySelectorAll(".theme-toggle,#header-theme").forEach((button) => button.addEventListener("click", () => {
      localStorage.setItem("cinevault-theme", document.body.classList.contains("light-mode") ? "dark" : "light");
      apply();
    }));
    apply();
  }

  function setupNavigation() {
    const menuButton = document.querySelector(".mobile-menu");
    const sidebar = document.querySelector(".sidebar");
    if (menuButton && sidebar) menuButton.addEventListener("click", () => sidebar.classList.toggle("open"));
    document.addEventListener("click", (event) => {
      if (sidebar?.classList.contains("open") && !sidebar.contains(event.target) && !menuButton.contains(event.target)) sidebar.classList.remove("open");
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-open-form]")) openTitleForm();
    });
    document.querySelectorAll("#language-toggle").forEach((button) => {
      button.textContent = language() === "uz" ? "UZ | EN" : "EN | UZ";
      button.addEventListener("click", () => {
        localStorage.setItem("cinevault-language", language() === "uz" ? "en" : "uz");
        window.location.reload();
      });
    });
    const search = document.getElementById("global-search");
    if (search) {
      search.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && search.value.trim()) window.location.href = `collection.html?search=${encodeURIComponent(search.value.trim())}`;
      });
      document.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          search.focus();
        }
      });
    }
  }

  window.CineVault = {
    api, escape, imageUrl, setPosterFallbacks, toast, openModal, closeModal, cardMarkup,
    renderCards, wireCards, showDetails, openTitleForm, statuses, tr, statusText, typeText, language,
    applyStaticTranslations,
  };
  document.addEventListener("DOMContentLoaded", () => {
    setupTheme();
    setupNavigation();
    applyStaticTranslations();
  });
})();
