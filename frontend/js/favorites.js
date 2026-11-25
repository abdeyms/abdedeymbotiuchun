(function () {
  const { api, renderCards, toast, tr } = window.CineVault;
  const root = document.getElementById("favorite-grid");
  async function load() {
    try {
      const titles = await api.favorites();
      renderCards(root, titles, tr("Sevimlilar hali yo‘q", "No favorites yet"), tr("Eng yoqtirgan asaringizni qalb belgisi orqali bu yerga qo‘shing.", "Save the titles you love most by tapping the heart on any poster."));
    } catch (error) {
      toast(error.message, "error");
      root.innerHTML = `<div class="empty-state"><div class="empty-art">!</div><h3>${tr("Sevimlilarni yuklab bo‘lmadi", "Couldn't load favorites")}</h3><p>${window.CineVault.escape(error.message)}</p></div>`;
    }
  }
  document.addEventListener("DOMContentLoaded", load);
  window.addEventListener("cinevault:changed", load);
})();
