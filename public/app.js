// ---------------------------
// API + auth header
// ---------------------------
const API = {
  patients: '/api/patients',
  appointments: '/api/appointments',
  billing: '/api/billing'
};

// Read token once per page load for requests made from this page
const token = localStorage.getItem('token');
const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
const $ = sel => document.querySelector(sel);

function guardAuth() {
  if (!localStorage.getItem('token')) location.href = 'index.html';
}
window.guardAuth = guardAuth;

async function getJSON(url) {
  try {
    const r = await fetch(url, { headers });
    return await r.json();
  } catch {
    return null;
  }
}

let rows = []; // reused for filtering

// ---------------------------
// PATIENTS
// ---------------------------
async function loadPatientsTable() {
  const data = await getJSON(API.patients + '?limit=50');
  rows = (data && data.items) ? data.items : [];
  renderPatients(rows);
}
function renderPatients(list) {
  const tb = $('#tbl tbody');
  if (!tb) return;
  tb.innerHTML = list.map(r => `
    <tr><td>${r.name ?? '-'}</td><td>${r.phone ?? '-'}</td><td>${r.age ?? '-'}</td><td>${(r.last_visit || '').slice(0,10) || '-'}</td></tr>
  `).join('');
}

// ---------------------------
// APPOINTMENTS
// ---------------------------
async function loadAppointmentsTable() {
  const data = await getJSON(API.appointments + '?limit=50');
  rows = (data && data.items) ? data.items : [];
  renderAppointments(rows);
}
function renderAppointments(list) {
  const tb = $('#tbl tbody');
  if (!tb) return;
  tb.innerHTML = list.map(r => `
    <tr><td>${r.patient_name ?? '-'}</td><td>${r.doctor_name ?? '-'}</td><td>${(r.scheduled_at || '').replace('T',' ').slice(0,16) || '-'}</td><td>${r.status ?? '-'}</td></tr>
  `).join('');
}

// ---------------------------
// BILLING
// ---------------------------
async function loadBillingTable() {
  const data = await getJSON(API.billing + '?limit=50');
  rows = (data && data.items) ? data.items : [];
  renderBilling(rows);
}
function renderBilling(list) {
  const tb = $('#tbl tbody');
  if (!tb) return;
  tb.innerHTML = list.map(r => `
    <tr><td>${r.bill_no ?? '-'}</td><td>${r.patient_name ?? '-'}</td><td>${r.amount ?? 0}</td><td>${r.status ?? '-'}</td><td>${(r.created_at || '').slice(0,10) || '-'}</td></tr>
  `).join('');
}

// ---------------------------
// Dashboard metrics
// ---------------------------
async function loadMetrics() {
  const p = await getJSON(API.patients + '?limit=1') || {};
  const a = await getJSON(API.appointments + '?range=next24h') || {};
  const b = await getJSON(API.billing + '?status=unpaid&limit=1') || {};
  $('#mPatients')     && ($('#mPatients').textContent = p.total ?? 0);
  $('#mPatientsDelta')&& ($('#mPatientsDelta').textContent = p.delta ?? '+0');
  $('#mAppts')        && ($('#mAppts').textContent = a.total ?? 0);
  $('#mUnpaid')       && ($('#mUnpaid').textContent = b.total ?? 0);
}

// ---------------------------
// Shared search / refresh / logout
// ---------------------------
function bindCommonUI(loader) {
  // Search filter
  $('#q')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q));
    const page = document.body.dataset.page;
    if (page === 'patients') renderPatients(filtered);
    if (page === 'appointments') renderAppointments(filtered);
    if (page === 'billing') renderBilling(filtered);
  });

  // Refresh button
  $('#refreshBtn')?.addEventListener('click', async () => {
    await loader();
    toast('Refreshed');
  });

  // Logout button (fix)
  $('#logout')?.addEventListener('click', e => {
    e.preventDefault();
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    } catch {}
    // Use replace so back button doesn't reopen a cached protected page
    window.location.replace('index.html');
  });
}

function toast(msg) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.remove('hidden');
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => t.classList.remove('show'), 1500);
}

