/* =============================================
   HABITGO — Habits
   ============================================= */

const HABIT_ICONS = [
  'bi-droplet','bi-lightning-charge','bi-book','bi-heart-pulse','bi-bicycle',
  'bi-moon-stars','bi-apple','bi-music-note','bi-pencil','bi-camera',
  'bi-code-slash','bi-cup-hot','bi-flower1','bi-graph-up','bi-piggy-bank',
  'bi-people','bi-trophy','bi-sun','bi-alarm','bi-fire',
  'bi-brush','bi-dumbbell','bi-journal','bi-mortarboard','bi-phone'
];

function buildIconGrid() {
  const grid = document.getElementById('iconGrid');
  if (!grid) return;
  grid.innerHTML = HABIT_ICONS.map(ic => `
    <button type="button" class="icon-opt ${ic === state.selectedIcon ? 'active' : ''}"
      onclick="selectIcon('${ic}')">
      <i class="bi ${ic}"></i>
    </button>
  `).join('');
}

function selectIcon(ic) {
  state.selectedIcon = ic;
  document.querySelectorAll('.icon-opt').forEach(el => {
    el.classList.toggle('active', el.querySelector('i').className.includes(ic));
  });
}

function buildCategoryGrid() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;
  const cats = t('categories');
  if (!state.selectedCategory) state.selectedCategory = cats[0].id;
  grid.innerHTML = cats.map(c => `
    <button type="button" class="chip ${c.id === state.selectedCategory ? 'active' : ''}"
      onclick="selectCategory('${c.id}')"
      style="${c.id === state.selectedCategory ? '' : `--chip-color:${c.color}`}">
      <i class="bi ${c.icon}"></i>${c.label}
    </button>
  `).join('');
}

function selectCategory(id) {
  state.selectedCategory = id;
  buildCategoryGrid();
}

function buildDaysGrid() {
  const wrap = document.getElementById('dayChips');
  if (!wrap) return;
  const days = t('days_short');
  wrap.innerHTML = days.map((d, i) => `
    <button type="button" class="day-chip ${state.selectedDays.includes(i) ? 'active' : ''}"
      onclick="toggleDay(${i})">${d}</button>
  `).join('');
}

function toggleDay(i) {
  if (state.selectedDays.includes(i)) {
    state.selectedDays = state.selectedDays.filter(d => d !== i);
  } else {
    state.selectedDays = [...state.selectedDays, i].sort();
  }
  buildDaysGrid();
}

function setFreq(f) {
  state.selectedFreq = f;
  document.getElementById('freqDaily').classList.toggle('active', f === 'daily');
  document.getElementById('freqCustom').classList.toggle('active', f === 'weekly');
  document.getElementById('dayChips').classList.toggle('hidden', f !== 'weekly');
}

function openHabitModal(habitId) {
  state.editingHabitId = habitId;
  const cats = t('categories');
  if (!state.selectedCategory) state.selectedCategory = cats[0].id;

  if (habitId) {
    const h = state.habits.find(x => x.id === habitId);
    document.getElementById('habitModalTitle').textContent = t('edit_habit');
    document.getElementById('habitName').value = h.name;
    state.selectedIcon = h.icon;
    state.selectedCategory = h.category;
    state.selectedFreq = h.frequency || 'daily';
    state.selectedDays = h.days || [1,2,3,4,5];
    document.getElementById('deleteBtn').classList.remove('hidden');
  } else {
    document.getElementById('habitModalTitle').textContent = t('new_habit');
    document.getElementById('habitName').value = '';
    state.selectedIcon = HABIT_ICONS[0];
    state.selectedCategory = cats[0].id;
    state.selectedFreq = 'daily';
    state.selectedDays = [1,2,3,4,5];
    document.getElementById('deleteBtn').classList.add('hidden');
  }

  document.getElementById('deleteRow').classList.add('hidden');
  document.getElementById('habitName').placeholder = t('habit_placeholder');
  buildIconGrid();
  buildCategoryGrid();
  buildDaysGrid();
  setFreq(state.selectedFreq);
  document.getElementById('habitModal').classList.remove('hidden');
}

function closeHabitModal() {
  document.getElementById('habitModal').classList.add('hidden');
}

function askDeleteHabit() { document.getElementById('deleteRow').classList.remove('hidden'); }
function cancelDelete() { document.getElementById('deleteRow').classList.add('hidden'); }

async function handleSaveHabit(e) {
  e.preventDefault();
  const name = document.getElementById('habitName').value.trim();
  if (!name) return;
  if (state.selectedFreq === 'weekly' && state.selectedDays.length === 0) {
    showToast(t('pick_one_day')); return;
  }

  const payload = {
    name, icon: state.selectedIcon, category: state.selectedCategory,
    frequency: state.selectedFreq,
    days: state.selectedFreq === 'weekly' ? [...state.selectedDays] : null
  };

  if (state.editingHabitId) {
    const { error } = await sb.from('habits').update(payload)
      .eq('id', state.editingHabitId).eq('user_id', state.user.id);
    if (error) { showToast('Save failed'); return; }
    const h = state.habits.find(x => x.id === state.editingHabitId);
    Object.assign(h, payload);
  } else {
    const { data, error } = await sb.from('habits')
      .insert({ ...payload, user_id: state.user.id }).select().single();
    if (error) { showToast('Save failed'); return; }
    state.habits.push({ id: data.id, ...payload, createdAt: (data.created_at||'').slice(0,10) });
  }

  closeHabitModal();
  renderCurrentPage();
  showToast(t('habit_saved'));
}

