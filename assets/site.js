(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const search = document.getElementById('toolSearch');
  const list = document.getElementById('toolList');
  if (!search || !list) return;

  const items = Array.from(list.querySelectorAll('li'));
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    for (const li of items) {
      const text = li.innerText.toLowerCase();
      li.style.display = text.includes(q) ? '' : 'none';
    }
  });
})();
