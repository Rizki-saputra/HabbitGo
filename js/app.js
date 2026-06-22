/* =============================================
   HABITGO — App Core
   ============================================= */

// ---- Init ----
window.addEventListener('DOMContentLoaded', async () => {
  // Apply saved theme + lang immediately
  applyTheme(localStorage.getItem('hg-theme') || 'purple');
  applyLangToUI();

  // Splash → then check session
  setTimeout(async () => {
    const { data } = await sb.auth.getSession();
    document.getElementById('splashScreen').classList.add('hide');

    setTimeout(async () => {
      document.getElementById('splashScreen').style.display = 'none';
      if (data.session) {
        state.user = data.session.user;
        await loadUserData();
        showApp();
      } else {
        document.getElementById('authScreen').classList.remove('hidden');
        applyLangToUI();
      }
    }, 500);
  }, 1600);
});

// ---- Show app ----
function showApp() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderHeader();
  switchPage('dashboard');
}

// ---- Header ----
function renderHeader() {
  const profile = state.profile;
  const name = profile?.name || state.user?.email?.split('@')[0] || '?';
  const hour = getHour();
  const greeting = hour < 12 ? t('good_morning') : hour < 17 ? t('good_afternoon') : t('good_evening');

  document.getElementById('headerGreeting').textContent = greeting;
  document.getElementById('headerName').textContent = `Hey, ${name} 👋`;
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = state.user?.email || '';
  document.getElementById('memberSince').textContent = formatDate((profile?.created_at || '').slice(0,10));

  // Joined badge
  const joined = (profile?.created_at || '').slice(0, 7) || '—';
  document.getElementById('profJoined').textContent = joined;

  renderAvatars(profile?.avatar_url || null);
  updateProfileBadges();
}

function updateProfileBadges() {
  document.getElementById('profStreak').textContent = overallBestStreak();
  document.getElementById('profCheckins').textContent = totalCheckins();
}

// ---- Page switching ----
function switchPage(page) {
  state.currentPage = page;

  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-' + page).classList.remove('hidden');

  document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'habits':    renderHabitsPage(); break;
    case 'groups':    renderGroupsPage(); break;
    case 'analytics': renderAnalytics(); break;
    case 'profile':   updateProfileBadges(); applyLangToUI(); applyTheme(currentTheme); break;
  }
}

function renderCurrentPage() {
  switchPage(state.currentPage);
}

// ---- Toast ----
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2500);
}

// ---- PWA Service Worker ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