async function confirmDeleteHabit() {
  const { error } = await sb.from('habits').delete()
    .eq('id', state.editingHabitId).eq('user_id', state.user.id);
  if (error) { showToast('Delete failed'); return; }
  state.habits = state.habits.filter(h => h.id !== state.editingHabitId);
  delete state.logs[state.editingHabitId];
  closeHabitModal();
  renderCurrentPage();
  showToast(t('habit_deleted'));
}

async function toggleHabit(habitId, e) {
  e && e.stopPropagation();
  const today = todayStr();
  const done = !!(state.logs[habitId] || {})[today];

  if (done) {
    delete (state.logs[habitId] || {})[today];
    await sb.from('habit_logs').delete()
      .eq('habit_id', habitId).eq('log_date', today).eq('user_id', state.user.id);
  } else {
    if (!state.logs[habitId]) state.logs[habitId] = {};
    state.logs[habitId][today] = true;
    await sb.from('habit_logs')
      .insert({ habit_id: habitId, user_id: state.user.id, log_date: today });
  }
  renderDashboard();
  if (state.currentPage === 'habits') renderHabitsPage();
}

/* ---- Render helpers ---- */
function getCat(id) {
  const cats = t('categories');
  return cats.find(c => c.id === id) || cats[cats.length - 1];
}

function habitCardHTML(h, withCheck) {
  const cat = getCat(h.category);
  const streak = getStreak(h.id);
  const rate = getCompletionRate(h.id, 7);
  const today = todayStr();
  const done = !!(state.logs[h.id] || {})[today];

  return `
    <div class="habit-item" onclick="${withCheck ? '' : `openHabitModal('${h.id}')`}">
      <div class="habit-icon-wrap" style="background:${cat.color}22; color:${cat.color}">
        <i class="bi ${h.icon}"></i>
      </div>
      <div class="habit-item-info">
        <div class="habit-item-name">${escHTML(h.name)}</div>
        <div class="habit-item-meta">
          <i class="bi bi-fire fire"></i>
          ${t('streak', streak)} · ${t('rate_7d', rate)}
        </div>
        <div class="habit-prog">
          <div class="habit-prog-fill" style="width:${rate}%; background:linear-gradient(90deg,${cat.color}88,${cat.color})"></div>
        </div>
      </div>
      ${withCheck
        ? `<button class="habit-check-btn ${done ? 'done' : ''}" onclick="toggleHabit('${h.id}', event)" aria-label="Mark done">
             <i class="bi bi-check-lg"></i>
           </button>`
        : `<i class="bi bi-chevron-right" style="color:var(--text-2);font-size:14px"></i>`
      }
    </div>
  `;
}

function renderDashboard() {
  const today = todayStr();
  const dueToday = getDueToday();
  const doneToday = dueToday.filter(h => !!(state.logs[h.id] || {})[today]);
  const pct = dueToday.length ? Math.round((doneToday.length / dueToday.length) * 100) : 0;
  const circ = 213.6;

  // Hero ring
  document.getElementById('heroPct').textContent = pct + '%';
  document.getElementById('heroRingFill').style.strokeDashoffset = circ - (circ * pct / 100);
  document.getElementById('heroTitle').textContent = t('done_of', doneToday.length, dueToday.length);
  document.getElementById('heroSub').textContent =
    dueToday.length === 0 ? t('no_habit_today') :
    pct === 100 ? t('all_done') : t('lets_go');

  // Stats
  document.getElementById('heroBestStreak').textContent = overallBestStreak();
  document.getElementById('heroTotalDone').textContent = totalCheckins();
  document.getElementById('heroActiveHabits').textContent = state.habits.length;

  // Category pills
  const cats = t('categories');
  const catScroll = document.getElementById('catScroll');
  const catCounts = cats.map(c => ({ ...c, count: state.habits.filter(h => h.category === c.id).length })).filter(c => c.count > 0);
  catScroll.innerHTML = catCounts.map(c => `
    <div class="cat-pill glass-card">
      <div class="cat-pill-icon" style="background:${c.color}"><i class="bi ${c.icon}"></i></div>
      <div class="cat-pill-count" style="color:${c.color}">${c.count}</div>
      <div class="cat-pill-label">${c.label}</div>
    </div>
  `).join('');

  // Today's habit list
  const list = document.getElementById('todayList');
  if (dueToday.length === 0) {
    list.innerHTML = `<div class="empty-wrap">
      <div class="empty-icon"><i class="bi bi-calendar2-check"></i></div>
      <h3>${t('no_habit_today')}</h3>
    </div>`;
  } else {
    list.innerHTML = dueToday.map(h => habitCardHTML(h, true)).join('');
  }
}

function renderHabitsPage() {
  const list = document.getElementById('allHabitList');
  const empty = document.getElementById('habitsEmpty');
  if (state.habits.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    list.innerHTML = state.habits.map(h => habitCardHTML(h, false)).join('');
  }
}

function escHTML(str) {
  const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}
