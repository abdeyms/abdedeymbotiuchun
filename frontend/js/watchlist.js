(function () {
  const { api, renderCards, toast, tr } = window.CineVault;
  const root = document.getElementById("watchlist-grid");
  async function load() {
    try {
      const titles = await api.watchlist();
      document.getElementById("watchlist-count").textContent = titles.length;
      document.getElementById("watchlist-label").textContent = tr("asar", titles.length === 1 ? "title" : "titles");
      renderCards(root, titles, tr("Ko‘rish rejasi bo‘sh", "Your watchlist is clear"), tr("Ko‘rishni xohlagan asarni qo‘shing yoki tafsilotlar orqali bu yerga o‘tkazing.", "Add something you're excited to watch, or move a title here from its details."));
    } catch (error) {
      toast(error.message, "error");
      root.innerHTML = `<div class="empty-state"><div class="empty-art">!</div><h3>${tr("Ko‘rish rejasini yuklab bo‘lmadi", "Couldn't load your watchlist")}</h3><p>${window.CineVault.escape(error.message)}</p></div>`;
    }
  }
  document.addEventListener("DOMContentLoaded", load);
  window.addEventListener("cinevault:changed", load);
})();
