(function () {
  const API_BASE = window.CINEVAULT_API || "http://127.0.0.1:8000/api";

  async function request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      });
    } catch (error) {
      throw new Error("Cannot reach CineVault API. Start the backend and try again.");
    }
    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const body = await response.json();
        if (typeof body.detail === "string") message = body.detail;
        else if (Array.isArray(body.detail)) message = body.detail.map((item) => item.msg).join(", ");
      } catch (_) {
        // Keep the HTTP status message when the server did not return JSON.
      }
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  const queryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) query.set(key, value);
    });
    return query.toString() ? `?${query}` : "";
  };

  window.CineVaultAPI = {
    list: (params) => request(`/titles${queryString(params)}`),
    get: (id) => request(`/titles/${id}`),
    create: (title) => request("/titles", { method: "POST", body: JSON.stringify(title) }),
    update: (id, title) => request(`/titles/${id}`, { method: "PUT", body: JSON.stringify(title) }),
    remove: (id) => request(`/titles/${id}`, { method: "DELETE" }),
    favorites: () => request("/favorites"),
    favorite: (id) => request(`/favorites/${id}`, { method: "POST" }),
    unfavorite: (id) => request(`/favorites/${id}`, { method: "DELETE" }),
    watchlist: () => request("/watchlist"),
    statistics: () => request("/statistics"),
    export: () => request("/titles/export"),
    import: (titles) => request("/titles/import", { method: "POST", body: JSON.stringify({ titles }) }),
  };
})();
