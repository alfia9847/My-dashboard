// ════════════════════════════════════════
// DATA
// ════════════════════════════════════════

let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
let expenses  = JSON.parse(localStorage.getItem('expenses')  || '[]');

function save() {
  localStorage.setItem('reminders', JSON.stringify(reminders));
  localStorage.setItem('expenses',  JSON.stringify(expenses));
}


// ════════════════════════════════════════
// CLOCK
// ════════════════════════════════════════

function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) +
    ' · ' +
    now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

setInterval(updateClock, 1000);
updateClock();


// ════════════════════════════════════════
// TABS
// ════════════════════════════════════════

function switchTab(name, clickedBtn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  clickedBtn.classList.add('active');
  renderAll();
}


// ════════════════════════════════════════
// REMINDERS — ADD
// ════════════════════════════════════════

function addReminder() {
  const title = document.getElementById('r-title').value.trim();
  const note  = document.getElementById('r-note').value.trim();
  const time  = document.getElementById('r-time').value;
  const cat   = document.getElementById('r-category').value;

  if (!title) { alert('Please write what you want to remember!'); return; }
  if (!time)  { alert('Please pick a date and time!'); return; }

  reminders.push({
    id:   Date.now(),
    title,
    note,
    time,
    cat,
    done: false
  });

  save();

  document.getElementById('r-title').value = '';
  document.getElementById('r-note').value  = '';
  document.getElementById('r-time').value  = '';

  renderAll();
}


// ════════════════════════════════════════
// REMINDERS — DELETE & DONE
// ════════════════════════════════════════

function deleteReminder(id) {
  reminders = reminders.filter(r => r.id !== id);
  save();
  renderAll();
}

function toggleDone(id) {
  const r = reminders.find(r => r.id === id);
  if (r) r.done = !r.done;
  save();
  renderAll();
}


// ════════════════════════════════════════
// REMINDERS — HELPERS
// ════════════════════════════════════════

function urgencyClass(timeStr) {
  const diff = new Date(timeStr) - new Date();
  if (diff < 0)        return 'overdue';
  if (diff < 3600000)  return 'urgent';
  if (diff < 86400000) return 'soon';
  return '';
}

function formatTime(timeStr) {
  return new Date(timeStr).toLocaleString('en-IN', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true
  });
}


// ════════════════════════════════════════
// REMINDERS — RENDER
// ════════════════════════════════════════

function renderReminders() {
  const list = document.getElementById('reminder-list');

  const active = reminders.filter(r => !r.done).sort((a, b) => new Date(a.time) - new Date(b.time));
  const done   = reminders.filter(r => r.done);
  const all    = [...active, ...done];

  if (!all.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🗒️</div>
        No reminders yet. Add one above!
      </div>`;
    return;
  }

  const tagClass = {
    study:    'tag-study',
    personal: 'tag-personal',
    finance:  'tag-finance',
    other:    'tag-other'
  };
  const tagLabel = {
    study:    '📚 Study',
    personal: '🌱 Personal',
    finance:  '💰 Finance',
    other:    '📌 Other'
  };

  list.innerHTML = all.map(r => {
    const urg = r.done ? '' : urgencyClass(r.time);

    let urgBadge = '';
    if (urg === 'urgent')  urgBadge = '<span style="color:var(--danger)"> ⚡ Due soon!</span>';
    if (urg === 'soon')    urgBadge = '<span style="color:var(--warn)"> ⏳ Today</span>';
    if (urg === 'overdue') urgBadge = '<span style="color:var(--muted)"> ✔ Overdue</span>';

    return `
    <div class="reminder-item ${r.done ? 'done' : urg}">
      <div>
        <div class="reminder-text">
          ${r.done ? '✅ ' : ''} ${r.title}
          <span class="reminder-tag ${tagClass[r.cat]}">${tagLabel[r.cat]}</span>
        </div>
        ${r.note ? `<div class="reminder-meta">${r.note}</div>` : ''}
        <div class="reminder-meta">🕐 ${formatTime(r.time)} ${urgBadge}</div>
      </div>
      <div class="reminder-actions">
        <button
          class="btn btn-sm"
          style="background:var(--surface);border:1px solid var(--border);color:var(--text)"
          onclick="toggleDone(${r.id})">
          ${r.done ? 'Undo' : 'Done'}
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteReminder(${r.id})">
          Delete
        </button>
      </div>
    </div>`;
  }).join('');
}


// ════════════════════════════════════════
// EXPENSES — ADD
// ════════════════════════════════════════

function addExpense() {
  const name   = document.getElementById('e-name').value.trim();
  const amount = parseFloat(document.getElementById('e-amount').value);
  const cat    = document.getElementById('e-category').value;
  const date   = document.getElementById('e-date').value || new Date().toISOString().split('T')[0];

  if (!name)                  { alert('Please enter what you spent on!'); return; }
  if (!amount || amount <= 0) { alert('Please enter a valid amount!'); return; }

  expenses.push({ id: Date.now(), name, amount, cat, date });
  save();

  document.getElementById('e-name').value   = '';
  document.getElementById('e-amount').value = '';

  renderAll();
}


// ════════════════════════════════════════
// EXPENSES — DELETE
// ════════════════════════════════════════

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  renderAll();
}


// ════════════════════════════════════════
// EXPENSES — RENDER
// ════════════════════════════════════════

function renderExpenses() {
  const list = document.getElementById('expense-list');
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  const now      = new Date();
  const totalAmt = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthAmt = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  document.getElementById('exp-total').textContent = '₹' + totalAmt.toLocaleString('en-IN');
  document.getElementById('exp-month').textContent = '₹' + monthAmt.toLocaleString('en-IN');
  document.getElementById('exp-count').textContent = expenses.length;

  if (!sorted.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">💳</div>
        No expenses logged yet!
      </div>`;
    return;
  }

  list.innerHTML = sorted.map(e => `
    <div class="expense-item">
      <div class="expense-left">
        <div class="expense-icon" style="background:var(--surface)">${e.cat}</div>
        <div>
          <div class="expense-name">${e.name}</div>
          <div class="expense-date">
            ${new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px">
        <div class="expense-amount neg">−₹${e.amount.toLocaleString('en-IN')}</div>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${e.id})">✕</button>
      </div>
    </div>
  `).join('');
}


