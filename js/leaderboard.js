/* =============================================
   HABITGO — Leaderboard & Public Profile
   ============================================= */

const BADGES = [
  { rank: 1, label: 'Legend',      emoji: '👑', color: '#F59E0B', bg: 'linear-gradient(135deg,#F59E0B,#FCD34D)' },
  { rank: 2, label: 'Elite',       emoji: '🥈', color: '#94A3B8', bg: 'linear-gradient(135deg,#94A3B8,#CBD5E1)' },
  { rank: 3, label: 'Champion',    emoji: '🥉', color: '#CD7F32', bg: 'linear-gradient(135deg,#CD7F32,#E8A96A)' },
  { rank: 4, label: 'Streak King', emoji: '⚡', color: '#7C3AED', bg: 'linear-gradient(135deg,#7C3AED,#A855F7)' },
  { rank: 5, label: 'On Fire',     emoji: '🔥', color: '#EF4444', bg: 'linear-gradient(135deg,#EF4444,#F87171)' },
];

let leaderboardData = [];
let publicProfileData = null;

function getBadge(rank) {
  return BADGES.find(b => b.rank === rank) || null;
}

async function loadLeaderboard() {
  const { data, error } = await sb
    .from('leaderboard')
    .select('*')
    .limit(50);
  if (error) { console.error(error); return []; }
  return data || [];
}

async function renderLeaderboard() {
  const wrap = document.getElementById('leaderboardList');
  const myRow = document.getElementById('myRankCard');

  wrap.innerHTML = `<div class="lb-loading"><i class="bi bi-arrow-repeat spin"></i></div>`;

  leaderboardData = await loadLeaderboard();

  if (!leaderboardData.length) {
    wrap.innerHTML = `<div class="empty-wrap">
      <div class="empty-icon"><i class="bi bi-trophy"></i></div>
      <h3>No data yet</h3>
      <p>Start checking in your habits to appear on the leaderboard!</p>
    </div>`;
    myRow.classList.add('hidden');
    return;
  }

  // My rank
  const me = leaderboardData.find(u => u.user_id === state.user.id);
  if (me) {
    myRow.classList.remove('hidden');
    myRow.innerHTML = myRankHTML(me);
  }

  // Top 3 podium
  const top3 = leaderboardData.slice(0, 3);
  const rest  = leaderboardData.slice(3);

  wrap.innerHTML = `
    <div class="podium-wrap">${podiumHTML(top3)}</div>
    ${rest.map(u => leaderboardRowHTML(u)).join('')}
  `;
}

function podiumHTML(top3) {
  // Reorder: 2nd, 1st, 3rd for visual podium
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = { 1: '110px', 2: '80px', 3: '65px' };

  return `<div class="podium">
    ${order.map(u => {
      const badge = getBadge(u.rank);
      const isFirst = u.rank === 1;
      return `
        <div class="podium-item ${isFirst ? 'podium-center' : ''}" onclick="openPublicProfile('${u.user_id}')">
          <div class="podium-badge-emoji">${badge.emoji}</div>
          <div class="podium-avatar" style="border-color:${badge.color}">
            ${u.avatar_url
              ? `<img src="${u.avatar_url}" alt="${u.name}">`
              : `<span>${getInitials(u.name)}</span>`}
          </div>
          <div class="podium-name">${escHTML(u.name.split(' ')[0])}</div>
          <div class="podium-streak"><i class="bi bi-fire"></i> ${u.best_streak}d</div>
          <div class="podium-stand" style="height:${heights[u.rank] || '65px'}; background:${badge.bg}">
            <span class="podium-rank">#${u.rank}</span>
          </div>
        </div>`;
    }).join('')}
  </div>`;
}

