/* =============================================
   HABITGO — i18n (Internationalisation)
   Supported: en (English US), id (Bahasa Indonesia)
   ============================================= */

const TRANSLATIONS = {
  en: {
    // Auth
    welcome_back: "Welcome back 👋",
    sign_in_sub: "Sign in to continue your streak",
    email: "Email",
    password: "Password",
    sign_in: "Sign In",
    invalid_creds: "Invalid email or password. Try again.",

    // Nav
    home: "Home",
    habits: "Habits",
    groups: "Groups",
    stats: "Stats",

    // Header
    good_morning: "Good morning",
    good_afternoon: "Good afternoon",
    good_evening: "Good evening",

    // Dashboard
    todays_progress: "Today's Progress",
    done_of: (done, total) => `${done} of ${total} done`,
    lets_go: "Let's go! 🔥",
    all_done: "All done! You're on fire 🔥",
    no_habit_today: "No habits today. Rest day!",
    best_streak: "Best streak",
    total_done: "Total done",
    active: "Active",
    todays_habits: "Today's Habits",
    see_all: "See all",

    // Habits
    my_habits: "My Habits",
    no_habits_title: "No habits yet",
    no_habits_sub: "Tap + to add your first habit and start your streak today!",
    add_first_habit: "Add First Habit",
    every_day: "Every day",
    custom_days: "Custom days",
    days_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    streak: (n) => `${n} day streak`,
    rate_7d: (n) => `${n}% / 7d`,
    new_habit: "New Habit",
    edit_habit: "Edit Habit",
    habit_name: "Habit name",
    habit_placeholder: "e.g. Morning run",
    pick_icon: "Pick an icon",
    category: "Category",
    frequency: "Frequency",
    save_habit: "Save Habit",
    delete_habit: "Delete",
    delete_confirm: "Delete this habit?",
    yes_delete: "Yes, delete",
    cancel: "Cancel",
    habit_saved: "Habit saved! 🎉",
    habit_deleted: "Habit deleted",
    pick_one_day: "Pick at least one day",

    // Groups
    groups_title: "Groups",
    no_groups_title: "No groups yet",
    no_groups_sub: "Create a group and challenge your friends to build habits together!",
    create_group: "Create Group",
    new_group: "New Group",
    group_name: "Group name",
    group_name_placeholder: "e.g. Morning Crew",
    group_desc: "Description",
    group_desc_placeholder: "What's this group about?",
    optional: "(optional)",
    members: (n) => `${n} member${n !== 1 ? 's' : ''}`,
    group_created: "Group created! 🎉",

    // Analytics
    analytics: "Analytics",
    avg_7d: "Avg 7-Day",
    best_streak_stat: "Best Streak",
    total_checkins: "Check-ins",
    weekly_completion: "7-Day Completion",
    habit_categories: "Habit Categories",
    top_streaks: "Top Streaks",

    // Profile
    appearance: "Appearance",
    theme_color: "Theme Color",
    language: "Language",
    account: "Account",
    member_since: "Member since",
    sign_out: "Sign Out",
    theme_changed: "Theme updated ✨",
    lang_changed: "Language changed",
    avatar_saved: "Avatar updated! 📸",
    signed_out: "Signed out. See you! 👋",
    streak_stat: "streak",
    checkins_stat: "check-ins",
    joined_stat: "joined",

    // Categories
    categories: [
      { id: "health",      label: "Health",       icon: "bi-heart-pulse",    color: "#10B981" },
      { id: "productivity",label: "Productive",   icon: "bi-kanban",         color: "#3B82F6" },
      { id: "learning",    label: "Learning",     icon: "bi-mortarboard",    color: "#8B5CF6" },
      { id: "finance",     label: "Finance",      icon: "bi-piggy-bank",     color: "#F59E0B" },
      { id: "mindfulness", label: "Mindful",      icon: "bi-balloon-heart",  color: "#EC4899" },
      { id: "other",       label: "Other",        icon: "bi-grid-3x3-gap",   color: "#6B7280" }
    ],

    // Themes
    themes: [
      { id: "purple", label: "Purple",    gradient: "linear-gradient(135deg,#7C3AED,#A855F7)" },
      { id: "blue",   label: "Blue",      gradient: "linear-gradient(135deg,#2563EB,#60A5FA)" },
      { id: "pink",   label: "Pink",      gradient: "linear-gradient(135deg,#DB2777,#F472B6)" },
      { id: "teal",   label: "Teal",      gradient: "linear-gradient(135deg,#0D9488,#2DD4BF)" },
      { id: "orange", label: "Orange",    gradient: "linear-gradient(135deg,#EA580C,#FB923C)" },
      { id: "dark",   label: "Dark",      gradient: "linear-gradient(135deg,#1A0533,#7C3AED)" }
    ]
  },

  id: {
    // Auth
    welcome_back: "Selamat datang! 👋",
    sign_in_sub: "Masuk dan jaga streakmu",
    email: "Email",
    password: "Kata Sandi",
    sign_in: "Masuk",
    invalid_creds: "Email atau kata sandi salah. Coba lagi.",

    // Nav
    home: "Beranda",
    habits: "Habit",
    groups: "Grup",
    stats: "Statistik",

    // Header
    good_morning: "Selamat pagi",
    good_afternoon: "Selamat siang",
    good_evening: "Selamat malam",

    // Dashboard
    todays_progress: "Progress Hari Ini",
    done_of: (done, total) => `${done} dari ${total} selesai`,
    lets_go: "Ayo mulai! 🔥",
    all_done: "Semua selesai! Keren banget 🔥",
    no_habit_today: "Tidak ada habit hari ini. Istirahat dulu!",
    best_streak: "Streak terbaik",
    total_done: "Total selesai",
    active: "Aktif",
    todays_habits: "Habit Hari Ini",
    see_all: "Lihat semua",

    // Habits
    my_habits: "Habit Saya",
    no_habits_title: "Belum ada habit",
    no_habits_sub: "Tekan + untuk tambah habit pertamamu dan mulai streak sekarang!",
    add_first_habit: "Tambah Habit Pertama",
    every_day: "Setiap hari",
    custom_days: "Hari tertentu",
    days_short: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
    streak: (n) => `${n} hari beruntun`,
    rate_7d: (n) => `${n}% / 7 hari`,
    new_habit: "Habit Baru",
    edit_habit: "Edit Habit",
    habit_name: "Nama habit",
    habit_placeholder: "cth. Lari pagi",
    pick_icon: "Pilih ikon",
    category: "Kategori",
    frequency: "Frekuensi",
    save_habit: "Simpan Habit",
    delete_habit: "Hapus",
    delete_confirm: "Hapus habit ini?",
    yes_delete: "Ya, hapus",
    cancel: "Batal",
    habit_saved: "Habit tersimpan! 🎉",
    habit_deleted: "Habit dihapus",
    pick_one_day: "Pilih minimal satu hari",

    // Groups
    groups_title: "Grup",
    no_groups_title: "Belum ada grup",
    no_groups_sub: "Buat grup dan tantang teman-temanmu membangun kebiasaan bersama!",
    create_group: "Buat Grup",
    new_group: "Grup Baru",
    group_name: "Nama grup",
    group_name_placeholder: "cth. Tim Pagi Semangat",
    group_desc: "Deskripsi",
    group_desc_placeholder: "Grup ini tentang apa?",
    optional: "(opsional)",
    members: (n) => `${n} anggota`,
    group_created: "Grup dibuat! 🎉",

    // Analytics
    analytics: "Analisis",
    avg_7d: "Rata² 7 Hari",
    best_streak_stat: "Streak Terbaik",
    total_checkins: "Check-in",
    weekly_completion: "Penyelesaian 7 Hari",
    habit_categories: "Kategori Habit",
    top_streaks: "Streak Teratas",

    // Profile
    appearance: "Tampilan",
    theme_color: "Warna Tema",
    language: "Bahasa",
    account: "Akun",
    member_since: "Bergabung sejak",
    sign_out: "Keluar",
    theme_changed: "Tema diperbarui ✨",
    lang_changed: "Bahasa diubah",
    avatar_saved: "Foto profil diperbarui! 📸",
    signed_out: "Berhasil keluar. Sampai jumpa! 👋",
    streak_stat: "streak",
    checkins_stat: "check-in",
    joined_stat: "bergabung",

    // Categories
    categories: [
      { id: "health",      label: "Kesehatan",    icon: "bi-heart-pulse",    color: "#10B981" },
      { id: "productivity",label: "Produktif",    icon: "bi-kanban",         color: "#3B82F6" },
      { id: "learning",    label: "Belajar",      icon: "bi-mortarboard",    color: "#8B5CF6" },
      { id: "finance",     label: "Keuangan",     icon: "bi-piggy-bank",     color: "#F59E0B" },
      { id: "mindfulness", label: "Mindful",      icon: "bi-balloon-heart",  color: "#EC4899" },
      { id: "other",       label: "Lainnya",      icon: "bi-grid-3x3-gap",   color: "#6B7280" }
    ],

    themes: [
      { id: "purple", label: "Ungu",      gradient: "linear-gradient(135deg,#7C3AED,#A855F7)" },
      { id: "blue",   label: "Biru",      gradient: "linear-gradient(135deg,#2563EB,#60A5FA)" },
      { id: "pink",   label: "Pink",      gradient: "linear-gradient(135deg,#DB2777,#F472B6)" },
      { id: "teal",   label: "Tosca",     gradient: "linear-gradient(135deg,#0D9488,#2DD4BF)" },
      { id: "orange", label: "Oranye",    gradient: "linear-gradient(135deg,#EA580C,#FB923C)" },
      { id: "dark",   label: "Gelap",     gradient: "linear-gradient(135deg,#1A0533,#7C3AED)" }
    ]
  }
};

