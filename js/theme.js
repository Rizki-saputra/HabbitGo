/* =============================================
   HABITGO — Theme Manager
   ============================================= */

let currentTheme = localStorage.getItem('hg-theme') || 'purple';

function applyTheme(id) {
  currentTheme = id;
  document.documentElement.setAttribute('data-theme', id);
  localStorage.setItem('hg-theme', id);
  const themes = t('themes');
  const theme = themes.find(th => th.id === id) || themes[0];
  const lbl = document.getElementById('currentThemeLabel');
  if (lbl) lbl.textContent = theme.label;
}

function buildThemeGrid() {
  const grid = document.getElementById('themeGrid');
  if (!grid) return;
  const themes = t('themes');
  grid.innerHTML = themes.map(th => `
    <div class="theme-opt ${th.id === currentTheme ? 'active' : ''}" onclick="selectTheme('${th.id}')">
      <div class="theme-swatch" style="background:${th.gradient}">
        ${th.id === currentTheme ? '<i class="bi bi-check2-lg"></i>' : ''}
      </div>
      <span class="theme-opt-name">${th.label}</span>
    </div>
  `).join('');
}

function selectTheme(id) {
  applyTheme(id);
  buildThemeGrid();
  closeThemePicker();
  showToast(t('theme_changed'));
}

function openThemePicker() {
  buildThemeGrid();
  document.getElementById('themeModal').classList.remove('hidden');
}
function closeThemePicker() {
  document.getElementById('themeModal').classList.add('hidden');
}
