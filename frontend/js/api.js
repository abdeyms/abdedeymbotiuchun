(function () {
  const STORAGE_KEY = "cinevault.collection.v1";

  const seedTitles = [
    {
      id: 1,
      title: "Dune: Part Two",
      poster_url: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      trailer_url: "",
      stream_url: "",
      description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      release_year: 2024,
      genre: "Sci-Fi",
      media_type: "Movie",
      director: "Denis Villeneuve",
      cast: "Timothee Chalamet, Zendaya, Rebecca Ferguson",
      imdb_rating: 8.5,
      personal_rating: 9,
      watch_status: "Completed",
      seasons: null,
      episodes: null,
      personal_notes: "",
      date_added: "2026-01-01",
      is_favorite: true,
    },
    {
      id: 2,
      title: "The Bear",
      poster_url: "https://image.tmdb.org/t/p/w500/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
      trailer_url: "",
      stream_url: "",
      description: "A young chef returns to Chicago to run his family's sandwich shop.",
      release_year: 2022,
      genre: "Drama",
      media_type: "TV Series",
      director: "Christopher Storer",
      cast: "Jeremy Allen White, Ayo Edebiri, Ebon Moss-Bachrach",
      imdb_rating: 8.6,
      personal_rating: 8,
      watch_status: "Currently Watching",
      seasons: 3,
      episodes: 28,
      personal_notes: "",
      date_added: "2026-01-02",
      is_favorite: false,
    },
    {
      id: 3,
      title: "Blade Runner 2049",
      poster_url: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
      trailer_url: "",
      stream_url: "",
      description: "A young blade runner discovers a secret that could plunge what's left of society into chaos.",
      release_year: 2017,
      genre: "Sci-Fi",
      media_type: "Movie",
      director: "Denis Villeneuve",
      cast: "Ryan Gosling, Harrison Ford, Ana de Armas",
      imdb_rating: 8.0,
      personal_rating: 9,
      watch_status: "Want to Watch",
      seasons: null,
      episodes: null,
      personal_notes: "",
      date_added: "2026-01-03",
      is_favorite: false,
    },
    {
      id: 4,
      title: "Severance",
      poster_url: "https://image.tmdb.org/t/p/w500/lFf6LLrQjYldcZItzOkGmMMigP7.jpg",
      trailer_url: "",
      stream_url: "",
      description: "Employees at a company undergo a procedure that separates their work and personal memories.",
      release_year: 2022,
      genre: "Thriller",
      media_type: "TV Series",
      director: "Ben Stiller",
      cast: "Adam Scott, Britt Lower, Patricia Arquette",
      imdb_rating: 8.7,
      personal_rating: 10,
      watch_status: "Want to Watch",
      seasons: 2,
      episodes: 19,
      personal_notes: "",
      date_added: "2026-01-04",
      is_favorite: true,
    },
  ];

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (_) {}
    save(seedTitles);
    return seedTitles.map((title) => ({ ...title }));
  }

  function save(titles) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
  }

  function normalize(title, id) {
    return {
      id,
      title: String(title.title || "").trim(),
      poster_url: String(title.poster_url || "").trim(),
      trailer_url: String(title.trailer_url || "").trim(),
      stream_url: String(title.stream_url || "").trim(),
      description: String(title.description || ""),
      release_year: Number(title.release_year),
      genre: String(title.genre || "Uncategorized"),
      media_type: title.media_type === "TV Series" ? "TV Series" : "Movie",
      director: String(title.director || ""),
      cast: String(title.cast || ""),
      imdb_rating: title.imdb_rating === null || title.imdb_rating === undefined || title.imdb_rating === "" ? null : Number(title.imdb_rating),
      personal_rating: title.personal_rating === null || title.personal_rating === undefined || title.personal_rating === "" ? null : Number(title.personal_rating),
      watch_status: title.watch_status || "Want to Watch",
      seasons: title.seasons === null || title.seasons === undefined || title.seasons === "" ? null : Number(title.seasons),
      episodes: title.episodes === null || title.episodes === undefined || title.episodes === "" ? null : Number(title.episodes),
      personal_notes: String(title.personal_notes || ""),
      date_added: title.date_added || new Date().toISOString().slice(0, 10),
      is_favorite: Boolean(title.is_favorite),
    };
  }

  function fail(message) {
    throw new Error(message);
  }

  async function list(params = {}) {
    let titles = load();
    const search = String(params.search || "").trim().toLowerCase();
    if (search) {
      titles = titles.filter((title) =>
        [title.title, title.genre, title.cast].some((value) => String(value || "").toLowerCase().includes(search))
      );
    }
    if (params.media_type) titles = titles.filter((title) => title.media_type === params.media_type);
    if (params.genre) titles = titles.filter((title) => String(title.genre).toLowerCase().includes(String(params.genre).toLowerCase()));
    if (params.year) titles = titles.filter((title) => String(title.release_year) === String(params.year));
    if (params.min_rating) titles = titles.filter((title) => (title.personal_rating || 0) >= Number(params.min_rating));
    if (params.status) titles = titles.filter((title) => title.watch_status === params.status);

    const sort = params.sort || "newest";
    titles.sort((a, b) => {
      if (sort === "oldest") return a.date_added.localeCompare(b.date_added) || a.id - b.id;
      if (sort === "rating") return (b.personal_rating || 0) - (a.personal_rating || 0) || a.title.localeCompare(b.title);
      if (sort === "alphabetical") return a.title.localeCompare(b.title);
      if (sort === "year") return b.release_year - a.release_year || a.title.localeCompare(b.title);
      return b.date_added.localeCompare(a.date_added) || b.id - a.id;
    });

    const offset = Number(params.offset || 0);
    const limit = Number(params.limit || 100);
    return titles.slice(offset, offset + limit);
  }

  async function get(id) {
    const title = load().find((item) => item.id === Number(id));
    if (!title) fail("Title not found");
    return title;
  }

  async function create(title) {
    const titles = load();
    if (!title.title || !title.title.trim()) fail("Title cannot be blank");
    if (!title.release_year || !title.media_type) fail("Release year and media type are required");
    const id = titles.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
    const created = normalize(title, id);
    titles.push(created);
    save(titles);
    return created;
  }

  async function update(id, title) {
    const titles = load();
    const index = titles.findIndex((item) => item.id === Number(id));
    if (index < 0) fail("Title not found");
    if (!title.title || !title.title.trim()) fail("Title cannot be blank");
    titles[index] = normalize({ ...title, is_favorite: titles[index].is_favorite }, Number(id));
    save(titles);
    return titles[index];
  }

  async function remove(id) {
    const titles = load();
    if (!titles.some((item) => item.id === Number(id))) fail("Title not found");
    save(titles.filter((item) => item.id !== Number(id)));
    return null;
  }

  async function setFavorite(id, favorite) {
    const titles = load();
    const title = titles.find((item) => item.id === Number(id));
    if (!title) fail("Title not found");
    title.is_favorite = favorite;
    save(titles);
    return title;
  }

  async function importTitles(items) {
    const titles = load();
    let nextId = titles.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
    const imported = items.map((item) => {
      const title = normalize(item, nextId++);
      titles.push(title);
      return title;
    });
    save(titles);
    return imported;
  }

  async function statistics() {
    const titles = load();
    const count = (kind, status) => titles.filter((title) =>
      (!kind || title.media_type === kind) && (!status || title.watch_status === status)
    ).length;
    const ratings = titles.map((title) => title.personal_rating).filter((rating) => rating !== null);
    const byStatus = {};
    ["Want to Watch", "Currently Watching", "Completed", "On Hold", "Dropped"].forEach((status) => {
      byStatus[status] = count(null, status);
    });
    return {
      total: titles.length,
      movies: count("Movie"),
      series: count("TV Series"),
      currently_watching: count(null, "Currently Watching"),
      completed: count(null, "Completed"),
      completed_movies: count("Movie", "Completed"),
      completed_series: count("TV Series", "Completed"),
      watchlist: count(null, "Want to Watch"),
      favorites: titles.filter((title) => title.is_favorite).length,
      by_status: byStatus,
      average_rating: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null,
    };
  }

  const queryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) query.set(key, value);
    });
    return query.toString() ? `?${query}` : "";
  };

  const localAPI = {
    list: (params) => list(params),
    get,
    create,
    update,
    remove,
    favorites: () => load().filter((title) => title.is_favorite).sort((a, b) => a.title.localeCompare(b.title)),
    favorite: (id) => setFavorite(id, true),
    unfavorite: (id) => setFavorite(id, false),
    watchlist: () => load().filter((title) => title.watch_status === "Want to Watch").sort((a, b) => b.date_added.localeCompare(a.date_added) || b.id - a.id),
    statistics,
    export: () => [...load()].sort((a, b) => a.id - b.id),
    import: (titles) => importTitles(titles),
  };

  const apiBase = String(window.CINEVAULT_API || "").trim().replace(/\/+$/, "");
  let adminToken = "";

  async function remoteRequest(path, options = {}) {
    const method = options.method || "GET";
    const adminOnly = Boolean(options.adminOnly);

    if (adminOnly && !adminToken) {
      adminToken = String(window.prompt("Admin token:") || "").trim();
      if (!adminToken) throw new Error("Admin token kiritilmadi.");
    }

    const send = (token) => {
      const headers = {};
      if (options.body !== undefined) headers["Content-Type"] = "application/json";
      if (adminOnly) headers.Authorization = `Bearer ${token}`;
      return fetch(`${apiBase}${path}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    };

    let response;
    try {
      response = await send(adminToken);
      if (adminOnly && response.status === 401) {
        adminToken = String(window.prompt("Admin token noto‘g‘ri. Qayta kiriting:") || "").trim();
        if (!adminToken) throw new Error("Admin token kiritilmadi.");
        response = await send(adminToken);
        if (response.status === 401) adminToken = "";
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Admin token")) throw error;
      throw new Error("Serverga ulanib bo‘lmadi. Internet va API manzilini tekshiring.");
    }

    if (!response.ok) {
      let payload = {};
      try {
        payload = await response.json();
      } catch (_) {}
      const detail = payload.detail;
      const message = Array.isArray(detail)
        ? detail.map((item) => item.msg).join("; ")
        : (detail || `Server xatosi (${response.status})`);
      throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
  }

  const remoteAPI = {
    list: (params = {}) => remoteRequest(`/titles${queryString(params)}`),
    get: (id) => remoteRequest(`/titles/${encodeURIComponent(id)}`),
    create: (title) => remoteRequest("/titles", { method: "POST", body: title, adminOnly: true }),
    update: (id, title) => remoteRequest(`/titles/${encodeURIComponent(id)}`, { method: "PUT", body: title, adminOnly: true }),
    remove: (id) => remoteRequest(`/titles/${encodeURIComponent(id)}`, { method: "DELETE", adminOnly: true }),
    favorites: () => remoteRequest("/favorites"),
    favorite: (id) => remoteRequest(`/favorites/${encodeURIComponent(id)}`, { method: "POST", adminOnly: true }),
    unfavorite: (id) => remoteRequest(`/favorites/${encodeURIComponent(id)}`, { method: "DELETE", adminOnly: true }),
    watchlist: () => remoteRequest("/watchlist"),
    statistics: () => remoteRequest("/statistics"),
    export: () => remoteRequest("/titles/export"),
    import: (titles) => remoteRequest("/titles/import", { method: "POST", body: { titles }, adminOnly: true }),
  };

  window.CineVaultAPI = apiBase ? remoteAPI : localAPI;
})();
