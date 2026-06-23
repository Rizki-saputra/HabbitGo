/* =============================================
   HABITGO — Groups
   ============================================= */

const GROUP_GRADIENTS = [
  'linear-gradient(135deg,#7C3AED,#EC4899)',
  'linear-gradient(135deg,#2563EB,#06B6D4)',
  'linear-gradient(135deg,#10B981,#34D399)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#8B5CF6,#3B82F6)',
  'linear-gradient(135deg,#EC4899,#F59E0B)',
];

function groupGradient(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return GROUP_GRADIENTS[h % GROUP_GRADIENTS.length];
}

function openGroupModal() {
  document.getElementById('groupName').value = '';
  document.getElementById('groupDesc').value = '';
  document.getElementById('groupName').placeholder = t('group_name_placeholder');
  document.getElementById('groupDesc').placeholder = t('group_desc_placeholder');
  document.getElementById('groupModal').classList.remove('hidden');
}
function closeGroupModal() {
  document.getElementById('groupModal').classList.add('hidden');
}

async function handleCreateGroup(e) {
  e.preventDefault();
  const name = document.getElementById('groupName').value.trim();
  const desc = document.getElementById('groupDesc').value.trim();
  if (!name) return;

  const { data: group, error } = await sb.from('groups')
    .insert({ name, description: desc || null, owner_id: state.user.id })
    .select().single();
  if (error) { showToast('Could not create group'); return; }

  await sb.from('group_members').insert({ group_id: group.id, user_id: state.user.id, role: 'owner' });

  state.groups.push(group);
  closeGroupModal();
  renderGroupsPage();
  showToast(t('group_created'));
}

function renderGroupsPage() {
  const list = document.getElementById('groupList');
  const empty = document.getElementById('groupsEmpty');

  if (state.groups.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  list.innerHTML = state.groups.map(g => `
    <div class="habit-item group-card glass-card">
      <div class="group-avatar" style="background:${groupGradient(g.name)}">
        <i class="bi bi-people-fill"></i>
      </div>
      <div class="group-info">
        <div class="group-name">${escHTML(g.name)}</div>
        <div class="group-meta">${g.description ? escHTML(g.description) : ''}</div>
      </div>
      <i class="bi bi-chevron-right" style="color:var(--text-2);font-size:14px"></i>
    </div>
  `).join('');
}

function handleModalOverlayClick(e, id) {
  if (e.target === document.getElementById(id)) {
    document.getElementById(id).classList.add('hidden');
  }
}
