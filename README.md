# HabitGo — Setup Guide

## Project Structure
```
habitgo/
├── index.html          ← Main app
├── manifest.json       ← PWA manifest
├── sw.js               ← Service worker (offline + PWA install)
├── schema.sql          ← Supabase database schema (run once)
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── i18n.js         ← Translations (EN + ID)
│   ├── theme.js        ← Color theme manager
│   ├── db.js           ← Supabase client + data helpers
│   ├── auth.js         ← Login, logout, avatar upload
│   ├── habits.js       ← Habit CRUD + rendering
│   ├── analytics.js    ← Charts (Chart.js)
│   ├── groups.js       ← Group CRUD + rendering
│   └── app.js          ← App init, routing, toast
└── icons/
    ├── icon-192.png    ← PWA icon (replace with your logo)
    └── icon-512.png    ← PWA icon (replace with your logo)
```

---

## Step 1 — Supabase Setup

1. Buat project di https://supabase.com
2. Buka **SQL Editor → New Query**
3. Paste seluruh isi `schema.sql` → Run
4. Buka **Authentication → Settings**:
   - Disable "Enable email confirmations" (untuk login langsung)
5. Buat user manual: **Authentication → Users → Add user**

---

## Step 2 — Connect Supabase ke App

Buka `js/db.js`, ganti 2 baris ini:

```js
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
```

Nilai ada di: **Supabase Dashboard → Settings → API**

---

## Step 3 — Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Di folder habitgo/
vercel

# Atau drag-drop folder ke vercel.com/new
```

Tidak perlu `package.json` atau build step — ini pure static HTML/CSS/JS.

---

## Step 4 — PWA Install

Setelah deploy:
- **Android**: Buka di Chrome → menu ⋮ → "Add to Home Screen"
- **iOS**: Buka di Safari → Share → "Add to Home Screen"
- **Desktop**: Chrome akan tampilkan tombol install di address bar

---

## Step 5 — Ganti Icon (Opsional)

Buat PNG square (transparan background OK):
- `icons/icon-192.png` → 192×192 px
- `icons/icon-512.png` → 512×512 px

Tools: Figma, Canva, atau https://realfavicongenerator.net

---

## Features

| Feature | Status |
|---|---|
| Login (Supabase Auth) | ✅ |
| Habit CRUD | ✅ |
| Daily check-in + streak | ✅ |
| Analytics (3 charts) | ✅ |
| Groups (create/join) | ✅ |
| Avatar upload (Supabase Storage) | ✅ |
| Theme color (6 pilihan) | ✅ |
| Bilingual EN/ID | ✅ |
| PWA (installable) | ✅ |
| Offline support | ✅ |
| Push notifications | 🔜 (next sprint) |
| Group leaderboard | 🔜 (next sprint) |
| Group activity feed | 🔜 (next sprint) |
