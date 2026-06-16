  /* ================= DATA ================= */
  const CATEGORIES = [
    { id:'kesehatan',     label:'Kesehatan',     color:'#10B981', icon:'bi-heart-pulse' },
    { id:'produktivitas', label:'Produktivitas', color:'#3B82F6', icon:'bi-kanban' },
    { id:'belajar',       label:'Belajar',       color:'#8B5CF6', icon:'bi-mortarboard' },
    { id:'keuangan',      label:'Keuangan',      color:'#F59E0B', icon:'bi-piggy-bank' },
    { id:'lainnya',       label:'Lainnya',       color:'#6B7280', icon:'bi-grid-3x3-gap' }
  ];

  const THEMES = [
    { id:'green',  label:'Hijau',     gradient:'linear-gradient(135deg,#0F766E,#14B8A6)' },
    { id:'blue',   label:'Biru',      gradient:'linear-gradient(135deg,#2563EB,#60A5FA)' },
    { id:'red',    label:'Merah',     gradient:'linear-gradient(135deg,#DC2626,#F87171)' },
    { id:'purple', label:'Ungu',      gradient:'linear-gradient(135deg,#7C3AED,#A78BFA)' },
    { id:'yellow', label:'Kuning',    gradient:'linear-gradient(135deg,#A16207,#EAB308)' },
    { id:'pink',   label:'Soft Pink', gradient:'linear-gradient(135deg,#DB2777,#F472B6)' }
  ];

  const HABIT_ICONS = [
    { icon:'bi-droplet',           label:'Minum Air' },
    { icon:'bi-book',              label:'Membaca' },
    { icon:'bi-heart-pulse',       label:'Kesehatan' },
    { icon:'bi-bicycle',           label:'Olahraga' },
    { icon:'bi-moon-stars',        label:'Tidur Cukup' },
    { icon:'bi-sun',                label:'Bangun Pagi' },
    { icon:'bi-wallet2',           label:'Menabung' },
    { icon:'bi-pencil-square',     label:'Menulis' },
    { icon:'bi-laptop',            label:'Kerja / Belajar' },
    { icon:'bi-music-note-beamed', label:'Latihan Musik' },
    { icon:'bi-brush',             label:'Seni' },
    { icon:'bi-globe',             label:'Bahasa Asing' },
    { icon:'bi-cup-hot',           label:'Kurangi Kafein' },
    { icon:'bi-tree',              label:'Jalan Kaki' },
    { icon:'bi-egg-fried',         label:'Makan Sehat' },
    { icon:'bi-people',            label:'Bersosialisasi' },
    { icon:'bi-phone',             label:'Batasi HP' },
    { icon:'bi-controller',        label:'Batasi Game' },
    { icon:'bi-alarm',             label:'Rutinitas' },
    { icon:'bi-star',              label:'Lainnya' }
  ];

  const DAY_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const DAY_FULL  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const MONTHS    = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  /* ================= STATE ================= */
  let state = {
    user: null,
    account: null,
    habits: [],
    logs: {},
    currentPage: 'dashboard',
    editingHabitId: null,
    selectedIcon: HABIT_ICONS[0].icon,
    selectedCategory: CATEGORIES[0].id,
    selectedFreq: 'daily',
    selectedDays: [1,2,3,4,5]
  };
  let chartInstances = {};
  let toastTimeout = null;

  /* ================= SUPABASE ================= */
  // TODO: ganti dengan Project URL & anon key dari Settings > API project Supabase-mu
  const SUPABASE_URL = 'https://ewmymmfwcqicsvjzgtws.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bXltbWZ3Y3FpY3N2anpndHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDA3OTEsImV4cCI6MjA5NzExNjc5MX0.eF4wnpK5iiS_Rag3ysW4yBQTdbGdPkMIxYbV0OAwG5A';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* ================= DATE HELPERS ================= */
  function formatDate(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function todayStr(){ return formatDate(new Date()); }
  function formatIndoDate(dateStr, withDay=false){
    const [y,m,d] = dateStr.split('-').map(Number);
    const date = new Date(y, m-1, d);
    let s = `${d} ${MONTHS[m-1]} ${y}`;
    if(withDay) s = `${DAY_FULL[date.getDay()]}, ${s}`;
    return s;
  }
  function escapeHTML(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ================= INIT ================= */
  window.addEventListener('DOMContentLoaded', init);
  async function init(){
    buildIconGrid();
    buildCategoryGrid();
    buildDaysGrid();
    buildThemeGrid();

    applyTheme(localStorage.getItem('konsisten-theme') || 'green');

    const { data } = await sb.auth.getSession();
    if(data.session){
      await loadSessionData(data.session.user);
      showApp();
    }
    // Jika tidak ada session, layar login (authScreen) tetap tampil (default).
  }

  /* ================= AUTH ================= */
  function togglePassword(inputId, btn){
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if(input.type === 'password'){
      input.type = 'text';
      icon.className = 'bi bi-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'bi bi-eye';
    }
  }

  function showError(id, msg){
    const el = document.getElementById(id);
    el.querySelector('span').textContent = msg;
    el.classList.remove('hidden');
  }
  function hideError(id){
    document.getElementById(id).classList.add('hidden');
  }

  async function handleLogin(e){
    e.preventDefault();
    hideError('loginError');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const btn = document.getElementById('loginSubmitBtn');
    btn.disabled = true;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false;

    if(error){
      showError('loginError', 'Email atau kata sandi salah. Coba lagi.');
      return;
    }
    await loadSessionData(data.user);
    showApp();
  }

  async function handleLogout(){
    await sb.auth.signOut();
    state.user = null;
    state.account = null;
    state.habits = [];
    state.logs = {};
    document.getElementById('app').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('loginPassword').value = '';
    hideError('loginError');
  }

  async function loadSessionData(user){
    state.user = user;
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    state.account = {
      name: (profile && profile.name) || (user.email || '').split('@')[0],
      email: user.email,
      createdAt: ((profile && profile.created_at) || user.created_at || todayStr()).slice(0,10)
    };
    await loadAppData();
  }

  async function loadAppData(){
    const { data: habits } = await sb.from('habits').select('*').eq('user_id', state.user.id).order('created_at');
    state.habits = (habits || []).map(h => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      category: h.category,
      frequency: h.frequency,
      days: h.days,
      createdAt: (h.created_at || '').slice(0,10)
    }));

    const { data: logs } = await sb.from('habit_logs').select('habit_id, log_date').eq('user_id', state.user.id);
    state.logs = {};
    (logs || []).forEach(l => {
      if(!state.logs[l.habit_id]) state.logs[l.habit_id] = {};
      state.logs[l.habit_id][l.log_date] = true;
    });
  }

  function showApp(){
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    const initials = state.account.name.trim().split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase();
    document.getElementById('headerAvatar').textContent = initials;
    document.getElementById('profileAvatar').textContent = initials;
    document.getElementById('profileName').textContent = state.account.name;
    document.getElementById('profileEmail').textContent = state.account.email;
    document.getElementById('joinDate').textContent = formatIndoDate(state.account.createdAt || todayStr());
    document.getElementById('greetingText').textContent = `Halo, ${state.account.name.split(' ')[0]}!`;
    document.getElementById('dateText').textContent = formatIndoDate(todayStr(), true);

    switchPage('dashboard');
  }

  /* ================= NAVIGATION ================= */
  function switchPage(page){
    state.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + page).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));

    if(page === 'dashboard') renderDashboard();
    if(page === 'habits') renderHabitsPage();
    if(page === 'analytics') renderAnalytics();
    if(page === 'profile') renderProfile();
  }

  /* ================= HABIT LOGIC ================= */
  function isDueOn(habit, dateStr){
    if(habit.frequency === 'daily') return true;
    const [y,m,d] = dateStr.split('-').map(Number);
    const day = new Date(y, m-1, d).getDay();
    return (habit.days || []).includes(day);
  }
  function getDueHabitsForDate(habits, dateStr){
    return habits.filter(h => isDueOn(h, dateStr));
  }
  function getStreak(habitId){
    const logs = state.logs[habitId] || {};
    let streak = 0;
    let d = new Date();
    if(!logs[formatDate(d)]) d.setDate(d.getDate() - 1);
    while(logs[formatDate(d)]){
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }
  function getCompletionRate(habitId, days){
    const logs = state.logs[habitId] || {};
    let done = 0;
    let d = new Date();
    for(let i=0; i<days; i++){
      if(logs[formatDate(d)]) done++;
      d.setDate(d.getDate() - 1);
    }
    return days ? Math.round((done/days)*100) : 0;
  }

  /* ================= DASHBOARD ================= */
  function renderDashboard(){
    const today = todayStr();
    const dueHabits = getDueHabitsForDate(state.habits, today);
    const total = dueHabits.length;
    const done = dueHabits.filter(h => (state.logs[h.id]||{})[today]).length;
    const pct = total ? Math.round((done/total)*100) : 0;

    document.getElementById('progressPercent').textContent = pct + '%';
    document.getElementById('progressDetail').textContent = total
      ? `${done} dari ${total} habit selesai`
      : (state.habits.length ? 'Tidak ada habit untuk hari ini' : 'Belum ada habit');

    const circumference = 2 * Math.PI * 36;
    const circle = document.getElementById('progressCircle');
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', circumference - (pct/100)*circumference);

    document.getElementById('statTotal').textContent = state.habits.length;
    const bestStreak = state.habits.reduce((max,h) => Math.max(max, getStreak(h.id)), 0);
    document.getElementById('statStreak').textContent = bestStreak;

    renderCategoryRow();

    const list = document.getElementById('todayHabitList');
    if(state.habits.length === 0){
      list.innerHTML = emptyStateHTML('Belum ada habit', 'Mulai bangun rutinitas baikmu dengan menambahkan habit pertama.', 'bi-flag');
      return;
    }
    if(dueHabits.length === 0){
      list.innerHTML = emptyStateHTML('Tidak ada habit hari ini', 'Semua habit kamu terjadwal di hari lain. Cek halaman Habit untuk melihat semuanya.', 'bi-calendar2-check');
      return;
    }
    list.innerHTML = dueHabits.map(h => habitItemHTML(h, today, true)).join('');
  }

  function renderCategoryRow(){
    const row = document.getElementById('categoryRow');
    if(state.habits.length === 0){ row.innerHTML = ''; return; }
    row.innerHTML = CATEGORIES.map(cat => {
      const count = state.habits.filter(h => h.category === cat.id).length;
      if(count === 0) return '';
      return `<div class="category-card" style="background:${cat.color}1F">
        <div class="category-icon" style="background:${cat.color}"><i class="bi ${cat.icon}"></i></div>
        <div class="category-count" style="color:${cat.color}">${count}</div>
        <div class="category-label">${cat.label}</div>
      </div>`;
    }).join('');
  }

  function emptyStateHTML(title, desc, icon){
    return `<div class="empty-state">
      <i class="bi ${icon}"></i>
      <h4>${title}</h4>
      <p>${desc}</p>
      <button class="btn btn-primary" onclick="goAddHabit()"><i class="bi bi-plus-lg"></i> Tambah Habit</button>
    </div>`;
  }
  function goAddHabit(){ switchPage('habits'); openHabitModal(); }

  function habitItemHTML(h, dateStr, withCheck){
    const cat = CATEGORIES.find(c => c.id === h.category) || CATEGORIES[CATEGORIES.length-1];
    const done = !!(state.logs[h.id]||{})[dateStr];
    const streak = getStreak(h.id);
    const checkPart = withCheck
      ? `<button class="habit-check ${done?'done':''}" onclick="toggleHabit('${h.id}')" aria-label="Tandai selesai"><i class="bi bi-check-lg"></i></button>`
      : `<i class="bi bi-chevron-right chev"></i>`;
    const clickable = withCheck ? '' : ' clickable" onclick="openHabitModal(\'' + h.id + '\')';
    return `<div class="habit-item${clickable}">
      <div class="habit-icon" style="background:${cat.color}26; color:${cat.color}"><i class="bi ${h.icon}"></i></div>
      <div class="habit-info">
        <div class="habit-name">${escapeHTML(h.name)}</div>
        <div class="habit-meta"><i class="bi bi-fire flame"></i> ${streak} hari beruntun · ${cat.label}</div>
      </div>
      ${checkPart}
    </div>`;
  }

  async function toggleHabit(habitId){
    const today = todayStr();
    const done = !!(state.logs[habitId]||{})[today];
    if(done){
      delete state.logs[habitId][today];
      await sb.from('habit_logs').delete().eq('habit_id', habitId).eq('log_date', today).eq('user_id', state.user.id);
    } else {
      if(!state.logs[habitId]) state.logs[habitId] = {};
      state.logs[habitId][today] = true;
      await sb.from('habit_logs').insert({ habit_id: habitId, user_id: state.user.id, log_date: today });
    }
    if(state.currentPage === 'dashboard') renderDashboard();
    if(state.currentPage === 'habits') renderHabitsPage();
  }

  /* ================= HABITS PAGE ================= */
  function renderHabitsPage(){
    const list = document.getElementById('allHabitList');
    if(state.habits.length === 0){
      list.innerHTML = emptyStateHTML('Belum ada habit', 'Tambahkan habit pertama untuk mulai melacak kemajuanmu.', 'bi-flag');
      return;
    }
    list.innerHTML = state.habits.map(h => {
      const cat = CATEGORIES.find(c => c.id === h.category) || CATEGORIES[CATEGORIES.length-1];
      const streak = getStreak(h.id);
      const rate = getCompletionRate(h.id, 7);
      const freqLabel = h.frequency === 'daily' ? 'Setiap hari' : (h.days||[]).slice().sort().map(d => DAY_SHORT[d]).join(', ');
      return `<div class="habit-item clickable" onclick="openHabitModal('${h.id}')">
        <div class="habit-icon" style="background:${cat.color}26; color:${cat.color}"><i class="bi ${h.icon}"></i></div>
        <div class="habit-info">
          <div class="habit-name">${escapeHTML(h.name)}</div>
          <div class="habit-meta"><i class="bi bi-fire flame"></i> ${streak} hari · ${rate}% / 7 hari · ${freqLabel}</div>
          <div class="habit-progress"><div class="habit-progress-fill" style="width:${rate}%; background:linear-gradient(90deg, ${cat.color}99, ${cat.color})"></div></div>
        </div>
        <i class="bi bi-chevron-right chev"></i>
      </div>`;
    }).join('');
  }

  /* ================= THEME PICKER ================= */
  function buildThemeGrid(){
    const grid = document.getElementById('themeGrid');
    grid.innerHTML = THEMES.map(t =>
      `<button type="button" class="theme-option" data-theme-id="${t.id}" onclick="selectTheme('${t.id}')">
        <span class="theme-swatch" style="background:${t.gradient}"><i class="bi bi-check-lg"></i></span>
        <span class="theme-label">${t.label}</span>
      </button>`
    ).join('');
  }
  function applyTheme(themeId){
    if(themeId === 'green'){ document.documentElement.removeAttribute('data-theme'); }
    else { document.documentElement.setAttribute('data-theme', themeId); }
    document.querySelectorAll('#themeGrid .theme-option').forEach(el =>
      el.classList.toggle('active', el.dataset.themeId === themeId)
    );
  }
  function selectTheme(themeId){
    applyTheme(themeId);
    localStorage.setItem('konsisten-theme', themeId);
  }

  /* ================= MODAL: ADD/EDIT HABIT ================= */
  function buildIconGrid(){
    const grid = document.getElementById('iconGrid');
    grid.innerHTML = HABIT_ICONS.map(ic =>
      `<button type="button" class="icon-option" data-icon="${ic.icon}" title="${ic.label}" onclick="selectIcon('${ic.icon}')"><i class="bi ${ic.icon}"></i></button>`
    ).join('');
  }
  function selectIcon(icon){
    state.selectedIcon = icon;
    document.querySelectorAll('#iconGrid .icon-option').forEach(el => el.classList.toggle('selected', el.dataset.icon === icon));
  }

  function buildCategoryGrid(){
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = CATEGORIES.map(c =>
      `<button type="button" class="chip-option" data-cat="${c.id}" onclick="selectCategory('${c.id}')">${c.label}</button>`
    ).join('');
  }
  function selectCategory(catId){
    state.selectedCategory = catId;
    document.querySelectorAll('#categoryGrid .chip-option').forEach(el => el.classList.toggle('selected', el.dataset.cat === catId));
  }

  function buildDaysGrid(){
    const grid = document.getElementById('daysGrid');
    grid.innerHTML = DAY_SHORT.map((d,i) =>
      `<button type="button" class="chip-option" data-day="${i}" onclick="toggleDay(${i})">${d}</button>`
    ).join('');
  }
  function toggleDay(i){
    const idx = state.selectedDays.indexOf(i);
    if(idx > -1) state.selectedDays.splice(idx,1);
    else state.selectedDays.push(i);
    document.querySelectorAll('#daysGrid .chip-option').forEach(el =>
      el.classList.toggle('selected', state.selectedDays.includes(Number(el.dataset.day)))
    );
  }
  function setFrequency(freq){
    state.selectedFreq = freq;
    document.querySelectorAll('.freq-option').forEach(el => el.classList.toggle('active', el.dataset.freq === freq));
    document.getElementById('daysGroup').classList.toggle('hidden', freq !== 'weekly');
  }

  function openHabitModal(habitId = null){
    state.editingHabitId = habitId;
    document.getElementById('habitForm').reset();
    document.getElementById('deleteConfirmRow').classList.add('hidden');

    if(habitId){
      const h = state.habits.find(x => x.id === habitId);
      document.getElementById('modalTitle').textContent = 'Edit Habit';
      document.getElementById('saveHabitBtnText').textContent = 'Simpan Perubahan';
      document.getElementById('deleteHabitBtn').classList.remove('hidden');
      document.getElementById('habitName').value = h.name;
      state.selectedIcon = h.icon;
      state.selectedCategory = h.category;
      state.selectedFreq = h.frequency;
      state.selectedDays = h.days ? [...h.days] : [1,2,3,4,5];
    } else {
      document.getElementById('modalTitle').textContent = 'Tambah Habit Baru';
      document.getElementById('saveHabitBtnText').textContent = 'Simpan Habit';
      document.getElementById('deleteHabitBtn').classList.add('hidden');
      state.selectedIcon = HABIT_ICONS[0].icon;
      state.selectedCategory = CATEGORIES[0].id;
      state.selectedFreq = 'daily';
      state.selectedDays = [1,2,3,4,5];
    }

    document.querySelectorAll('#iconGrid .icon-option').forEach(el => el.classList.toggle('selected', el.dataset.icon === state.selectedIcon));
    document.querySelectorAll('#categoryGrid .chip-option').forEach(el => el.classList.toggle('selected', el.dataset.cat === state.selectedCategory));
    document.querySelectorAll('.freq-option').forEach(el => el.classList.toggle('active', el.dataset.freq === state.selectedFreq));
    document.getElementById('daysGroup').classList.toggle('hidden', state.selectedFreq !== 'weekly');
    document.querySelectorAll('#daysGrid .chip-option').forEach(el => el.classList.toggle('selected', state.selectedDays.includes(Number(el.dataset.day))));

    document.getElementById('habitModal').classList.remove('hidden');
  }
  function closeHabitModal(){
    document.getElementById('habitModal').classList.add('hidden');
  }

  async function handleSaveHabit(e){
    e.preventDefault();
    const name = document.getElementById('habitName').value.trim();
    if(!name) return;
    if(state.selectedFreq === 'weekly' && state.selectedDays.length === 0){
      showToast('Pilih minimal satu hari untuk habit ini');
      return;
    }

    const payload = {
      name,
      icon: state.selectedIcon,
      category: state.selectedCategory,
      frequency: state.selectedFreq,
      days: state.selectedFreq === 'weekly' ? [...state.selectedDays] : null
    };

    if(state.editingHabitId){
      const { error } = await sb.from('habits').update(payload).eq('id', state.editingHabitId).eq('user_id', state.user.id);
      if(error){ showToast('Gagal menyimpan habit'); return; }
      const h = state.habits.find(x => x.id === state.editingHabitId);
      Object.assign(h, payload);
    } else {
      const { data, error } = await sb.from('habits')
        .insert({ ...payload, user_id: state.user.id })
        .select().single();
      if(error){ showToast('Gagal menyimpan habit'); return; }
      state.habits.push({ id: data.id, ...payload, createdAt: (data.created_at || '').slice(0,10) });
    }

    closeHabitModal();
    if(state.currentPage === 'dashboard') renderDashboard();
    if(state.currentPage === 'habits') renderHabitsPage();
    showToast('Habit berhasil disimpan');
  }

  function askDeleteHabit(){ document.getElementById('deleteConfirmRow').classList.remove('hidden'); }
  function cancelDelete(){ document.getElementById('deleteConfirmRow').classList.add('hidden'); }
  async function confirmDeleteHabit(){
    const { error } = await sb.from('habits').delete().eq('id', state.editingHabitId).eq('user_id', state.user.id);
    if(error){ showToast('Gagal menghapus habit'); return; }
    state.habits = state.habits.filter(h => h.id !== state.editingHabitId);
    delete state.logs[state.editingHabitId];
    closeHabitModal();
    renderHabitsPage();
    if(state.currentPage === 'dashboard') renderDashboard();
    showToast('Habit dihapus');
  }

  /* ================= ANALYTICS ================= */
  function destroyChart(id){
    if(chartInstances[id]){ chartInstances[id].destroy(); delete chartInstances[id]; }
  }

  function renderAnalytics(){
    renderInsights();
    renderWeeklyChart();
    renderTrendChart();
    renderCategoryChart();
    renderStreakChart();
  }

  function renderInsights(){
    const totalCheckins = Object.values(state.logs).reduce((sum,obj) => sum + Object.keys(obj).length, 0);
    const bestStreak = state.habits.reduce((max,h) => Math.max(max, getStreak(h.id)), 0);
    const avgRate = state.habits.length
      ? Math.round(state.habits.reduce((s,h) => s + getCompletionRate(h.id,7), 0) / state.habits.length)
      : 0;

    document.getElementById('insightRow').innerHTML = `
      <div class="insight-chip" style="background:#E3F3F1">
        <div class="stat-icon" style="background:var(--primary)"><i class="bi bi-graph-up"></i></div>
        <div class="stat-value">${avgRate}%</div>
        <div class="stat-label">Rata² 7 Hari</div>
      </div>
      <div class="insight-chip" style="background:var(--accent-soft)">
        <div class="stat-icon" style="background:var(--accent)"><i class="bi bi-fire"></i></div>
        <div class="stat-value">${bestStreak}</div>
        <div class="stat-label">Streak Terbaik</div>
      </div>
      <div class="insight-chip" style="background:#E0F2FE">
        <div class="stat-icon" style="background:#0EA5E9"><i class="bi bi-check2-square"></i></div>
        <div class="stat-value">${totalCheckins}</div>
        <div class="stat-label">Total Check-in</div>
      </div>
    `;
  }

  function renderWeeklyChart(){
    const labels = [];
    const data = [];
    for(let i=6; i>=0; i--){
      const d = new Date(); d.setDate(d.getDate()-i);
      const dateStr = formatDate(d);
      const due = getDueHabitsForDate(state.habits, dateStr);
      const done = due.filter(h => (state.logs[h.id]||{})[dateStr]).length;
      labels.push(DAY_SHORT[d.getDay()]);
      data.push(due.length ? Math.round((done/due.length)*100) : 0);
    }
    destroyChart('weekly');
    chartInstances.weekly = new Chart(document.getElementById('weeklyChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Penyelesaian', data, backgroundColor: '#14B8A6', borderRadius: 6, maxBarThickness: 34 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + '%' } } },
        scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } }
      }
    });
  }

  function renderTrendChart(){
    const labels = [];
    const data = [];
    for(let i=13; i>=0; i--){
      const d = new Date(); d.setDate(d.getDate()-i);
      const dateStr = formatDate(d);
      const due = getDueHabitsForDate(state.habits, dateStr);
      const done = due.filter(h => (state.logs[h.id]||{})[dateStr]).length;
      labels.push(`${d.getDate()}/${d.getMonth()+1}`);
      data.push(due.length ? Math.round((done/due.length)*100) : 0);
    }
    destroyChart('trend');
    chartInstances.trend = new Chart(document.getElementById('trendChart'), {
      type: 'line',
      data: { labels, datasets: [{ label: 'Tingkat Penyelesaian', data, borderColor: '#0F766E', backgroundColor: 'rgba(15,118,110,0.12)', fill: true, tension: 0.35, pointRadius: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + '%' } } },
        scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } }, x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 7 } } }
      }
    });
  }

  function renderCategoryChart(){
    destroyChart('category');
    const wrap = document.getElementById('categoryChart').closest('.chart-wrap');
    const note = wrap.querySelector('.empty-note');
    if(state.habits.length === 0){
      document.getElementById('categoryChart').style.display = 'none';
      if(!note) wrap.insertAdjacentHTML('beforeend', '<p class="empty-note" style="font-size:13px;color:var(--text-muted);text-align:center;padding:60px 0 0;">Belum ada data habit untuk ditampilkan.</p>');
      return;
    }
    if(note) note.remove();
    document.getElementById('categoryChart').style.display = 'block';

    const counts = CATEGORIES.map(c => state.habits.filter(h => h.category === c.id).length);
    chartInstances.category = new Chart(document.getElementById('categoryChart'), {
      type: 'doughnut',
      data: { labels: CATEGORIES.map(c => c.label), datasets: [{ data: counts, backgroundColor: CATEGORIES.map(c => c.color), borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, padding: 12 } } } }
    });
  }

  function renderStreakChart(){
    destroyChart('streak');
    const wrap = document.getElementById('streakChart').closest('.chart-wrap');
    const note = wrap.querySelector('.empty-note');
    if(state.habits.length === 0){
      document.getElementById('streakChart').style.display = 'none';
      if(!note) wrap.insertAdjacentHTML('beforeend', '<p class="empty-note" style="font-size:13px;color:var(--text-muted);text-align:center;padding:60px 0 0;">Belum ada habit untuk ditampilkan.</p>');
      return;
    }
    if(note) note.remove();
    document.getElementById('streakChart').style.display = 'block';

    const sorted = state.habits.map(h => ({ name: h.name, streak: getStreak(h.id) }))
      .sort((a,b) => b.streak - a.streak).slice(0,6);
    chartInstances.streak = new Chart(document.getElementById('streakChart'), {
      type: 'bar',
      data: { labels: sorted.map(h => h.name), datasets: [{ data: sorted.map(h => h.streak), backgroundColor: '#F59E0B', borderRadius: 6 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.x + ' hari' } } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } }
      }
    });
  }

  /* ================= PROFILE ================= */
  function renderProfile(){
    document.getElementById('profileTotalHabits').textContent = state.habits.length + ' habit';
    const totalCheckins = Object.values(state.logs).reduce((sum,obj) => sum + Object.keys(obj).length, 0);
    document.getElementById('profileTotalCheckins').textContent = totalCheckins + ' kali';
  }

  /* ================= TOAST ================= */
  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="bi bi-check-circle"></i> ${escapeHTML(msg)}`;
    toast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.add('hidden'), 2200);
  }