// ════════════════════════════════════════
// DASHBOARD — RENDER
// ════════════════════════════════════════

function renderDashboard() {
  const now = new Date();

  const activeCount = reminders.filter(r => !r.done).length;
  const totalSpent  = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthSpent  = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  document.getElementById('stat-reminders').textContent = activeCount;
  document.getElementById('stat-spent').textContent     = '₹' + totalSpent.toLocaleString('en-IN');
  document.getElementById('stat-month').textContent     = '₹' + monthSpent.toLocaleString('en-IN');

  const upEl     = document.getElementById('dash-upcoming');
  const upcoming = reminders
    .filter(r => !r.done && new Date(r.time) > now)
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .slice(0, 4);

  upEl.innerHTML = upcoming.length
    ? upcoming.map(r => `
        <div class="upcoming-item">
          <div>${r.title}</div>
          <div class="u-time">🕐 ${formatTime(r.time)}</div>
        </div>`).join('')
    : `<div class="empty"><div class="empty-icon">✅</div>No upcoming reminders!</div>`;

  const reEl   = document.getElementById('dash-recent');
  const recent = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  reEl.innerHTML = recent.length
    ? recent.map(e => `
        <div class="expense-item" style="margin-bottom:8px">
          <div class="expense-left">
            <div class="expense-icon" style="background:var(--surface)">${e.cat}</div>
            <div>
              <div class="expense-name">${e.name}</div>
              <div class="expense-date">
                ${new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>
          <div class="expense-amount neg">−₹${e.amount.toLocaleString('en-IN')}</div>
        </div>`).join('')
    : `<div class="empty"><div class="empty-icon">💸</div>No expenses yet!</div>`;
}


// ════════════════════════════════════════
// RENDER ALL
// ════════════════════════════════════════

function renderAll() {
  renderReminders();
  renderExpenses();
  renderDashboard();
}


// ════════════════════════════════════════
// NOTIFICATIONS — FIXED VERSION
// ════════════════════════════════════════


function showNotif(title, note) {
  document.getElementById('notif-body').textContent = title + (note ? ' — ' + note : '');
  document.getElementById('notif-popup').style.display = 'block';

  // ── NOTIFICATION SOUND ──
  // This creates a beep sound using Web Audio API
  // No extra sound file needed — JavaScript generates it!
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // First beep
    const beep1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    beep1.connect(gain1);
    gain1.connect(audioCtx.destination);
    beep1.frequency.value = 880; // high pitch sound
    gain1.gain.value = 0.3;      // volume (0 to 1)
    beep1.start(audioCtx.currentTime);
    beep1.stop(audioCtx.currentTime + 0.2); // play for 0.2 seconds

    // Second beep (plays after first one)
    const beep2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    beep2.connect(gain2);
    gain2.connect(audioCtx.destination);
    beep2.frequency.value = 1100; // slightly higher pitch
    gain2.gain.value = 0.3;
    beep2.start(audioCtx.currentTime + 0.3); // starts after 0.3 seconds
    beep2.stop(audioCtx.currentTime + 0.5);  // plays for 0.2 seconds

  } catch (e) {
    console.log('Sound not supported:', e);
  }

  setTimeout(() => {
    document.getElementById('notif-popup').style.display = 'none';
  }, 8000);

  if (Notification.permission === 'granted') {
    new Notification('🔔 Reminder!', { body: title });
  }
}

function closeNotif() {
  document.getElementById('notif-popup').style.display = 'none';
}

// Using localStorage instead of sessionStorage
// so notified reminders are remembered even after refresh
const notifiedIds = new Set(JSON.parse(localStorage.getItem('notified') || '[]'));

function checkReminders() {
  const now = new Date();
  reminders.forEach(r => {
    if (r.done || notifiedIds.has(r.id)) return;
    const diff = new Date(r.time) - now;
    // Fire if reminder just arrived or passed within last 2 minutes
    if (diff <= 0 && diff >= -120000) {
      showNotif(r.title, r.note);
      notifiedIds.add(r.id);
      // Save to localStorage so we don't notify again
      localStorage.setItem('notified', JSON.stringify([...notifiedIds]));
    }
  });
}

// Check every 10 seconds — much more reliable than 30
setInterval(checkReminders, 10000);
// Also check immediately when page opens — don't wait 10 seconds
checkReminders();

if (Notification.permission === 'default') {
  Notification.requestPermission();
}


// ════════════════════════════════════════
// ON PAGE LOAD
// ════════════════════════════════════════

document.getElementById('e-date').value = new Date().toISOString().split('T')[0];

renderAll();