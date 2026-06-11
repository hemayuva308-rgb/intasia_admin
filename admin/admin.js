/* ═══════════════════════════════════════════════════════
   INTASIA ADMIN PANEL  —  Vanilla JS SPA
   No build step required. Serves from /admin/
═══════════════════════════════════════════════════════ */

const API = '/api';
let token = localStorage.getItem('ia_token');

/* ── API helper ── */
async function api(path, opts = {}) {
  const headers = {};
  // Only set Content-Type for non-GET requests that have a body
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  if (res.status === 401) { logout(); throw new Error('Session expired. Please log in again.'); }
  let data;
  try { data = await res.json(); } catch(e) { throw new Error('Invalid server response'); }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

/* ── Auth ── */
function logout() {
  token = null;
  localStorage.removeItem('ia_token');
  renderLogin();
}

/* ── Router ── */
const routes = {
  dashboard:     renderDashboard,
  contacts:      renderContacts,
  bookings:      renderBookings,
  services:      renderServices,
  projects:      renderProjects,
  testimonials:  renderTestimonials,
  pricing:       renderPricing,
  team:          renderTeam,
  reels:         renderReels,
  'creative-works': renderCreativeWorks,
  media:         renderMedia,
  settings:      renderSettings,
};
let currentPage = 'dashboard';

async function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="splash"><div class="spinner"></div></div>';
  try {
    await (routes[page] || renderDashboard)();
  } catch(e) {
    main.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:16px;">
        <div style="font-size:2rem;">⚠️</div>
        <div style="color:var(--danger);font-weight:600;">Failed to load page</div>
        <div style="color:var(--text2);font-size:0.85rem;">${e.message}</div>
        <button class="ia-btn ia-btn-ghost" onclick="navigate('${page}')">Retry</button>
      </div>
    `;
  }
}

/* ════════════════════════════════════════════════════
   SHELL
════════════════════════════════════════════════════ */
function renderShell(adminName) {
  document.getElementById('root').innerHTML = `
    <div style="display:flex;min-height:100vh;">
      <!-- Sidebar -->
      <aside id="sidebar" style="width:var(--sidebar-w);background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:100;">
        <div style="padding:24px 20px 16px;border-bottom:1px solid var(--border);">
          <div style="font-size:1.2rem;font-weight:800;letter-spacing:-0.03em;color:var(--accent);">⬡ Intasia</div>
          <div style="font-size:0.72rem;color:var(--text2);margin-top:2px;">Admin Panel</div>
        </div>
        <nav style="flex:1;overflow-y:auto;padding:12px 8px;">
          ${[
            ['dashboard','📊','Dashboard'],
            ['contacts','✉️','Contacts'],
            ['bookings','📋','Bookings'],
            ['services','⚡','Services'],
            ['projects','🎨','Projects'],
            ['testimonials','💬','Testimonials'],
            ['pricing','💎','Pricing Plans'],
            ['team','👥','Team Members'],
            ['reels','🎬','Reels'],
            ['creative-works','🖼️','Creative Works'],
            ['media','📁','Media'],
            ['settings','⚙️','Settings'],
          ].map(([page, icon, label]) => `
            <button class="nav-item${currentPage===page?' active':''}" data-page="${page}"
              onclick="navigate('${page}')"
              style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border:none;background:none;color:var(--text2);border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:500;text-align:left;transition:all 0.2s;margin-bottom:2px;">
              <span>${icon}</span><span>${label}</span>
            </button>
          `).join('')}
        </nav>
        <div style="padding:16px;border-top:1px solid var(--border);">
          <div style="font-size:0.8rem;color:var(--text2);margin-bottom:8px;">Logged in as <strong style="color:var(--text);">${adminName}</strong></div>
          <button onclick="logout()" style="width:100%;padding:8px;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);color:var(--danger);border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;">Logout</button>
        </div>
      </aside>
      <!-- Main -->
      <div style="margin-left:var(--sidebar-w);flex:1;min-height:100vh;">
        <div id="main-content" style="padding:32px;max-width:1200px;"></div>
      </div>
    </div>
  `;
  addNavStyles();
  navigate(currentPage);
}

function addNavStyles() {
  if (document.getElementById('ia-nav-styles')) return;
  const s = document.createElement('style');
  s.id = 'ia-nav-styles';
  s.textContent = `
    .nav-item:hover { background: rgba(184,125,232,0.1) !important; color: var(--accent) !important; }
    .nav-item.active { background: rgba(184,125,232,0.15) !important; color: var(--accent) !important; }
    .ia-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 20px; }
    .ia-table { width: 100%; border-collapse: collapse; }
    .ia-table th { text-align: left; padding: 10px 14px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text2); border-bottom: 1px solid var(--border); }
    .ia-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 0.85rem; vertical-align: middle; }
    .ia-table tr:hover td { background: rgba(255,255,255,0.02); }
    .badge { display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:0.7rem;font-weight:600;letter-spacing:0.04em; }
    .badge-unread  { background:rgba(251,191,36,0.15);color:var(--warning); }
    .badge-read    { background:rgba(96,165,250,0.15);color:var(--info); }
    .badge-replied { background:rgba(52,211,153,0.15);color:var(--success); }
    .badge-pending  { background:rgba(251,191,36,0.15);color:var(--warning); }
    .badge-approved { background:rgba(52,211,153,0.15);color:var(--success); }
    .badge-rejected { background:rgba(248,113,113,0.15);color:var(--danger); }
    .badge-active   { background:rgba(52,211,153,0.15);color:var(--success); }
    .badge-inactive { background:rgba(248,113,113,0.15);color:var(--danger); }
    .ia-btn { display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;transition:all 0.2s; }
    .ia-btn-primary { background:var(--accent-deep);color:white; }
    .ia-btn-primary:hover { background:var(--accent); }
    .ia-btn-ghost { background:transparent;border:1px solid var(--border);color:var(--text2); }
    .ia-btn-ghost:hover { border-color:var(--accent);color:var(--accent); }
    .ia-btn-danger { background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);color:var(--danger); }
    .ia-btn-danger:hover { background:rgba(248,113,113,0.2); }
    .ia-btn-success { background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);color:var(--success); }
    .ia-input { width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.85rem;font-family:inherit;outline:none;transition:border-color 0.2s; }
    .ia-input:focus { border-color:var(--accent); }
    .ia-label { display:block;margin-bottom:6px;font-size:0.78rem;font-weight:600;color:var(--text2); }
    .ia-modal-bg { position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center; }
    .ia-modal { background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:32px;width:90%;max-width:520px;max-height:90vh;overflow-y:auto; }
    .stat-card { background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;text-align:center; }
    .stat-card .num { font-size:2rem;font-weight:800;color:var(--accent); }
    .stat-card .lbl { font-size:0.75rem;color:var(--text2);margin-top:4px; }
    .ia-hint { font-size:0.72rem;color:var(--text2);margin-top:4px; }
    .spinner { width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin:80px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .splash { display:flex;align-items:center;justify-content:center;min-height:200px; }
  `;
  document.head.appendChild(s);
}

/* ════════════════════════════════════════════════════
   LOGIN
════════════════════════════════════════════════════ */
function renderLogin() {
  document.getElementById('root').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);">
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:40px;width:100%;max-width:400px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:1.8rem;font-weight:800;color:var(--accent);letter-spacing:-0.03em;">⬡ Intasia</div>
          <div style="font-size:0.85rem;color:var(--text2);margin-top:6px;">Admin Panel — Sign In</div>
        </div>
        <div id="login-err" style="display:none;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);color:var(--danger);padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:0.83rem;"></div>
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:0.78rem;font-weight:600;color:var(--text2);margin-bottom:6px;">Email</label>
          <input id="login-email" type="email" placeholder="admin@intasia.in"
            style="width:100%;padding:12px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.9rem;font-family:inherit;outline:none;" />
        </div>
        <div style="margin-bottom:24px;">
          <label style="display:block;font-size:0.78rem;font-weight:600;color:var(--text2);margin-bottom:6px;">Password</label>
          <input id="login-pass" type="password" placeholder="••••••••"
            style="width:100%;padding:12px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.9rem;font-family:inherit;outline:none;" />
        </div>
        <button id="login-btn" onclick="doLogin()"
          style="width:100%;padding:13px;background:var(--accent-deep);color:white;border:none;border-radius:10px;font-size:0.95rem;font-weight:700;cursor:pointer;">
          Sign In →
        </button>
      </div>
    </div>
  `;
  document.getElementById('login-pass').addEventListener('keypress', e => { if(e.key==='Enter') doLogin(); });
}

