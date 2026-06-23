/* =============================================
   HABITGO — Analytics
   ============================================= */

let chartInstances = {};

function destroyCharts() {
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};
}

const CHART_DEFAULTS = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#6B5B8A', font: { family: 'Plus Jakarta Sans', size: 11 } } },
    y: { grid: { color: 'rgba(124,58,237,0.07)' }, ticks: { color: '#6B5B8A', font: { family: 'Plus Jakarta Sans', size: 11 } }, beginAtZero: true }
  }
};

function renderAnalytics() {
  destroyCharts();

  const cats = t('categories');
  const totalCI = totalCheckins();
  const bestSt = overallBestStreak();
  const avgRate = state.habits.length
    ? Math.round(state.habits.reduce((s, h) => s + getCompletionRate(h.id, 7), 0) / state.habits.length)
    : 0;

  // Insight chips
  document.getElementById('insightRow').innerHTML = [
    { icon: 'bi-graph-up',   bg: 'linear-gradient(135deg,#7C3AED,#A855F7)', val: avgRate+'%', lbl: t('avg_7d') },
    { icon: 'bi-fire',       bg: 'linear-gradient(135deg,#F59E0B,#FBBF24)', val: bestSt,       lbl: t('best_streak_stat') },
    { icon: 'bi-check2-all', bg: 'linear-gradient(135deg,#10B981,#34D399)', val: totalCI,      lbl: t('total_checkins') }
  ].map(s => `
    <div class="insight-chip glass-card">
      <div class="insight-chip-icon" style="background:${s.bg}"><i class="bi ${s.icon}"></i></div>
      <div class="insight-val">${s.val}</div>
      <div class="insight-lbl">${s.lbl}</div>
    </div>
  `).join('');

  // 7-day completion bar chart
  const labels7 = [], data7 = [];
  const days = t('days_short');
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const due = state.habits.filter(h => isDueOn(h, ds));
    const done = due.filter(h => !!(state.logs[h.id]||{})[ds]);
    labels7.push(days[d.getDay()]);
    data7.push(due.length ? Math.round((done.length / due.length) * 100) : 0);
  }
  const ctx7 = document.getElementById('chartWeekly').getContext('2d');
  const grad7 = ctx7.createLinearGradient(0, 0, 0, 160);
  grad7.addColorStop(0, 'rgba(124,58,237,0.9)');
  grad7.addColorStop(1, 'rgba(168,85,247,0.5)');
  chartInstances.weekly = new Chart(ctx7, {
    type: 'bar',
    data: { labels: labels7, datasets: [{ data: data7, backgroundColor: grad7, borderRadius: 8, borderSkipped: false }] },
    options: { ...CHART_DEFAULTS, plugins: { legend: { display: false } } }
  });

  // Category doughnut
  const catData = cats.map(c => ({ label: c.label, color: c.color, count: state.habits.filter(h => h.category === c.id).length })).filter(c => c.count > 0);
  const ctxCat = document.getElementById('chartCategory').getContext('2d');
  chartInstances.category = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: catData.map(c => c.label),
      datasets: [{ data: catData.map(c => c.count), backgroundColor: catData.map(c => c.color), borderWidth: 0, hoverOffset: 8 }]
    },
    options: {
      cutout: '65%',
      plugins: { legend: { display: true, position: 'right', labels: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#6B5B8A', boxWidth: 12, padding: 12 } } }
    }
  });

  // Top streaks horizontal bar
  const streakData = state.habits.map(h => ({ name: h.name, streak: getStreak(h.id) }))
    .sort((a, b) => b.streak - a.streak).slice(0, 6);
  const ctxSt = document.getElementById('chartStreaks').getContext('2d');
  chartInstances.streaks = new Chart(ctxSt, {
    type: 'bar',
    data: {
      labels: streakData.map(s => s.name.length > 14 ? s.name.slice(0,12)+'…' : s.name),
      datasets: [{ data: streakData.map(s => s.streak), backgroundColor: 'rgba(245,158,11,0.85)', borderRadius: 6, borderSkipped: false }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(124,58,237,0.07)' }, ticks: { color: '#6B5B8A', font: { family: 'Plus Jakarta Sans', size: 11 } }, beginAtZero: true },
        y: { grid: { display: false }, ticks: { color: '#6B5B8A', font: { family: 'Plus Jakarta Sans', size: 11 } } }
      }
    }
  });
}