function leaderboardRowHTML(u) {
  const badge = getBadge(u.rank);
  const isMe = u.user_id === state.user.id;
  return `
    <div class="lb-row glass-card ${isMe ? 'lb-row-me' : ''}" onclick="openPublicProfile('${u.user_id}')">
      <div class="lb-rank ${badge ? 'lb-rank-badge' : ''}" style="${badge ? `background:${badge.bg}` : ''}">
        ${badge ? badge.emoji : '#' + u.rank}
      </div>
      <div class="lb-avatar">
        ${u.avatar_url
          ? `<img src="${u.avatar_url}" alt="${u.name}">`
          : `<span>${getInitials(u.name)}</span>`}
      </div>
      <div class="lb-info">
        <div class="lb-name">${escHTML(u.name)} ${isMe ? '<span class="lb-you">You</span>' : ''}</div>
        ${badge ? `<div class="lb-badge-label" style="color:${badge.color}">${badge.emoji} ${badge.label}</div>` : ''}
      </div>
      <div class="lb-stats">
        <div class="lb-stat-main"><i class="bi bi-fire"></i> ${u.best_streak}</div>
        <div class="lb-stat-sub">${u.total_checkins} check-ins</div>
      </div>
    </div>`;
}

function myRankHTML(me) {
  const badge = getBadge(me.rank);
  return `
    <div class="my-rank-inner">
      <div>
        <div class="my-rank-label">Your Rank</div>
        <div class="my-rank-pos">#${me.rank} ${badge ? badge.emoji : ''}</div>
        ${badge ? `<div class="my-rank-badge" style="color:${badge.color}">${badge.label}</div>` : ''}
      </div>
      <div class="my-rank-stats">
        <div class="my-rank-stat"><span>${me.best_streak}</span><small>Best streak</small></div>
        <div class="my-rank-stat"><span>${me.total_checkins}</span><small>Check-ins</small></div>
        <div class="my-rank-stat"><span>${me.habit_count}</span><small>Habits</small></div>
      </div>
    </div>`;
}

/* ---- Public Profile ---- */
async function openPublicProfile(userId) {
  document.getElementById('publicProfileModal').classList.remove('hidden');
  document.getElementById('publicProfileContent').innerHTML =
    `<div class="lb-loading"><i class="bi bi-arrow-repeat spin"></i></div>`;

  const user = leaderboardData.find(u => u.user_id === userId);
  if (!user) return;

  // Load their habits
  const { data: habits } = await sb.from('habits').select('*').eq('user_id', userId);
  const badge = getBadge(user.rank);

  document.getElementById('publicProfileContent').innerHTML = `
    <div class="pub-profile-hero glass-card-dark">
      <div class="pub-profile-hero-orb"></div>
      <div class="pub-avatar">
        ${user.avatar_url
          ? `<img src="${user.avatar_url}" alt="${user.name}">`
          : `<span>${getInitials(user.name)}</span>`}
      </div>
      <h2 class="pub-name">${escHTML(user.name)}</h2>
      ${badge ? `<div class="pub-badge" style="background:${badge.bg}">${badge.emoji} ${badge.label}</div>` : ''}
      <div class="pub-stats">
        <div class="pub-stat"><span>${user.best_streak}</span><small>Best Streak</small></div>
        <div class="pub-stat-div"></div>
        <div class="pub-stat"><span>${user.total_checkins}</span><small>Check-ins</small></div>
        <div class="pub-stat-div"></div>
        <div class="pub-stat"><span>${user.habit_count}</span><small>Habits</small></div>
      </div>
    </div>
    <div class="pub-habits-section">
      <h4 class="pub-section-title">Active Habits</h4>
      ${(habits || []).length === 0
        ? '<p class="pub-empty">No habits shared yet</p>'
        : (habits || []).map(h => {
            const cats = t('categories');
            const cat = cats.find(c => c.id === h.category) || cats[cats.length-1];
            return `<div class="pub-habit-item glass-card">
              <div class="habit-icon-wrap" style="background:${cat.color}22;color:${cat.color}">
                <i class="bi ${h.icon}"></i>
              </div>
              <div class="pub-habit-name">${escHTML(h.name)}</div>
              <div class="pub-habit-cat" style="color:${cat.color}">${cat.label}</div>
            </div>`;
          }).join('')
      }
    </div>
  `;
}

function closePublicProfile() {
  document.getElementById('publicProfileModal').classList.add('hidden');
}