async function doLogin() {
  const email = document.getElementById('login-email').value;
  const pass  = document.getElementById('login-pass').value;
  const btn   = document.getElementById('login-btn');
  const err   = document.getElementById('login-err');
  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    if (!data || !data.token) throw new Error('Login failed — no token received');
    token = data.token;
    localStorage.setItem('ia_token', token);
    renderShell(data.admin.name);
  } catch(e) {
    err.textContent = e.message; err.style.display = 'block';
    btn.textContent = 'Sign In →'; btn.disabled = false;
  }
}

/* ════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════ */
async function renderDashboard() {
  const main = document.getElementById('main-content');
  try {
    const [stats, recent] = await Promise.all([
      api('/dashboard/stats'),
      api('/dashboard/recent'),
    ]);
    main.innerHTML = `
      <div style="margin-bottom:28px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Dashboard</h1>
        <p style="color:var(--text2);font-size:0.85rem;margin-top:4px;">Welcome back. Here's what's happening.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:32px;">
        ${[
          ['Total Contacts',     stats.totalContacts,     '✉️'],
          ['Unread',            stats.unreadContacts,     '🔴'],
          ['Total Bookings',    stats.totalBookings,      '📋'],
          ['Pending Bookings',  stats.pendingBookings,    '⏳'],
          ['Projects',          stats.totalProjects,      '🎨'],
          ['Services',          stats.totalServices,      '⚡'],
          ['Testimonials',      stats.totalTestimonials,  '💬'],
        ].map(([lbl, num, icon]) => `
          <div class="stat-card">
            <div style="font-size:1.4rem;margin-bottom:6px;">${icon}</div>
            <div class="num">${num}</div>
            <div class="lbl">${lbl}</div>
          </div>
        `).join('')}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="ia-card">
          <h3 style="font-size:0.95rem;font-weight:700;margin-bottom:16px;">Recent Contacts</h3>
          <table class="ia-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>
              ${recent.recentContacts.map(c => `
                <tr onclick="navigate('contacts')" style="cursor:pointer;">
                  <td>${c.name}</td>
                  <td style="color:var(--text2);">${c.email}</td>
                  <td><span class="badge badge-${c.status}">${c.status}</span></td>
                </tr>
              `).join('') || '<tr><td colspan="3" style="color:var(--text2);text-align:center;padding:20px;">No contacts yet</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="ia-card">
          <h3 style="font-size:0.95rem;font-weight:700;margin-bottom:16px;">Recent Bookings</h3>
          <table class="ia-table">
            <thead><tr><th>Name</th><th>Service</th><th>Status</th></tr></thead>
            <tbody>
              ${recent.recentBookings.map(b => `
                <tr onclick="navigate('bookings')" style="cursor:pointer;">
                  <td>${b.name}</td>
                  <td style="color:var(--text2);">${b.service}</td>
                  <td><span class="badge badge-${b.status}">${b.status}</span></td>
                </tr>
              `).join('') || '<tr><td colspan="3" style="color:var(--text2);text-align:center;padding:20px;">No bookings yet</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch(e) {
    main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`;
  }
}

/* ════════════════════════════════════════════════════
   CONTACTS
════════════════════════════════════════════════════ */
async function renderContacts() {
  const main = document.getElementById('main-content');
  try {
    const data = await api('/contacts');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Contacts</h1>
        <span style="color:var(--text2);font-size:0.85rem;">${data.total} total</span>
      </div>
      <div class="ia-card">
        <table class="ia-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.contacts.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td style="color:var(--text2);">${c.email}</td>
                <td style="color:var(--text2);">${c.phone||'—'}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2);">${c.message}</td>
                <td><span class="badge badge-${c.status}">${c.status}</span></td>
                <td style="color:var(--text2);font-size:0.78rem;">${new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="ia-btn ia-btn-ghost" onclick="replyContact('${c._id}','${c.name.replace(/'/g,"\\'")}','${c.email}')" style="padding:5px 10px;font-size:0.75rem;">Reply</button>
                    <button class="ia-btn ia-btn-danger" onclick="deleteContact('${c._id}')" style="padding:5px 10px;font-size:0.75rem;">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text2);">No contacts yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}

function replyContact(id, name, email) {
  showModal(`Reply to ${name} (${email})`, `
    <div style="margin-bottom:16px;">
      <label class="ia-label">Your Reply</label>
      <textarea id="reply-text" class="ia-input" rows="5" placeholder="Type your reply…"></textarea>
    </div>
    <button class="ia-btn ia-btn-primary" style="width:100%;" onclick="sendContactReply('${id}')">Send Reply</button>
  `);
}

