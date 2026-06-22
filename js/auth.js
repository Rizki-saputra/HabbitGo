/* =============================================
   HABITGO — Auth
   ============================================= */

function togglePassword(inputId, btn) {
  const inp = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (inp.type === 'password') { inp.type = 'text'; icon.className = 'bi bi-eye-slash'; }
  else { inp.type = 'password'; icon.className = 'bi bi-eye'; }
}

function showAuthError(msg) {
  const el = document.getElementById('loginError');
  el.querySelector('span').textContent = msg;
  el.classList.remove('hidden');
}
function hideAuthError() {
  document.getElementById('loginError').classList.add('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  hideAuthError();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');

  btn.querySelector('.btn-label').classList.add('hidden');
  btn.querySelector('.btn-loader').classList.remove('hidden');
  btn.disabled = true;

  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  btn.querySelector('.btn-label').classList.remove('hidden');
  btn.querySelector('.btn-loader').classList.add('hidden');
  btn.disabled = false;

  if (error) { showAuthError(t('invalid_creds')); return; }

  state.user = data.user;
  await loadUserData();
  showApp();
}

async function handleLogout() {
  await sb.auth.signOut();
  state.user = null; state.profile = null;
  state.habits = []; state.logs = {}; state.groups = [];
  document.getElementById('app').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('loginPassword').value = '';
  hideAuthError();
  showToast(t('signed_out'));
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file || !state.user) return;

  const ext = file.name.split('.').pop();
  const path = `avatars/${state.user.id}.${ext}`;

  const { error: upErr } = await sb.storage.from('avatars').upload(path, file, { upsert: true });
  if (upErr) { showToast('Upload failed. Try again.'); return; }

  const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = urlData.publicUrl;

  await sb.from('profiles').update({ avatar_url: avatarUrl }).eq('id', state.user.id);
  if (state.profile) state.profile.avatar_url = avatarUrl;

  renderAvatars(avatarUrl);
  showToast(t('avatar_saved'));
}

function renderAvatars(url) {
  const initials = getInitials(state.profile?.name || state.user?.email || '?');
  // Header avatar
  const hdr = document.getElementById('headerAvatar');
  if (url) { hdr.innerHTML = `<img src="${url}" alt="avatar">`; }
  else { hdr.textContent = initials; }
  // Profile avatar
  const pImg = document.getElementById('profileAvatarImg');
  const pInit = document.getElementById('profileAvatarInitials');
  if (url) {
    pImg.src = url; pImg.classList.remove('hidden');
    pInit.classList.add('hidden');
  } else {
    pInit.textContent = initials; pInit.classList.remove('hidden');
    pImg.classList.add('hidden');
  }
}

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
