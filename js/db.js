/* =============================================
   HABITGO — Database (Supabase)
   ============================================= */

// TODO: Replace with your Supabase project values
// Settings → API in your Supabase Dashboard
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- State ----
const state = {
  user: null,
  profile: null,
  habits: [],
  logs: {},       // { habitId: { 'YYYY-MM-DD': true } }
  groups: [],
  currentPage: 'dashboard',
  editingHabitId: null,
  selectedIcon: 'bi-check2-circle',
  selectedCategory: '',
  selectedFreq: 'daily',
  selectedDays: [1, 2, 3, 4, 5],
};

// ---- Date helpers ----
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
}
function getHour() { return new Date().getHours(); }

// ---- Load all user data ----
async function loadUserData() {
  const uid = state.user.id;

  // Profile
  const { data: profile } = await sb.from('profiles').select('*').eq('id', uid).single();
  state.profile = profile || {
    id: uid,
    name: (state.user.email || '').split('@')[0],
    email: state.user.email,
    avatar_url: null,
    created_at: new Date().toISOString()
  };

  // Habits
  const { data: habits } = await sb.from('habits').select('*').eq('user_id', uid).order('created_at');
  state.habits = (habits || []).map(h => ({
    id: h.id, name: h.name, icon: h.icon,
    category: h.category, frequency: h.frequency,
    days: h.days, createdAt: (h.created_at || '').slice(0, 10)
  }));

  // Logs (all time for streak calc)
  const { data: logs } = await sb.from('habit_logs').select('habit_id, log_date').eq('user_id', uid);
  state.logs = {};
  (logs || []).forEach(l => {
    if (!state.logs[l.habit_id]) state.logs[l.habit_id] = {};
    state.logs[l.habit_id][l.log_date] = true;
  });

  // Groups
  const { data: memberships } = await sb
    .from('group_members').select('group_id, role')
    .eq('user_id', uid);
  const groupIds = (memberships || []).map(m => m.group_id);
  if (groupIds.length > 0) {
    const { data: groups } = await sb.from('groups').select('*').in('id', groupIds);
    state.groups = groups || [];
  } else {
    state.groups = [];
  }
}

// ---- Habit streak logic ----
function getStreak(habitId) {
  const logs = state.logs[habitId] || {};
  let date = new Date();
  let count = 0;
  // If today not done, start from yesterday
  const today = todayStr();
  if (!logs[today]) date.setDate(date.getDate() - 1);
  while (true) {
    const ds = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const h = state.habits.find(x => x.id === habitId);
    if (!h) break;
    if (!isDueOn(h, ds)) { date.setDate(date.getDate() - 1); continue; }
    if (!logs[ds]) break;
    count++;
    date.setDate(date.getDate() - 1);
    if (count > 365) break;
  }
  return count;
}

function getBestStreak(habitId) {
  const logs = state.logs[habitId] || {};
  const h = state.habits.find(x => x.id === habitId);
  if (!h) return 0;
  const dates = Object.keys(logs).sort();
  if (!dates.length) return 0;
  let best = 0, cur = 0;
  let prev = null;
  for (const ds of dates) {
    if (!isDueOn(h, ds)) continue;
    if (!prev) { cur = 1; }
    else {
      const d1 = new Date(prev), d2 = new Date(ds);
      const diff = (d2 - d1) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
    }
    best = Math.max(best, cur);
    prev = ds;
  }
  return best;
}

function getCompletionRate(habitId, days) {
  const logs = state.logs[habitId] || {};
  const h = state.habits.find(x => x.id === habitId);
  if (!h) return 0;
  let due = 0, done = 0;
  const d = new Date();
  for (let i = 0; i < days; i++) {
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (isDueOn(h, ds)) { due++; if (logs[ds]) done++; }
    d.setDate(d.getDate() - 1);
  }
  return due === 0 ? 0 : Math.round((done / due) * 100);
}

function isDueOn(habit, dateStr) {
  if (habit.frequency === 'daily') return true;
  const dow = new Date(dateStr + 'T12:00:00').getDay();
  return (habit.days || []).includes(dow);
}

function getDueToday() {
  return state.habits.filter(h => isDueOn(h, todayStr()));
}

function totalCheckins() {
  return Object.values(state.logs).reduce((s, obj) => s + Object.keys(obj).length, 0);
}

function overallBestStreak() {
  return state.habits.reduce((best, h) => Math.max(best, getBestStreak(h.id)), 0);
}