let currentLang = localStorage.getItem('hg-lang') || 'en';

function t(key, ...args) {
  const val = TRANSLATIONS[currentLang][key] ?? TRANSLATIONS['en'][key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('hg-lang', lang);
  applyLangToUI();
  closeLangPicker();
  showToast(t('lang_changed'));
  renderCurrentPage();
}

function applyLangToUI() {
  document.getElementById('currentLangLabel').textContent =
    currentLang === 'en' ? 'English (US)' : 'Bahasa Indonesia';
  document.querySelectorAll('.lang-item').forEach(el => {
    const check = el.querySelector('.lang-check');
    check.classList.toggle('hidden', el.dataset.lang !== currentLang);
  });
  // Update nav labels
  const navMap = {
    dashboard: t('home'), habits: t('habits'),
    groups: t('groups'), analytics: t('stats')
  };
  document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
    const lbl = btn.querySelector('.nav-label');
    if (lbl && navMap[btn.dataset.page]) lbl.textContent = navMap[btn.dataset.page];
  });
  // Auth
  const wbEl = document.querySelector('.auth-card-title');
  const subEl = document.querySelector('.auth-card-sub');
  if (wbEl) wbEl.textContent = t('welcome_back');
  if (subEl) subEl.textContent = t('sign_in_sub');
}

function openLangPicker() {
  applyLangToUI();
  document.getElementById('langModal').classList.remove('hidden');
}
function closeLangPicker() {
  document.getElementById('langModal').classList.add('hidden');
}