async function sendContactReply(id) {
  const text = document.getElementById('reply-text').value.trim();
  if (!text) return alert('Reply cannot be empty');
  try {
    await api(`/contacts/${id}/reply`, { method:'PATCH', body:JSON.stringify({ replyText: text }) });
    closeModal(); renderContacts();
  } catch(e) { alert(e.message); }
}

async function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  try { await api(`/contacts/${id}`, { method:'DELETE' }); renderContacts(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   BOOKINGS
════════════════════════════════════════════════════ */
async function renderBookings() {
  const main = document.getElementById('main-content');
  try {
    const data = await api('/bookings');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Bookings / Enquiries</h1>
        <span style="color:var(--text2);font-size:0.85rem;">${data.total} total</span>
      </div>
      <div class="ia-card">
        <table class="ia-table">
          <thead><tr><th>Name</th><th>Email</th><th>Service</th><th>Plan</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.bookings.map(b => `
              <tr>
                <td><strong>${b.name}</strong></td>
                <td style="color:var(--text2);">${b.email}</td>
                <td>${b.service}</td>
                <td style="color:var(--text2);">${b.plan||'—'}</td>
                <td><span class="badge badge-${b.status}">${b.status}</span></td>
                <td style="color:var(--text2);font-size:0.78rem;">${new Date(b.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button class="ia-btn ia-btn-success" onclick="updateBookingStatus('${b._id}','approved')" style="padding:5px 10px;font-size:0.75rem;">✓</button>
                    <button class="ia-btn ia-btn-danger" onclick="updateBookingStatus('${b._id}','rejected')" style="padding:5px 10px;font-size:0.75rem;">✕</button>
                    <button class="ia-btn ia-btn-ghost" onclick="replyBooking('${b._id}','${b.name.replace(/'/g,"\\'")}','${b.email}')" style="padding:5px 10px;font-size:0.75rem;">Reply</button>
                    <button class="ia-btn ia-btn-danger" onclick="deleteBooking('${b._id}')" style="padding:5px 10px;font-size:0.75rem;">Del</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text2);">No bookings yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}

async function updateBookingStatus(id, status) {
  try { await api(`/bookings/${id}/status`, { method:'PATCH', body:JSON.stringify({ status }) }); renderBookings(); }
  catch(e) { alert(e.message); }
}
function replyBooking(id, name, email) {
  showModal(`Reply to ${name}`, `
    <div style="margin-bottom:16px;">
      <label class="ia-label">Your Reply</label>
      <textarea id="reply-text" class="ia-input" rows="5" placeholder="Type your reply…"></textarea>
    </div>
    <button class="ia-btn ia-btn-primary" style="width:100%;" onclick="sendBookingReply('${id}')">Send Reply</button>
  `);
}
async function sendBookingReply(id) {
  const text = document.getElementById('reply-text').value.trim();
  if (!text) return alert('Reply cannot be empty');
  try { await api(`/bookings/${id}/reply`, { method:'PATCH', body:JSON.stringify({ replyText: text }) }); closeModal(); renderBookings(); }
  catch(e) { alert(e.message); }
}
async function deleteBooking(id) {
  if (!confirm('Delete this booking?')) return;
  try { await api(`/bookings/${id}`, { method:'DELETE' }); renderBookings(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   SERVICES
   FIX: /services/admin/all path confirmed correct
   FIX: slug auto-generated with timestamp suffix to avoid collisions
   FIX: toggle isActive added
════════════════════════════════════════════════════ */
async function renderServices() {
  const main = document.getElementById('main-content');
  try {
    const services = await api('/services/admin/all');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Services</h1>
        <button class="ia-btn ia-btn-primary" onclick="showServiceForm()">+ Add Service</button>
      </div>
      <div class="ia-card">
        <table class="ia-table">
          <thead><tr><th>Title</th><th>Slug</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${services.map(s => `
              <tr>
                <td><strong>${s.title}</strong></td>
                <td style="color:var(--text2);font-family:monospace;font-size:0.78rem;">${s.slug}</td>
                <td>${s.order}</td>
                <td><span class="badge badge-${s.isActive?'active':'inactive'}">${s.isActive?'Active':'Inactive'}</span></td>
                <td>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button class="ia-btn ia-btn-ghost" onclick='showServiceForm(${JSON.stringify(s).replace(/'/g,"&#39;")})' style="padding:5px 10px;font-size:0.75rem;">Edit</button>
                    <button class="ia-btn ia-btn-ghost" onclick="toggleService('${s._id}')" style="padding:5px 10px;font-size:0.75rem;">${s.isActive?'Hide':'Show'}</button>
                    <button class="ia-btn ia-btn-danger" onclick="deleteService('${s._id}')" style="padding:5px 10px;font-size:0.75rem;">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text2);">No services yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}

function showServiceForm(s = null) {
  showModal(s ? 'Edit Service' : 'Add Service', `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div>
        <label class="ia-label">Title *</label>
        <input id="s-title" class="ia-input" value="${s ? escHtml(s.title) : ''}" placeholder="e.g. SEO &amp; Content" />
      </div>
      <div>
        <label class="ia-label">Slug <span style="font-weight:400;color:var(--text2);">(auto-generated if left blank)</span></label>
        <input id="s-slug" class="ia-input" value="${s ? escHtml(s.slug) : ''}" placeholder="e.g. seo-content" />
        <div class="ia-hint">Used in URLs. Leave blank to auto-generate from title.</div>
      </div>
      <div><label class="ia-label">Description</label><textarea id="s-desc" class="ia-input" rows="3">${s ? escHtml(s.description||'') : ''}</textarea></div>
      <div><label class="ia-label">Icon (emoji)</label><input id="s-icon" class="ia-input" value="${s ? escHtml(s.icon||'') : ''}" placeholder="🔍" /></div>
      <div><label class="ia-label">Features (one per line)</label><textarea id="s-features" class="ia-input" rows="4">${s ? escHtml((s.features||[]).join('\n')) : ''}</textarea></div>
      <div><label class="ia-label">Order</label><input id="s-order" type="number" class="ia-input" value="${s ? (s.order||0) : 0}" /></div>
      <button class="ia-btn ia-btn-primary" style="width:100%;" onclick="saveService('${s ? s._id : ''}')">Save Service</button>
    </div>
  `);
}
async function saveService(id) {
  const title = document.getElementById('s-title').value.trim();
  if (!title) return alert('Title is required');
  const body = {
    title,
    slug: document.getElementById('s-slug').value.trim() || undefined,
    description: document.getElementById('s-desc').value,
    icon: document.getElementById('s-icon').value,
    features: document.getElementById('s-features').value.split('\n').filter(Boolean),
    order: Number(document.getElementById('s-order').value) || 0,
  };
  // Remove undefined slug so backend auto-generates it
  if (!body.slug) delete body.slug;
  try {
    if (id) {
      await api(`/services/${id}`, { method:'PUT', body:JSON.stringify(body) });
    } else {
      await api('/services', { method:'POST', body:JSON.stringify(body) });
    }
    closeModal(); renderServices();
  } catch(e) { alert('Error: ' + e.message); }
}
async function toggleService(id) {
  try { await api(`/services/${id}/toggle`, { method:'PATCH', body:'{}' }); renderServices(); }
  catch(e) { alert(e.message); }
}
async function deleteService(id) {
  if (!confirm('Delete this service?')) return;
  try { await api(`/services/${id}`, { method:'DELETE' }); renderServices(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   PROJECTS
   FIX: /projects/admin/all confirmed correct
   FIX: isActive toggle added (both UI button and PATCH route)
════════════════════════════════════════════════════ */
async function renderProjects() {
  const main = document.getElementById('main-content');
  try {
    const projects = await api('/projects/admin/all');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Projects</h1>
        <button class="ia-btn ia-btn-primary" onclick="showProjectForm()">+ Add Project</button>
      </div>
      <div class="ia-card">
        <table class="ia-table">
          <thead><tr><th>Title</th><th>Category</th><th>Featured</th><th>Selected</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${projects.map(p => `
              <tr>
                <td><strong>${p.title}</strong></td>
                <td style="color:var(--text2);">${p.category}</td>
                <td><span class="badge badge-${p.isFeatured?'active':'inactive'}">${p.isFeatured?'Yes':'No'}</span></td>
                <td><span class="badge badge-${p.isSelected?'active':'inactive'}">${p.isSelected?'Yes':'No'}</span></td>
                <td><span class="badge badge-${p.isActive?'active':'inactive'}">${p.isActive?'Active':'Hidden'}</span></td>
                <td>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button class="ia-btn ia-btn-ghost" onclick='showProjectForm(${JSON.stringify(p).replace(/'/g,"&#39;")})' style="padding:5px 10px;font-size:0.75rem;">Edit</button>
                    <button class="ia-btn ia-btn-ghost" onclick="toggleProjectFeatured('${p._id}')" style="padding:5px 10px;font-size:0.75rem;">⭐</button>
                    <button class="ia-btn ia-btn-ghost" onclick="toggleProjectSelected('${p._id}')" style="padding:5px 10px;font-size:0.75rem;">🏆</button>
                    <button class="ia-btn ia-btn-ghost" onclick="toggleProject('${p._id}')" style="padding:5px 10px;font-size:0.75rem;">${p.isActive?'Hide':'Show'}</button>
                    <button class="ia-btn ia-btn-danger" onclick="deleteProject('${p._id}')" style="padding:5px 10px;font-size:0.75rem;">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text2);">No projects yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}
function showProjectForm(p = null) {
  showModal(p ? 'Edit Project' : 'Add Project', `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div>
        <label class="ia-label">Title *</label>
        <input id="p-title" class="ia-input" value="${p ? escHtml(p.title) : ''}" />
      </div>
      <div>
        <label class="ia-label">Slug <span style="font-weight:400;color:var(--text2);">(auto-generated if left blank)</span></label>
        <input id="p-slug" class="ia-input" value="${p ? escHtml(p.slug||'') : ''}" />
      </div>
      <div>
        <label class="ia-label">Category *</label>
        <input id="p-cat" class="ia-input" value="${p ? escHtml(p.category) : ''}" placeholder="e.g. branding, web, video" />
      </div>
      <div><label class="ia-label">Description</label><textarea id="p-desc" class="ia-input" rows="3">${p ? escHtml(p.description||'') : ''}</textarea></div>
      <div><label class="ia-label">Thumbnail URL</label><input id="p-thumb" class="ia-input" value="${p ? escHtml(p.thumbnail||'') : ''}" /></div>
      <div><label class="ia-label">Client Name</label><input id="p-client" class="ia-input" value="${p ? escHtml(p.clientName||'') : ''}" /></div>
      <div><label class="ia-label">Live URL</label><input id="p-url" class="ia-input" value="${p ? escHtml(p.liveUrl||'') : ''}" /></div>
      <div><label class="ia-label">Tags (comma-separated)</label><input id="p-tags" class="ia-input" value="${p ? escHtml((p.tags||[]).join(', ')) : ''}" /></div>
      <button class="ia-btn ia-btn-primary" style="width:100%;" onclick="saveProject('${p ? p._id : ''}')">Save Project</button>
    </div>
  `);
}
async function saveProject(id) {
  const title = document.getElementById('p-title').value.trim();
  const category = document.getElementById('p-cat').value.trim();
  if (!title) return alert('Title is required');
  if (!category) return alert('Category is required');
  const slug = document.getElementById('p-slug').value.trim();
  const body = {
    title,
    category,
    description: document.getElementById('p-desc').value,
    thumbnail: document.getElementById('p-thumb').value,
    clientName: document.getElementById('p-client').value,
    liveUrl: document.getElementById('p-url').value,
    tags: document.getElementById('p-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
  };
  if (slug) body.slug = slug;
  try {
    if (id) {
      await api(`/projects/${id}`, { method:'PUT', body:JSON.stringify(body) });
    } else {
      await api('/projects', { method:'POST', body:JSON.stringify(body) });
    }
    closeModal(); renderProjects();
  } catch(e) { alert('Error: ' + e.message); }
}
async function toggleProject(id) {
  try { await api(`/projects/${id}/toggle`, { method:'PATCH', body:'{}' }); renderProjects(); }
  catch(e) { alert(e.message); }
}
async function toggleProjectFeatured(id) {
  try { await api(`/projects/${id}/toggle-featured`, { method:'PATCH', body:'{}' }); renderProjects(); }
  catch(e) { alert(e.message); }
}
async function toggleProjectSelected(id) {
  try { await api(`/projects/${id}/toggle-selected`, { method:'PATCH', body:'{}' }); renderProjects(); }
  catch(e) { alert(e.message); }
}
async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  try { await api(`/projects/${id}`, { method:'DELETE' }); renderProjects(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   TESTIMONIALS
   FIX: toggle isActive added (UI button + backend PATCH route)
════════════════════════════════════════════════════ */
async function renderTestimonials() {
  const main = document.getElementById('main-content');
  try {
    const items = await api('/testimonials/all');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Testimonials</h1>
        <button class="ia-btn ia-btn-primary" onclick="showTestimonialForm()">+ Add</button>
      </div>
      <div class="ia-card">
        <table class="ia-table">
          <thead><tr><th>Name</th><th>Role / Company</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${items.map(t => `
              <tr>
                <td><strong>${t.name}</strong></td>
                <td style="color:var(--text2);">${t.role||''} ${t.company?'@ '+t.company:''}</td>
                <td>${'★'.repeat(t.rating)}</td>
                <td><span class="badge badge-${t.isActive?'active':'inactive'}">${t.isActive?'Active':'Hidden'}</span></td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="ia-btn ia-btn-ghost" onclick='showTestimonialForm(${JSON.stringify(t).replace(/'/g,"&#39;")})' style="padding:5px 10px;font-size:0.75rem;">Edit</button>
                    <button class="ia-btn ia-btn-ghost" onclick="toggleTestimonial('${t._id}')" style="padding:5px 10px;font-size:0.75rem;">${t.isActive?'Hide':'Show'}</button>
                    <button class="ia-btn ia-btn-danger" onclick="deleteTestimonial('${t._id}')" style="padding:5px 10px;font-size:0.75rem;">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text2);">No testimonials yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}
function showTestimonialForm(t = null) {
  showModal(t ? 'Edit Testimonial' : 'Add Testimonial', `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div><label class="ia-label">Name *</label><input id="t-name" class="ia-input" value="${t ? escHtml(t.name) : ''}" /></div>
      <div><label class="ia-label">Role</label><input id="t-role" class="ia-input" value="${t ? escHtml(t.role||'') : ''}" /></div>
      <div><label class="ia-label">Company</label><input id="t-company" class="ia-input" value="${t ? escHtml(t.company||'') : ''}" /></div>
      <div><label class="ia-label">Review *</label><textarea id="t-review" class="ia-input" rows="4">${t ? escHtml(t.review||'') : ''}</textarea></div>
      <div><label class="ia-label">Rating (1–5)</label><input id="t-rating" type="number" min="1" max="5" class="ia-input" value="${t ? (t.rating||5) : 5}" /></div>
      <div><label class="ia-label">Order</label><input id="t-order" type="number" class="ia-input" value="${t ? (t.order||0) : 0}" /></div>
      <button class="ia-btn ia-btn-primary" style="width:100%;" onclick="saveTestimonial('${t ? t._id : ''}')">Save</button>
    </div>
  `);
}
async function saveTestimonial(id) {
  const name = document.getElementById('t-name').value.trim();
  const review = document.getElementById('t-review').value.trim();
  if (!name) return alert('Name is required');
  if (!review) return alert('Review is required');
  const body = {
    name,
    role: document.getElementById('t-role').value,
    company: document.getElementById('t-company').value,
    review,
    rating: Number(document.getElementById('t-rating').value) || 5,
    order: Number(document.getElementById('t-order').value) || 0,
  };
  try {
    if (id) {
      await api(`/testimonials/${id}`, { method:'PUT', body:JSON.stringify(body) });
    } else {
      await api('/testimonials', { method:'POST', body:JSON.stringify(body) });
    }
    closeModal(); renderTestimonials();
  } catch(e) { alert('Error: ' + e.message); }
}
async function toggleTestimonial(id) {
  try { await api(`/testimonials/${id}/toggle`, { method:'PATCH', body:'{}' }); renderTestimonials(); }
  catch(e) { alert(e.message); }
}
async function deleteTestimonial(id) {
  if (!confirm('Delete this testimonial?')) return;
  try { await api(`/testimonials/${id}`, { method:'DELETE' }); renderTestimonials(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   PRICING
════════════════════════════════════════════════════ */
async function renderPricing() {
  const main = document.getElementById('main-content');
  try {
    const plans = await api('/pricing/all');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Pricing Plans</h1>
        <button class="ia-btn ia-btn-primary" onclick="showPricingForm()">+ Add Plan</button>
      </div>
      <div class="ia-card">
        <table class="ia-table">
          <thead><tr><th>Name</th><th>Cycle</th><th>Price</th><th>Popular</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${plans.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge badge-${p.billingCycle==='monthly'?'read':'approved'}">${p.billingCycle}</span></td>
                <td>${p.price}</td>
                <td>${p.isPopular ? '⭐ Yes' : '—'}</td>
                <td><span class="badge badge-${p.isActive?'active':'inactive'}">${p.isActive?'Active':'Hidden'}</span></td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="ia-btn ia-btn-ghost" onclick='showPricingForm(${JSON.stringify(p).replace(/'/g,"&#39;")})' style="padding:5px 10px;font-size:0.75rem;">Edit</button>
                    <button class="ia-btn ia-btn-danger" onclick="deletePlan('${p._id}')" style="padding:5px 10px;font-size:0.75rem;">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text2);">No plans yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}
function showPricingForm(p = null) {
  showModal(p ? 'Edit Plan' : 'Add Plan', `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div><label class="ia-label">Name *</label><input id="pp-name" class="ia-input" value="${p ? escHtml(p.name) : ''}" placeholder="e.g. Growth" /></div>
      <div>
        <label class="ia-label">Billing Cycle *</label>
        <select id="pp-cycle" class="ia-input">
          <option value="monthly" ${(!p || p.billingCycle==='monthly')?'selected':''}>Monthly</option>
          <option value="yearly"  ${(p && p.billingCycle==='yearly')?'selected':''}>Yearly</option>
        </select>
      </div>
      <div><label class="ia-label">Price * (e.g. ₹15,000)</label><input id="pp-price" class="ia-input" value="${p ? escHtml(p.price) : ''}" placeholder="₹15,000" /></div>
      <div><label class="ia-label">Period (e.g. /month)</label><input id="pp-period" class="ia-input" value="${p ? escHtml(p.period||'') : ''}" placeholder="/month" /></div>
      <div><label class="ia-label">Description</label><textarea id="pp-desc" class="ia-input" rows="2">${p ? escHtml(p.description||'') : ''}</textarea></div>
      <div><label class="ia-label">Features (one per line)</label><textarea id="pp-feats" class="ia-input" rows="5">${p ? escHtml((p.features||[]).join('\n')) : ''}</textarea></div>
      <div style="display:flex;align-items:center;gap:10px;">
        <input id="pp-pop" type="checkbox" ${p&&p.isPopular?'checked':''} />
        <label for="pp-pop" style="font-size:0.85rem;">Mark as Popular</label>
      </div>
      <div><label class="ia-label">Order</label><input id="pp-order" type="number" class="ia-input" value="${p ? (p.order||0) : 0}" /></div>
      <button class="ia-btn ia-btn-primary" style="width:100%;" onclick="savePlan('${p ? p._id : ''}')">Save Plan</button>
    </div>
  `);
}
async function savePlan(id) {
  const name = document.getElementById('pp-name').value.trim();
  const price = document.getElementById('pp-price').value.trim();
  const billingCycle = document.getElementById('pp-cycle').value;
  if (!name) return alert('Name is required');
  if (!price) return alert('Price is required');
  if (!billingCycle) return alert('Billing cycle is required');
  const body = {
    name,
    billingCycle,
    price,
    period: document.getElementById('pp-period').value,
    description: document.getElementById('pp-desc').value,
    features: document.getElementById('pp-feats').value.split('\n').filter(Boolean),
    isPopular: document.getElementById('pp-pop').checked,
    order: Number(document.getElementById('pp-order').value) || 0,
  };
  try {
    if (id) {
      await api(`/pricing/${id}`, { method:'PUT', body:JSON.stringify(body) });
    } else {
      await api('/pricing', { method:'POST', body:JSON.stringify(body) });
    }
    closeModal(); renderPricing();
  } catch(e) { alert('Error: ' + e.message); }
}
async function deletePlan(id) {
  if (!confirm('Delete this plan?')) return;
  try { await api(`/pricing/${id}`, { method:'DELETE' }); renderPricing(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   TEAM
   FIX: toggle isActive added (UI button + backend PATCH route)
════════════════════════════════════════════════════ */
async function renderTeam() {
  const main = document.getElementById('main-content');
  try {
    const members = await api('/team/all');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Team Members</h1>
        <button class="ia-btn ia-btn-primary" onclick="showTeamForm()">+ Add Member</button>
      </div>
      <div class="ia-card">
        <table class="ia-table">
          <thead><tr><th>Name</th><th>Role</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${members.map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td style="color:var(--text2);">${m.role}</td>
                <td>${m.order}</td>
                <td><span class="badge badge-${m.isActive?'active':'inactive'}">${m.isActive?'Active':'Hidden'}</span></td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="ia-btn ia-btn-ghost" onclick='showTeamForm(${JSON.stringify(m).replace(/'/g,"&#39;")})' style="padding:5px 10px;font-size:0.75rem;">Edit</button>
                    <button class="ia-btn ia-btn-ghost" onclick="toggleTeamMember('${m._id}')" style="padding:5px 10px;font-size:0.75rem;">${m.isActive?'Hide':'Show'}</button>
                    <button class="ia-btn ia-btn-danger" onclick="deleteTeamMember('${m._id}')" style="padding:5px 10px;font-size:0.75rem;">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text2);">No team members yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}
function showTeamForm(m = null) {
  showModal(m ? 'Edit Member' : 'Add Member', `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div><label class="ia-label">Name *</label><input id="m-name" class="ia-input" value="${m ? escHtml(m.name) : ''}" /></div>
      <div><label class="ia-label">Role *</label><input id="m-role" class="ia-input" value="${m ? escHtml(m.role) : ''}" /></div>
      <div><label class="ia-label">Bio</label><textarea id="m-bio" class="ia-input" rows="3">${m ? escHtml(m.bio||'') : ''}</textarea></div>
      <div><label class="ia-label">Photo URL</label><input id="m-photo" class="ia-input" value="${m ? escHtml(m.photo||'') : ''}" /></div>
      <div><label class="ia-label">LinkedIn / Connect URL</label><input id="m-url" class="ia-input" value="${m ? escHtml(m.connectUrl||'') : ''}" /></div>
      <div><label class="ia-label">Order</label><input id="m-order" type="number" class="ia-input" value="${m ? (m.order||0) : 0}" /></div>
      <button class="ia-btn ia-btn-primary" style="width:100%;" onclick="saveTeamMember('${m ? m._id : ''}')">Save</button>
    </div>
  `);
}
async function saveTeamMember(id) {
  const name = document.getElementById('m-name').value.trim();
  const role = document.getElementById('m-role').value.trim();
  if (!name) return alert('Name is required');
  if (!role) return alert('Role is required');
  const body = {
    name,
    role,
    bio: document.getElementById('m-bio').value,
    photo: document.getElementById('m-photo').value,
    connectUrl: document.getElementById('m-url').value,
    order: Number(document.getElementById('m-order').value) || 0,
  };
  try {
    if (id) {
      await api(`/team/${id}`, { method:'PUT', body:JSON.stringify(body) });
    } else {
      await api('/team', { method:'POST', body:JSON.stringify(body) });
    }
    closeModal(); renderTeam();
  } catch(e) { alert('Error: ' + e.message); }
}
async function toggleTeamMember(id) {
  try { await api(`/team/${id}/toggle`, { method:'PATCH', body:'{}' }); renderTeam(); }
  catch(e) { alert(e.message); }
}
async function deleteTeamMember(id) {
  if (!confirm('Delete this member?')) return;
  try { await api(`/team/${id}`, { method:'DELETE' }); renderTeam(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   REELS
   FIX: POST sends JSON body (videoUrl string)
   FIX: PATCH body included in toggle call
════════════════════════════════════════════════════ */
async function renderReels() {
  const main = document.getElementById('main-content');
  try {
    const reels = await api('/reels/all');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Reels</h1>
        <button class="ia-btn ia-btn-primary" onclick="showReelForm()">+ Add Reel</button>
      </div>
      <div class="ia-card">
        <table class="ia-table">
          <thead><tr><th>Title</th><th>Video URL</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${reels.map(r => `
              <tr>
                <td>${r.title||'—'}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2);font-size:0.78rem;">${r.videoUrl}</td>
                <td>${r.order}</td>
                <td><span class="badge badge-${r.isActive?'active':'inactive'}">${r.isActive?'Active':'Hidden'}</span></td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="ia-btn ia-btn-ghost" onclick="toggleReel('${r._id}')" style="padding:5px 10px;font-size:0.75rem;">${r.isActive?'Hide':'Show'}</button>
                    <button class="ia-btn ia-btn-danger" onclick="deleteReel('${r._id}')" style="padding:5px 10px;font-size:0.75rem;">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text2);">No reels yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}
function showReelForm() {
  showModal('Add Reel', `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div><label class="ia-label">Title (optional)</label><input id="r-title" class="ia-input" placeholder="Reel title…" /></div>
      <div>
        <label class="ia-label">Video URL *</label>
        <input id="r-url" class="ia-input" placeholder="/uploads/reels/video.mp4 or full URL" />
        <div class="ia-hint">Paste the URL path to your video file. Upload via Media Library first if needed.</div>
      </div>
      <div><label class="ia-label">Thumbnail URL (optional)</label><input id="r-thumb" class="ia-input" placeholder="/uploads/reels/thumb.jpg" /></div>
      <div><label class="ia-label">Order</label><input id="r-order" type="number" class="ia-input" value="0" /></div>
      <button class="ia-btn ia-btn-primary" style="width:100%;" onclick="saveReel()">Add Reel</button>
    </div>
  `);
}
async function saveReel() {
  const videoUrl = document.getElementById('r-url').value.trim();
  if (!videoUrl) return alert('Video URL is required');
  const body = {
    title: document.getElementById('r-title').value.trim(),
    videoUrl,
    thumbnail: document.getElementById('r-thumb').value.trim(),
    order: Number(document.getElementById('r-order').value) || 0,
  };
  try {
    await api('/reels', { method:'POST', body:JSON.stringify(body) });
    closeModal(); renderReels();
  } catch(e) { alert('Error: ' + e.message); }
}
async function toggleReel(id) {
  try { await api(`/reels/${id}/toggle`, { method:'PATCH', body:'{}' }); renderReels(); }
  catch(e) { alert(e.message); }
}
async function deleteReel(id) {
  if (!confirm('Delete this reel?')) return;
  try { await api(`/reels/${id}`, { method:'DELETE' }); renderReels(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   CREATIVE WORKS  ← NEW MODULE (was completely missing)
   Backend: POST /api/creative-works, GET /api/creative-works/all
   Fields: title, category, description, imageUrl, tags, clientName, isFeatured, order
════════════════════════════════════════════════════ */
async function renderCreativeWorks() {
  const main = document.getElementById('main-content');
  try {
    const works = await api('/creative-works/all');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Creative Works</h1>
        <button class="ia-btn ia-btn-primary" onclick="showCreativeWorkForm()">+ Add Work</button>
      </div>
      <div class="ia-card">
        <table class="ia-table">
          <thead><tr><th>Title</th><th>Category</th><th>Featured</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${works.map(w => `
              <tr>
                <td>
                  ${w.imageUrl ? `<img src="${w.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;margin-right:8px;vertical-align:middle;" onerror="this.style.display='none'" />` : ''}
                  <strong>${w.title}</strong>
                </td>
                <td style="color:var(--text2);">${w.category}</td>
                <td><span class="badge badge-${w.isFeatured?'active':'inactive'}">${w.isFeatured?'Yes':'No'}</span></td>
                <td><span class="badge badge-${w.isActive?'active':'inactive'}">${w.isActive?'Active':'Hidden'}</span></td>
                <td>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button class="ia-btn ia-btn-ghost" onclick='showCreativeWorkForm(${JSON.stringify(w).replace(/'/g,"&#39;")})' style="padding:5px 10px;font-size:0.75rem;">Edit</button>
                    <button class="ia-btn ia-btn-ghost" onclick="toggleCreativeWorkFeatured('${w._id}')" style="padding:5px 10px;font-size:0.75rem;">⭐</button>
                    <button class="ia-btn ia-btn-ghost" onclick="toggleCreativeWork('${w._id}')" style="padding:5px 10px;font-size:0.75rem;">${w.isActive?'Hide':'Show'}</button>
                    <button class="ia-btn ia-btn-danger" onclick="deleteCreativeWork('${w._id}')" style="padding:5px 10px;font-size:0.75rem;">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text2);">No creative works yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}
function showCreativeWorkForm(w = null) {
  showModal(w ? 'Edit Creative Work' : 'Add Creative Work', `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div><label class="ia-label">Title *</label><input id="cw-title" class="ia-input" value="${w ? escHtml(w.title) : ''}" placeholder="e.g. Brand Identity for XYZ" /></div>
      <div>
        <label class="ia-label">Category *</label>
        <input id="cw-cat" class="ia-input" value="${w ? escHtml(w.category) : ''}" placeholder="poster, logo, social, branding, packaging…" />
      </div>
      <div>
        <label class="ia-label">Image URL *</label>
        <input id="cw-img" class="ia-input" value="${w ? escHtml(w.imageUrl||'') : ''}" placeholder="/uploads/general/image.jpg" />
        <div class="ia-hint">Upload the image via Media Library first, then paste the URL here.</div>
      </div>
      <div><label class="ia-label">Description</label><textarea id="cw-desc" class="ia-input" rows="3">${w ? escHtml(w.description||'') : ''}</textarea></div>
      <div><label class="ia-label">Client Name</label><input id="cw-client" class="ia-input" value="${w ? escHtml(w.clientName||'') : ''}" /></div>
      <div><label class="ia-label">Tags (comma-separated)</label><input id="cw-tags" class="ia-input" value="${w ? escHtml((w.tags||[]).join(', ')) : ''}" /></div>
      <div style="display:flex;align-items:center;gap:10px;">
        <input id="cw-feat" type="checkbox" ${w&&w.isFeatured?'checked':''} />
        <label for="cw-feat" style="font-size:0.85rem;">Featured</label>
      </div>
      <div><label class="ia-label">Order</label><input id="cw-order" type="number" class="ia-input" value="${w ? (w.order||0) : 0}" /></div>
      <button class="ia-btn ia-btn-primary" style="width:100%;" onclick="saveCreativeWork('${w ? w._id : ''}')">Save Work</button>
    </div>
  `);
}
async function saveCreativeWork(id) {
  const title = document.getElementById('cw-title').value.trim();
  const category = document.getElementById('cw-cat').value.trim();
  const imageUrl = document.getElementById('cw-img').value.trim();
  if (!title) return alert('Title is required');
  if (!category) return alert('Category is required');
  if (!imageUrl) return alert('Image URL is required');
  const body = {
    title,
    category,
    imageUrl,
    description: document.getElementById('cw-desc').value,
    clientName: document.getElementById('cw-client').value,
    tags: document.getElementById('cw-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
    isFeatured: document.getElementById('cw-feat').checked,
    order: Number(document.getElementById('cw-order').value) || 0,
  };
  try {
    if (id) {
      await api(`/creative-works/${id}`, { method:'PUT', body:JSON.stringify(body) });
    } else {
      await api('/creative-works', { method:'POST', body:JSON.stringify(body) });
    }
    closeModal(); renderCreativeWorks();
  } catch(e) { alert('Error: ' + e.message); }
}
async function toggleCreativeWork(id) {
  try { await api(`/creative-works/${id}/toggle`, { method:'PATCH', body:'{}' }); renderCreativeWorks(); }
  catch(e) { alert(e.message); }
}
async function toggleCreativeWorkFeatured(id) {
  try { await api(`/creative-works/${id}/toggle-featured`, { method:'PATCH', body:'{}' }); renderCreativeWorks(); }
  catch(e) { alert(e.message); }
}
async function deleteCreativeWork(id) {
  if (!confirm('Delete this creative work?')) return;
  try { await api(`/creative-works/${id}`, { method:'DELETE' }); renderCreativeWorks(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   MEDIA
   FIX: folder selector added to upload UI
   FIX: proper fetch with auth, no Content-Type override
════════════════════════════════════════════════════ */
async function renderMedia() {
  const main = document.getElementById('main-content');
  try {
    const data = await api('/media');
    main.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:800;">Media Library</h1>
        <div style="display:flex;gap:10px;align-items:center;">
          <select id="media-folder" class="ia-input" style="width:auto;padding:8px 12px;">
            <option value="general">general</option>
            <option value="reels">reels</option>
            <option value="team">team</option>
            <option value="projects">projects</option>
            <option value="creative-works">creative-works</option>
            <option value="testimonials">testimonials</option>
          </select>
          <input type="file" id="media-file" multiple style="display:none;" onchange="uploadMedia()" />
          <button class="ia-btn ia-btn-primary" onclick="document.getElementById('media-file').click()">↑ Upload Files</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;">
        ${data.media.map(m => `
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;position:relative;">
            ${m.mimetype&&m.mimetype.startsWith('image') ? `<img src="${m.url}" style="width:100%;height:120px;object-fit:cover;" />` : `<div style="height:120px;display:flex;align-items:center;justify-content:center;font-size:2rem;">🎬</div>`}
            <div style="padding:8px;">
              <div style="font-size:0.72rem;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.originalName||m.filename}</div>
              <div style="font-size:0.68rem;color:var(--text2);margin-top:2px;opacity:0.6;">${m.folder||'general'}</div>
              <button onclick="copyUrl('${m.url}')" style="margin-top:4px;width:100%;padding:3px;background:rgba(184,125,232,0.1);border:1px solid rgba(184,125,232,0.2);color:var(--accent);border-radius:4px;cursor:pointer;font-size:0.68rem;">Copy URL</button>
            </div>
            <button onclick="deleteMedia('${m._id}')" style="position:absolute;top:6px;right:6px;background:rgba(248,113,113,0.8);border:none;color:white;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:0.7rem;">✕</button>
          </div>
        `).join('') || '<div style="color:var(--text2);grid-column:1/-1;text-align:center;padding:40px;">No media uploaded yet</div>'}
      </div>
    `;
  } catch(e) { main.innerHTML = `<div style="color:var(--danger);">Error: ${e.message}</div>`; }
}
async function uploadMedia() {
  const files = document.getElementById('media-file').files;
  if (!files.length) return;
  const folder = document.getElementById('media-folder') ? document.getElementById('media-folder').value : 'general';
  const formData = new FormData();
  Array.from(files).forEach(f => formData.append('files', f));
  try {
    const res = await fetch(`${API}/media/upload?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      // NOTE: Do NOT set Content-Type here — browser sets it with correct multipart boundary
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    renderMedia();
  } catch(e) { alert('Upload error: ' + e.message); }
}
function copyUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    alert('URL copied to clipboard: ' + url);
  }).catch(() => {
    prompt('Copy this URL:', url);
  });
}
async function deleteMedia(id) {
  if (!confirm('Delete this file? This cannot be undone.')) return;
  try { await api(`/media/${id}`, { method:'DELETE' }); renderMedia(); }
  catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════ */
async function renderSettings() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h1 style="font-size:1.6rem;font-weight:800;margin-bottom:24px;">Settings</h1>
    <div class="ia-card" style="margin-bottom:20px;">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:20px;">Change Password</h3>
      <div style="display:flex;flex-direction:column;gap:14px;max-width:400px;">
        <div><label class="ia-label">Current Password</label><input id="cur-pass" type="password" class="ia-input" /></div>
        <div><label class="ia-label">New Password</label><input id="new-pass" type="password" class="ia-input" /></div>
        <button class="ia-btn ia-btn-primary" onclick="changePassword()">Update Password</button>
      </div>
    </div>
    <div class="ia-card">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:6px;">Site Settings</h3>
      <p style="font-size:0.82rem;color:var(--text2);margin-bottom:20px;">Connect your backend to CMS settings for logo, meta info, social links, etc.</p>
      <div style="color:var(--text2);font-size:0.85rem;">Site settings management is available via <code style="background:var(--bg3);padding:2px 6px;border-radius:4px;">PUT /api/settings</code></div>
    </div>
  `;
}
async function changePassword() {
  const cur = document.getElementById('cur-pass').value;
  const nw  = document.getElementById('new-pass').value;
  if (!cur || !nw) return alert('Both fields are required');
  try {
    await api('/auth/change-password', { method:'POST', body:JSON.stringify({ currentPassword: cur, newPassword: nw }) });
    alert('Password updated successfully.');
  } catch(e) { alert(e.message); }
}

/* ════════════════════════════════════════════════════
   MODAL HELPERS
════════════════════════════════════════════════════ */
function showModal(title, html) {
  // Remove existing modal if open
  const existing = document.getElementById('ia-modal');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'ia-modal-bg';
  el.id = 'ia-modal';
  el.innerHTML = `
    <div class="ia-modal">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h3 style="font-size:1.05rem;font-weight:700;">${title}</h3>
        <button onclick="closeModal()" style="background:none;border:none;color:var(--text2);font-size:1.3rem;cursor:pointer;">✕</button>
      </div>
      ${html}
    </div>
  `;
  el.addEventListener('click', e => { if (e.target === el) closeModal(); });
  document.body.appendChild(el);
}
function closeModal() {
  const el = document.getElementById('ia-modal');
  if (el) el.remove();
}

/* ── Utility: HTML escape to prevent XSS in form values ── */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════ */
(async function boot() {
  if (!token) { renderLogin(); return; }
  try {
    const admin = await api('/auth/me');
    if (admin) renderShell(admin.name);
  } catch {
    if (token) logout();
  }
})();