// ---------------------------
// Router
// ---------------------------
async function bootPage() {
  const page = document.body.dataset.page || 'dashboard';
  if (page === 'dashboard')  { await Promise.all([loadMetrics(), loadPatientsTable()]); bindCommonUI(loadPatientsTable); return; }
  if (page === 'patients')   { await loadPatientsTable(); bindCommonUI(loadPatientsTable); return; }
  if (page === 'appointments'){ await loadAppointmentsTable(); bindCommonUI(loadAppointmentsTable); return; }
  if (page === 'billing')    { await loadBillingTable(); bindCommonUI(loadBillingTable); return; }
}
window.bootPage = bootPage;

// ---------------------------
// Auto-boot on DOM ready (this is the missing piece)
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  // If we're not on login, enforce auth
  const isLogin = /(?:^|\/)(index\.html)?$/.test(location.pathname);
  if (!isLogin && !localStorage.getItem('token')) {
    location.href = 'index.html';
    return;
  }
  bootPage().catch(() => {});
});

// ---------------------------
// Modals (existing)
// ---------------------------

// Patients
$('#newPatientBtn')?.addEventListener('click', () => $('#patientModal').classList.add('show'));
$('#cancelPatient')?.addEventListener('click', e => { e.preventDefault(); $('#patientModal').classList.remove('show'); });
$('#savePatient')?.addEventListener('click', async e => {
  e.preventDefault();
  const name = $('#p_name').value.trim();
  const phone = $('#p_phone').value.trim();
  const age = parseInt($('#p_age').value, 10) || null;
  const last_visit = $('#p_last').value.trim() || null;
  if (!name) { alert('Name required'); return; }
  const res = await fetch(API.patients, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ name, phone, age, last_visit })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { alert(data.message || 'Failed'); return; }
  $('#p_name').value = $('#p_phone').value = $('#p_age').value = $('#p_last').value = '';
  $('#patientModal').classList.remove('show');
  await loadPatientsTable(); toast('Patient added');
});

// Appointments
$('#addApptBtn')?.addEventListener('click', () => $('#apptModal').classList.add('show'));
$('#cancelAppt')?.addEventListener('click', e => { e.preventDefault(); $('#apptModal').classList.remove('show'); });
function toISOLocal(s) { if (!s) return null; const t = s.replace(' ','T'); return t.length === 16 ? t + ':00' : t; }
$('#saveAppt')?.addEventListener('click', async e => {
  e.preventDefault();
  const patient_id = parseInt($('#a_patient_id').value, 10);
  const doctor_name = $('#a_doctor').value.trim();
  const scheduled_at = toISOLocal($('#a_when').value.trim());
  const status = $('#a_status').value;
  if (!patient_id || !doctor_name || !scheduled_at) { alert('Fill all'); return; }
  const res = await fetch(API.appointments, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ patient_id, doctor_name, scheduled_at, status })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { alert(data.message || 'Failed'); return; }
  $('#a_patient_id').value = $('#a_doctor').value = $('#a_when').value = '';
  $('#a_status').value = 'scheduled';
  $('#apptModal').classList.remove('show');
  await loadAppointmentsTable(); toast('Appointment created');
});

// Billing
$('#newBillBtn')?.addEventListener('click', () => $('#billModal').classList.add('show'));
$('#cancelBill')?.addEventListener('click', e => { e.preventDefault(); $('#billModal').classList.remove('show'); });
$('#saveBill')?.addEventListener('click', async e => {
  e.preventDefault();
  const patient_id = parseInt($('#patientId').value, 10);
  const lines = $('#items').value.split('\n').map(s => s.trim()).filter(Boolean);
  const items = lines.map(l => { const [a, b, c] = l.split(',').map(v => v.trim()); return { item: a, price: +b, qty: +c }; });
  if (!patient_id || !items.length) { alert('Fill fields'); return; }
  const res = await fetch(API.billing, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ patient_id, items })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { alert(data.message || 'Failed'); return; }
  $('#patientId').value = $('#amount').value = $('#items').value = '';
  $('#billModal').classList.remove('show');
  await loadBillingTable(); toast('Bill created');
});
