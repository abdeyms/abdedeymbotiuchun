(function () {
  const { api, escape, imageUrl, setPosterFallbacks, showDetails, toast, tr, typeText, language } = window.CineVault;
  const statNodes = document.querySelectorAll("[data-stat]");

  async function loadDashboard() {
    try {
      const [stats, titles, favorites] = await Promise.all([
        api.statistics(),
        api.list({ sort: "newest", limit: 500 }),
        api.favorites(),
      ]);
      statNodes.forEach((node) => {
        const key = node.dataset.stat;
        node.textContent = stats[key] ?? 0;
      });
      const completedBreakdown = document.querySelector('[data-stat-detail="completed"]');
      if (completedBreakdown) {
        completedBreakdown.textContent = language() === "uz"
          ? `${stats.completed_movies} film · ${stats.completed_series} serial`
          : `${stats.completed_movies} movies · ${stats.completed_series} series`;
      }
      document.querySelectorAll('[data-stat-label="watchlist"]').forEach((node) => {
        node.textContent = language() === "uz"
          ? (stats.watchlist === 1 ? "asar" : "asar")
          : (stats.watchlist === 1 ? "title" : "titles");
      });

      const current = titles.find((title) => title.watch_status === "Currently Watching");
      const heroTitle = document.getElementById("cinema-hero");
      if (heroTitle) {
        const featured = current || titles.find((title) => title.is_favorite) || titles[0];
        if (featured) {
          document.getElementById("hero-title").textContent = featured.title;
          document.getElementById("hero-description").textContent = featured.description || tr("Sevimli hikoyangizni shu yerdan davom ettiring.", "Continue your favorite story.");
          document.getElementById("hero-meta").innerHTML = `<span>${escape(featured.release_year)}</span><span>${escape(typeText(featured.media_type))}</span><span>${escape(featured.genre)}</span>${featured.imdb_rating ? `<strong>IMDb <b>★ ${escape(featured.imdb_rating)}</b></strong>` : ""}`;
          document.getElementById("hero-backdrop").style.backgroundImage = `linear-gradient(90deg, rgba(6,7,12,.98) 0%, rgba(6,7,12,.72) 42%, rgba(6,7,12,.12) 74%, rgba(6,7,12,.55) 100%), url("${imageUrl(featured.poster_url)}")`;
          document.getElementById("hero-backdrop").style.backgroundPosition = "center 22%";
          document.getElementById("hero-current").textContent = "01";
          document.getElementById("hero-total").textContent = String(stats.total).padStart(2, "0");
          document.getElementById("hero-details").addEventListener("click", () => showDetails(featured.id));
          document.getElementById("hero-watch").addEventListener("click", () => showDetails(featured.id));
        }
      }
      const continueCard = document.getElementById("continue-card");
      if (current) {
        continueCard.innerHTML = `<img class="continue-poster" data-poster src="${imageUrl(current.poster_url)}" alt="${escape(current.title)} poster"><div class="continue-copy"><p class="eyebrow">${tr("HIKOYA DAVOM ETADI", "BACK INTO THE STORY")}</p><h3>${escape(current.title)}</h3><div class="continue-meta">${escape(typeText(current.media_type))} <span>·</span> ${escape(current.release_year)} <span>·</span> ${escape(current.genre)}</div><p>${escape(current.description || tr("Keyingi epizod sizni kutmoqda.", "Your next episode is waiting."))}</p><button class="button button-primary button-small" data-continue="${current.id}">${tr("Tomoshani davom ettirish", "Continue watching")} <span>→</span></button></div>`;
        setPosterFallbacks(continueCard);
        continueCard.querySelector("[data-continue]").addEventListener("click", () => showDetails(current.id));
        continueCard.addEventListener("click", (event) => {
          if (!event.target.closest("button")) showDetails(current.id);
        });
      } else {
        continueCard.innerHTML = `<div class="empty-state" style="width:100%;padding:30px 15px;border:0"><div class="empty-art" style="width:46px;height:46px;font-size:20px">▶</div><h3>${tr("Joriy tomosha yo‘q", "Nothing in progress")}</h3><p>${tr("Hikoyani davom ettirish uchun holatni “Ko‘ryapman” qiling.", "Set a title to “Currently Watching” to continue the story here.")}</p><a class="button button-outline button-small" href="collection.html">${tr("Kinotekani ko‘rish", "Browse collection")} →</a></div>`;
      }

      const recentRoot = document.getElementById("recent-titles");
      const recent = titles.slice(0, 4);
      if (recent.length) {
        recentRoot.innerHTML = recent.map((title) => `<article class="poster-card" data-open-title="${title.id}" tabindex="0"><div class="poster-wrap"><img data-poster src="${imageUrl(title.poster_url)}" alt="${escape(title.title)} poster" loading="lazy"><span class="poster-overlay"></span><span class="poster-type">${escape(typeText(title.media_type))}</span><span class="poster-rating">★ ${title.personal_rating || "—"}</span></div><p class="poster-name">${escape(title.title)}</p><span class="poster-year">${escape(title.release_year)} · ${escape(title.genre)}</span></article>`).join("");
        setPosterFallbacks(recentRoot);
        recentRoot.querySelectorAll("[data-open-title]").forEach((card) => card.addEventListener("click", () => showDetails(card.dataset.openTitle)));
      } else {
        recentRoot.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:26px"><h3>${tr("Kinotekangiz shu yerdan boshlanadi", "Your collection starts here")}</h3><p>${tr("Shaxsiy kinoteka yaratish uchun film yoki serial qo‘shing.", "Add a film or series to build your personal cinema.")}</p><button class="button button-primary button-small" data-open-form>＋ ${tr("Asar qo‘shish", "Add a title")}</button></div>`;
      }

      const favoriteRoot = document.getElementById("favorite-preview");
      const preview = favorites.slice(0, 4);
      if (preview.length) {
        favoriteRoot.innerHTML = preview.map((title) => `<article class="favorite-item" data-open-title="${title.id}" tabindex="0"><img class="favorite-thumb" data-poster src="${imageUrl(title.poster_url)}" alt="" loading="lazy"><div class="favorite-info"><strong>${escape(title.title)}</strong><small>${escape(title.release_year)} · ${escape(title.media_type)}</small></div><span class="favorite-star">★</span></article>`).join("");
        setPosterFallbacks(favoriteRoot);
        favoriteRoot.querySelectorAll("[data-open-title]").forEach((card) => card.addEventListener("click", () => showDetails(card.dataset.openTitle)));
      } else {
        favoriteRoot.innerHTML = `<p class="welcome-sub">${tr("Sevimli hikoyalaringiz shu yerda bo‘ladi. Biror asarda qalb belgisini bosing.", "Your favorite stories will live here. Tap the heart on any title to save it.")}</p>`;
      }
    } catch (error) {
      toast(error.message, "error");
    }
  }

  document.addEventListener("DOMContentLoaded", loadDashboard);
  window.addEventListener("cinevault:changed", loadDashboard);
})();
