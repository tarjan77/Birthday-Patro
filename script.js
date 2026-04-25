/**
 * Birthday Patro — script.js
 * =============================================================
 * Core features:
 *  • BS ↔ AD date conversion (Bikram Sambat <-> Gregorian)
 *  • CRUD birthdays stored in localStorage
 *  • Upcoming birthdays sorted by nearest date
 *  • Browser Web Notification API reminders
 *  • Search by name
 *  • Placeholder functions for future Firebase sync
 *
 * MyPatro Integration
 * ─────────────────────────────────────────────────────────────
 * nepali_date.js from mypatro.com is a DISPLAY WIDGET only.
 * It calls their REST API and injects today's BS date (as HTML)
 * into the element with id="mypatro_nepali_date".
 * It does NOT expose any conversion functions.
 *
 * All BS↔AD conversion logic lives in this file using our own
 * lookup-table engine, which works fully offline.
 * =============================================================
 */

/**
 * Fallback: returns today's BS date as a plain string.
 * Called by index.html's onerror handler if the MyPatro CDN is
 * unreachable, so the header widget still shows something useful.
 * Exposed on window so the inline script can reach it.
 */
window._bsToday = function () {
  try {
    const bs = adToBs(new Date());
    return `${bs.year} ${BS_MONTH_NAMES[bs.month - 1]} ${bs.day}`;
  } catch {
    return '';
  }
};

/* ═══════════════════════════════════════════════════════════════
   BS ↔ AD CONVERSION ENGINE
   Based on the known BS-AD epoch and a lookup table of BS month lengths.
   BS epoch: Baisakh 1, 2000 BS = April 13, 1943 AD
   Reference table covers 2000–2099 BS.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Number of days in each month for BS years 2000–2099.
 * Each row = [year, days in each of 12 months]
 * Source: public domain BS calendar data.
 */
const BS_MONTH_DAYS = {
  2000:[30,32,31,32,31,30,30,30,29,30,29,31],
  2001:[31,31,32,31,31,31,30,29,30,29,30,30],
  2002:[31,31,32,32,31,30,30,29,30,29,30,30],
  2003:[31,32,31,32,31,30,30,30,29,29,30,31],
  2004:[30,32,31,32,31,30,30,30,29,30,29,31],
  2005:[31,31,32,31,31,31,30,29,30,29,30,30],
  2006:[31,31,32,32,31,30,30,29,30,29,30,30],
  2007:[31,32,31,32,31,30,30,30,29,29,30,31],
  2008:[31,31,31,32,31,31,29,30,30,29,29,31],
  2009:[31,31,32,31,31,31,30,29,30,29,30,30],
  2010:[31,31,32,32,31,30,30,29,30,29,30,30],
  2011:[31,32,31,32,31,30,30,30,29,29,30,31],
  2012:[31,31,31,32,31,31,29,30,30,29,30,30],
  2013:[31,31,32,31,31,31,30,29,30,29,30,30],
  2014:[31,31,32,32,31,30,30,29,30,29,30,30],
  2015:[31,32,31,32,31,30,30,30,29,29,30,31],
  2016:[31,31,31,32,31,31,29,30,30,29,30,30],
  2017:[31,31,32,31,31,31,30,29,30,29,30,30],
  2018:[31,32,31,32,31,30,30,29,30,29,30,30],
  2019:[31,32,31,32,31,30,30,30,29,29,30,31],
  2020:[31,31,31,32,31,31,30,29,30,29,30,30],
  2021:[31,31,32,31,31,31,30,29,30,29,30,30],
  2022:[31,32,31,32,31,30,30,30,29,29,30,30],
  2023:[31,32,31,32,31,30,30,30,29,29,30,31],
  2024:[31,31,31,32,31,31,30,29,30,29,30,30],
  2025:[31,31,32,31,31,31,30,29,30,29,30,30],
  2026:[31,32,31,32,31,30,30,30,29,29,30,31],
  2027:[30,32,31,32,31,30,30,30,29,30,29,31],
  2028:[31,31,32,31,31,31,30,29,30,29,30,30],
  2029:[31,31,32,31,32,30,30,29,30,29,30,30],
  2030:[31,32,31,32,31,30,30,30,29,29,30,31],
  2031:[30,32,31,32,31,30,30,30,29,30,29,31],
  2032:[31,31,32,31,31,31,30,29,30,29,30,30],
  2033:[31,31,32,32,31,30,30,29,30,29,30,30],
  2034:[31,32,31,32,31,30,30,30,29,29,30,31],
  2035:[30,32,31,32,31,31,29,30,30,29,29,31],
  2036:[31,31,32,31,31,31,30,29,30,29,30,30],
  2037:[31,31,32,32,31,30,30,29,30,29,30,30],
  2038:[31,32,31,32,31,30,30,30,29,29,30,31],
  2039:[31,31,31,32,31,31,29,30,30,29,30,30],
  2040:[31,31,32,31,31,31,30,29,30,29,30,30],
  2041:[31,31,32,32,31,30,30,29,30,29,30,30],
  2042:[31,32,31,32,31,30,30,30,29,29,30,31],
  2043:[31,31,31,32,31,31,29,30,30,29,30,30],
  2044:[31,31,32,31,31,31,30,29,30,29,30,30],
  2045:[31,32,31,32,31,30,30,29,30,29,30,30],
  2046:[31,32,31,32,31,30,30,30,29,29,30,31],
  2047:[31,31,32,32,31,30,30,29,30,29,30,30],  
  2048:[31,31,32,31,31,31,30,29,30,29,30,30],
  2049:[31,32,31,32,31,30,30,30,29,29,30,31],
  2050:[31,32,31,32,31,30,30,30,29,29,30,31],
  2051:[31,31,32,31,31,31,30,29,30,29,30,30],
  2052:[31,31,32,32,31,30,30,29,30,29,30,30],
  2053:[31,32,31,32,31,30,30,30,29,29,30,31],
  2054:[31,31,32,32,31,30,30,29,30,29,30,30],
  2055:[31,31,32,31,31,31,30,29,30,29,30,30],
  2056:[31,32,31,32,31,30,30,29,30,29,30,30],
  2057:[31,32,31,32,31,30,30,30,29,29,30,31],
  2058:[31,31,31,32,31,31,30,29,30,29,30,30],
  2059:[31,31,32,31,31,31,30,29,30,29,30,30],
  2060:[31,31,32,32,31,30,30,30,29,29,30,30],
  2061:[31,32,31,32,31,30,30,30,29,29,30,31],
  2062:[30,32,31,32,31,31,29,30,29,30,29,31],
  2063:[31,31,32,31,31,31,30,29,30,29,30,30],
  2064:[31,31,32,32,31,30,30,29,30,29,30,30],
  2065:[31,32,31,32,31,30,30,30,29,29,30,31],
  2066:[31,31,31,32,31,31,29,30,30,29,30,30],
  2067:[31,31,32,31,31,31,30,29,30,29,30,30],
  2068:[31,32,31,32,31,30,30,29,30,29,30,30],
  2069:[31,32,31,32,31,30,30,30,29,29,30,31],
  2070:[31,31,31,32,31,31,30,29,30,29,30,30],
  2071:[31,31,32,31,31,31,30,29,30,29,30,30],
  2072:[31,32,31,32,31,30,30,29,30,29,30,30],
  2073:[31,32,31,32,31,30,30,30,29,29,30,31],
  2074:[31,31,31,32,31,31,30,29,30,29,30,30],
  2075:[31,31,32,31,31,31,30,29,30,29,30,30],
  2076:[31,32,31,32,31,30,30,30,29,29,30,30],
  2077:[31,32,31,32,31,30,30,30,29,29,30,31],
  2078:[31,31,31,32,31,31,30,29,30,29,30,30],
  2079:[31,31,32,31,31,31,30,29,30,29,30,30],
  2080:[31,32,31,32,31,30,30,30,29,29,30,30],
  2081:[31,31,31,32,31,31,30,29,30,29,30,30],
  2082:[30,32,31,32,31,30,30,30,29,30,29,31],
  2083:[31,31,32,31,31,31,30,29,30,29,30,30],
  2084:[31,31,32,32,31,30,30,29,30,29,30,30],
  2085:[31,32,31,32,31,30,30,30,29,29,30,31],
  2086:[30,32,31,32,31,31,29,30,30,29,29,31],
  2087:[31,31,32,31,31,31,30,29,30,29,30,30],
  2088:[31,31,32,32,31,30,30,29,30,29,30,30],
  2089:[31,32,31,32,31,30,30,30,29,29,30,31],
  2090:[30,32,31,32,31,31,29,30,30,29,30,30],
  2091:[31,31,32,31,31,31,30,29,30,29,30,30],
  2092:[31,31,32,32,31,30,30,29,30,29,30,30],
  2093:[31,32,31,32,31,30,30,30,29,29,30,31],
  2094:[31,31,31,32,31,31,29,30,30,29,30,30],
  2095:[31,31,32,31,31,31,30,29,30,29,30,30],
  2096:[31,32,31,32,31,30,30,29,30,29,30,30],
  2097:[31,32,31,32,31,30,30,30,29,29,30,31],
  2098:[31,31,31,32,31,31,29,30,30,29,30,30],
  2099:[31,31,32,31,31,31,30,29,30,29,30,30],
  2100:[31,32,31,32,31,30,30,29,30,29,30,30],
};

/* The BS epoch: BS 2000 Baisakh 1 = AD 1943 April 13 */
const BS_EPOCH_YEAR    = 2000;
const BS_EPOCH_MONTH   = 1;
const BS_EPOCH_DAY     = 1;
const AD_EPOCH_YEAR    = 1943;
const AD_EPOCH_MONTH   = 4;   // April
const AD_EPOCH_DAY     = 14;  // 14 April 1943

const BS_MONTH_NAMES = [
  'Baisakh','Jestha','Ashadh','Shrawan',
  'Bhadra','Ashwin','Kartik','Mangsir',
  'Poush','Magh','Falgun','Chaitra'
];
const BS_MONTH_NP = [
  'बैशाख','जेठ','असार','साउन',
  'भाद्र','असोज','कार्तिक','मंसिर',
  'पुष','माघ','फागुन','चैत'
];
const AD_MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec'
];

/** Count total days from BS epoch to a BS date */
function bsToDaysFromEpoch(bsY, bsM, bsD) {
  let days = 0;
  for (let y = BS_EPOCH_YEAR; y < bsY; y++) {
    const months = BS_MONTH_DAYS[y];
    if (!months) throw new Error(`BS year ${y} not in table`);
    days += months.reduce((a, b) => a + b, 0);
  }
  const months = BS_MONTH_DAYS[bsY];
  if (!months) throw new Error(`BS year ${bsY} not in table`);
  for (let m = 1; m < bsM; m++) days += months[m - 1];
  days += bsD - 1;
  return days;
}

/** Convert BS date → AD date (returns JS Date) */
function bsToAd(bsY, bsM, bsD) {
  const daysFromEpoch = bsToDaysFromEpoch(bsY, bsM, bsD);
  const adEpoch = new Date(AD_EPOCH_YEAR, AD_EPOCH_MONTH - 1, AD_EPOCH_DAY);
  adEpoch.setDate(adEpoch.getDate() + daysFromEpoch);
  return adEpoch;
}

/** Convert AD date → BS date (returns {year, month, day}) */
function adToBs(adDate) {
  const adEpoch = new Date(AD_EPOCH_YEAR, AD_EPOCH_MONTH - 1, AD_EPOCH_DAY);
  let diff = Math.floor((adDate - adEpoch) / (1000 * 60 * 60 * 24));
  if (diff < 0) throw new Error('Date before BS 2000');

  let bsY = BS_EPOCH_YEAR;
  while (true) {
    const months = BS_MONTH_DAYS[bsY];
    if (!months) throw new Error(`BS year ${bsY} not in table`);
    const totalDays = months.reduce((a, b) => a + b, 0);
    if (diff < totalDays) break;
    diff -= totalDays;
    bsY++;
  }

  const months = BS_MONTH_DAYS[bsY];
  let bsM = 1;
  while (diff >= months[bsM - 1]) {
    diff -= months[bsM - 1];
    bsM++;
  }

  return { year: bsY, month: bsM, day: diff + 1 };
}

/** Format BS date as string */
function formatBs(y, m, d) {
  return `${y} ${BS_MONTH_NAMES[m - 1]} ${d}`;
}
/** Format AD Date as string */
function formatAd(date) {
  return `${date.getDate()} ${AD_MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/* ═══════════════════════════════════════════════════════════════
   DATA LAYER — localStorage
   ═══════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'birthdayPatro_v1';

function loadBirthdays() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveBirthdays(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ═══════════════════════════════════════════════════════════════
   REMINDER / NOTIFICATION ENGINE
   ═══════════════════════════════════════════════════════════════ */
let notifPermission = Notification.permission || 'default';

/** Request notification permission when user enables reminders */
async function requestNotifPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  notifPermission = result;
  return result === 'granted';
}

/** Show browser notification */
function showBrowserNotif(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '🎂' });
}

/** Show in-app banner notification */
function showAppBanner(msg) {
  const banner = document.getElementById('appNotifBanner');
  banner.innerHTML = `🎂 ${msg} <button onclick="this.parentElement.classList.add('hidden')" style="margin-left:auto;background:rgba(255,255,255,.3);border:none;border-radius:6px;padding:.2rem .6rem;cursor:pointer;font-size:.8rem;">✕</button>`;
  banner.classList.remove('hidden');
  setTimeout(() => banner.classList.add('hidden'), 8000);
}

/**
 * Check today's birthdays and scheduled reminders.
 * Called on page load. Calculates days until next birthday in AD.
 */
function checkReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birthdays = loadBirthdays();

  birthdays.forEach(b => {
    if (!b.reminders || b.reminders.length === 0) return;

    // Find next occurrence of this birthday in AD
    const nextBday = getNextBirthdayAd(b);
    const daysUntil = Math.round((nextBday - today) / (1000 * 60 * 60 * 24));

    const reminderDays = b.reminders.map(Number);
    if (!reminderDays.includes(daysUntil)) return;

    let msg;
    if (daysUntil === 0) msg = `🎉 Today is ${b.name}'s birthday!`;
    else if (daysUntil === 1) msg = `🎂 ${b.name}'s birthday is tomorrow!`;
    else msg = `🎈 ${b.name}'s birthday is in ${daysUntil} days!`;

    if (Notification.permission === 'granted') {
      showBrowserNotif('Birthday Patro', msg);
    } else {
      showAppBanner(msg);
    }
  });
}

/**
 * Calculate the next occurrence of a birthday in AD.
 * Returns a JS Date for this year or next year.
 */
function getNextBirthdayAd(b) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  // Try this year's AD date first
  let candidate = new Date(currentYear, b.adMonth - 1, b.adDay);
  candidate.setHours(0, 0, 0, 0);
  if (candidate >= today) return candidate;

  // Birthday passed this year — use next year
  return new Date(currentYear + 1, b.adMonth - 1, b.adDay);
}

/** Days until birthday from today */
function daysUntilBirthday(b) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = getNextBirthdayAd(b);
  return Math.round((next - today) / (1000 * 60 * 60 * 24));
}

/** Calculate age (in years completed) */
function calculateAge(b) {
  const today = new Date();
  const birthDate = new Date(b.adYear, b.adMonth - 1, b.adDay);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  if (age < 0) return null;
  return age;
}

/* ═══════════════════════════════════════════════════════════════
   UI RENDERING
   ═══════════════════════════════════════════════════════════════ */

/** Render upcoming strip (horizontal scroll) */
function renderUpcoming() {
  const birthdays = loadBirthdays();
  const container = document.getElementById('upcomingList');

  if (birthdays.length === 0) {
    container.innerHTML = '<div class="upcoming-empty">No birthdays saved yet. Add one below!</div>';
    return;
  }

  // Sort by days until
  const sorted = [...birthdays].sort((a, b) => daysUntilBirthday(a) - daysUntilBirthday(b));
  const upcoming = sorted.slice(0, 10); // show up to 10

  container.innerHTML = upcoming.map(b => {
    const days = daysUntilBirthday(b);
    const isToday = days === 0;
    const initials = b.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `
      <div class="upcoming-card ${isToday ? 'today' : ''}">
        <span class="uc-emoji">${isToday ? '🎉' : '🎂'}</span>
        <div class="uc-label">${isToday ? 'TODAY!' : 'in'}</div>
        <div class="uc-days">${isToday ? '🎊' : days}</div>
        ${!isToday ? '<div class="uc-label">days</div>' : ''}
        <div class="uc-name">${escHtml(b.name)}</div>
        <div class="uc-date">${formatBs(b.bsYear, b.bsMonth, b.bsDay)}</div>
      </div>`;
  }).join('');
}

/** Render full birthday list cards */
function renderList(filter = '') {
  let birthdays = loadBirthdays();
  const emptyState = document.getElementById('emptyState');

  if (birthdays.length === 0) {
    document.getElementById('birthdayList').innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  // Filter by search
  if (filter) {
    const q = filter.toLowerCase();
    birthdays = birthdays.filter(b => b.name.toLowerCase().includes(q));
  }

  // Sort by days until birthday
  birthdays.sort((a, b) => daysUntilBirthday(a) - daysUntilBirthday(b));

  const container = document.getElementById('birthdayList');
  if (birthdays.length === 0) {
    container.innerHTML = `<div class="upcoming-empty" style="padding:2rem;text-align:center;color:var(--text-muted)">No results for "<strong>${escHtml(filter)}</strong>"</div>`;
    return;
  }

  container.innerHTML = birthdays.map((b, i) => {
    const days = daysUntilBirthday(b);
    const age = calculateAge(b);
    const isToday = days === 0;
    const isSoon = days <= 7 && !isToday;

    let tagHtml = '';
    if (isToday) tagHtml = '<span class="bday-tag">🎉 Today!</span>';
    else if (days === 1) tagHtml = '<span class="bday-tag upcoming-tag">Tomorrow</span>';
    else if (isSoon) tagHtml = `<span class="bday-tag soon-tag">In ${days} days</span>`;

    const reminderChips = (b.reminders || []).map(r => {
      const label = r == 0 ? 'Same day' : `${r}d before`;
      return `<span class="reminder-chip">🔔 ${label}</span>`;
    }).join('');

    const initials = b.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return `
      <div class="bday-card" data-id="${b.id}" style="animation-delay:${i * 40}ms">
        <div class="bday-avatar ${isToday ? 'today-avatar' : ''}">${initials}</div>
        <div class="bday-body">
          <div class="bday-name">
            ${escHtml(b.name)}
            ${tagHtml}
          </div>
          <div class="bday-dates">
            <div class="bday-date-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span class="bday-bs">BS: ${formatBs(b.bsYear, b.bsMonth, b.bsDay)}</span>
            </div>
            <div class="bday-date-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span class="bday-ad">AD: ${b.adDay} ${AD_MONTH_NAMES[b.adMonth-1]} ${b.adYear}</span>
            </div>
          </div>
          <div class="bday-meta">
            ${b.relation ? `<span class="bday-relation">👤 ${escHtml(b.relation)}</span>` : ''}
            ${age !== null ? `<span class="bday-age">🎂 Turns ${age + 1} this year</span>` : ''}
            ${!isToday ? `<span class="bday-days">📅 ${days} days away</span>` : ''}
          </div>
          ${reminderChips ? `<div class="bday-reminders">${reminderChips}</div>` : ''}
        </div>
        <div class="bday-actions">
          <button class="card-action-btn" onclick="openEditModal('${b.id}')" title="Edit" aria-label="Edit ${b.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="card-action-btn delete-btn" onclick="openDeleteModal('${b.id}')" title="Delete" aria-label="Delete ${b.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');
}

/** HTML-escape a string to prevent XSS */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════════════════════════════════
   MODAL — ADD / EDIT
   ═══════════════════════════════════════════════════════════════ */
let editingId = null;      // null = new, string = editing
let dateMode  = 'bs';      // 'bs' or 'ad'

function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Birthday';
  document.getElementById('birthdayForm').reset();
  clearErrors();
  hideConversionPreview();
  switchDateMode('bs');
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('bName').focus();
}

function openEditModal(id) {
  const birthdays = loadBirthdays();
  const b = birthdays.find(x => x.id === id);
  if (!b) return;

  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Birthday';
  document.getElementById('bName').value = b.name;
  document.getElementById('bRelation').value = b.relation || '';

  switchDateMode('bs');
  document.getElementById('bsYear').value  = b.bsYear;
  document.getElementById('bsMonth').value = b.bsMonth;
  document.getElementById('bsDay').value   = b.bsDay;

  // Set reminder checkboxes
  document.querySelectorAll('input[name="reminder"]').forEach(cb => {
    cb.checked = (b.reminders || []).map(String).includes(cb.value);
  });

  clearErrors();
  hideConversionPreview();
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('bName').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  editingId = null;
}

function switchDateMode(mode) {
  dateMode = mode;
  document.getElementById('bsInputSection').classList.toggle('hidden', mode !== 'bs');
  document.getElementById('adInputSection').classList.toggle('hidden', mode !== 'ad');
  document.getElementById('toggleBS').classList.toggle('active', mode === 'bs');
  document.getElementById('toggleAD').classList.toggle('active', mode === 'ad');
  clearErrors();
  hideConversionPreview();
}

function clearErrors() {
  ['nameError','bsError','adError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function hideConversionPreview() {
  document.getElementById('conversionPreview').classList.add('hidden');
}

/** Show live conversion preview as user types */
function updateConversionPreview() {
  const preview = document.getElementById('conversionPreview');
  const previewText = document.getElementById('previewText');

  try {
    if (dateMode === 'bs') {
      const y = parseInt(document.getElementById('bsYear').value);
      const m = parseInt(document.getElementById('bsMonth').value);
      const d = parseInt(document.getElementById('bsDay').value);
      if (!y || !m || !d) { preview.classList.add('hidden'); return; }
      validateBsDate(y, m, d);
      const adDate = bsToAd(y, m, d);
      previewText.textContent = `AD: ${formatAd(adDate)}`;
      preview.classList.remove('hidden');
    } else {
      const y = parseInt(document.getElementById('adYear').value);
      const m = parseInt(document.getElementById('adMonth').value);
      const d = parseInt(document.getElementById('adDay').value);
      if (!y || !m || !d) { preview.classList.add('hidden'); return; }
      const adDate = new Date(y, m - 1, d);
      const bs = adToBs(adDate);
      previewText.textContent = `BS: ${formatBs(bs.year, bs.month, bs.day)}`;
      preview.classList.remove('hidden');
    }
  } catch {
    preview.classList.add('hidden');
  }
}

/** Validate BS date — check day is within month's allowed range */
function validateBsDate(y, m, d) {
  if (!BS_MONTH_DAYS[y]) throw new Error(`Year ${y} not supported`);
  const maxDay = BS_MONTH_DAYS[y][m - 1];
  if (d < 1 || d > maxDay) throw new Error(`Day must be 1–${maxDay} for this month`);
}

/* Form submission */
document.getElementById('birthdayForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById('bName').value.trim();
  if (!name) {
    document.getElementById('nameError').textContent = 'Name is required';
    return;
  }

  let bsYear, bsMonth, bsDay, adYear, adMonth, adDay;

  if (dateMode === 'bs') {
    bsYear  = parseInt(document.getElementById('bsYear').value);
    bsMonth = parseInt(document.getElementById('bsMonth').value);
    bsDay   = parseInt(document.getElementById('bsDay').value);

    if (!bsYear || !bsMonth || !bsDay) {
      document.getElementById('bsError').textContent = 'Please fill in all date fields';
      return;
    }
    try {
      validateBsDate(bsYear, bsMonth, bsDay);
    } catch (err) {
      document.getElementById('bsError').textContent = err.message;
      return;
    }
    const adDate = bsToAd(bsYear, bsMonth, bsDay);
    adYear  = adDate.getFullYear();
    adMonth = adDate.getMonth() + 1;
    adDay   = adDate.getDate();

  } else {
    adYear  = parseInt(document.getElementById('adYear').value);
    adMonth = parseInt(document.getElementById('adMonth').value);
    adDay   = parseInt(document.getElementById('adDay').value);

    if (!adYear || !adMonth || !adDay) {
      document.getElementById('adError').textContent = 'Please fill in all date fields';
      return;
    }
    try {
      const adDate = new Date(adYear, adMonth - 1, adDay);
      if (isNaN(adDate.getTime())) throw new Error('Invalid date');
      const bs = adToBs(adDate);
      bsYear  = bs.year;
      bsMonth = bs.month;
      bsDay   = bs.day;
    } catch (err) {
      document.getElementById('adError').textContent = 'Invalid date or outside supported range (AD 1943–2043)';
      return;
    }
  }

  // Gather reminders
  const reminders = [...document.querySelectorAll('input[name="reminder"]:checked')]
    .map(cb => parseInt(cb.value));

  // If reminders are set, ask for notification permission
  if (reminders.length > 0) {
    await requestNotifPermission();
  }

  const relation = document.getElementById('bRelation').value.trim();

  const birthdays = loadBirthdays();
  if (editingId) {
    const idx = birthdays.findIndex(b => b.id === editingId);
    if (idx !== -1) {
      birthdays[idx] = { ...birthdays[idx], name, relation, bsYear, bsMonth, bsDay, adYear, adMonth, adDay, reminders };
    }
  } else {
    birthdays.push({ id: generateId(), name, relation, bsYear, bsMonth, bsDay, adYear, adMonth, adDay, reminders });
  }

  saveBirthdays(birthdays);
  closeModal();
  renderAll();
});

/* ═══════════════════════════════════════════════════════════════
   DELETE MODAL
   ═══════════════════════════════════════════════════════════════ */
let deleteTargetId = null;

function openDeleteModal(id) {
  const birthdays = loadBirthdays();
  const b = birthdays.find(x => x.id === id);
  if (!b) return;
  deleteTargetId = id;
  document.getElementById('deleteName').textContent = b.name;
  document.getElementById('deleteOverlay').classList.remove('hidden');
}

function closeDeleteModal() {
  document.getElementById('deleteOverlay').classList.add('hidden');
  deleteTargetId = null;
}

document.getElementById('deleteConfirmBtn').addEventListener('click', () => {
  if (!deleteTargetId) return;
  let birthdays = loadBirthdays();
  birthdays = birthdays.filter(b => b.id !== deleteTargetId);
  saveBirthdays(birthdays);
  closeDeleteModal();
  renderAll();
});

/* ═══════════════════════════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════════════════════════ */
document.getElementById('searchInput').addEventListener('input', function () {
  const val = this.value;
  document.getElementById('searchClear').classList.toggle('hidden', !val);
  renderList(val);
});

document.getElementById('searchClear').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').classList.add('hidden');
  renderList('');
});

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATION BUTTON
   ═══════════════════════════════════════════════════════════════ */
document.getElementById('notifBtn').addEventListener('click', async () => {
  if (!('Notification' in window)) {
    showAppBanner('Browser notifications are not supported. In-app reminders are active!');
    return;
  }
  if (Notification.permission === 'granted') {
    showAppBanner('Notifications are already enabled! ✅');
  } else {
    const granted = await requestNotifPermission();
    if (granted) {
      showAppBanner('Browser notifications enabled! 🔔');
    } else {
      showAppBanner('Notification permission denied. Reminders will show here instead.');
    }
  }
});

/* ═══════════════════════════════════════════════════════════════
   RENDER ALL
   ═══════════════════════════════════════════════════════════════ */
function renderAll() {
  const search = document.getElementById('searchInput').value;
  renderUpcoming();
  renderList(search);
}

/* ═══════════════════════════════════════════════════════════════
   EVENT LISTENERS — BUTTONS
   ═══════════════════════════════════════════════════════════════ */
document.getElementById('addBirthdayBtn').addEventListener('click', openAddModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('deleteClose').addEventListener('click', closeDeleteModal);
document.getElementById('deleteCancelBtn').addEventListener('click', closeDeleteModal);

// Close modals on backdrop click
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById('deleteOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeDeleteModal();
});

// Keyboard close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeDeleteModal();
  }
});

// Date mode toggle
document.getElementById('toggleBS').addEventListener('click', () => switchDateMode('bs'));
document.getElementById('toggleAD').addEventListener('click', () => switchDateMode('ad'));

// Live conversion preview
['bsYear','bsMonth','bsDay','adYear','adMonth','adDay'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateConversionPreview);
  document.getElementById(id).addEventListener('change', updateConversionPreview);
});

// Sync button header
document.getElementById('syncBtn').addEventListener('click', () => {
  document.querySelector('.sync-section').scrollIntoView({ behavior: 'smooth' });
});

/* ═══════════════════════════════════════════════════════════════
   FIREBASE SYNC PLACEHOLDER FUNCTIONS
   Replace these with actual Firebase implementation when ready.
   ═══════════════════════════════════════════════════════════════ */

/** Sign in with Google (placeholder) */
function signInWithGoogle() {
  alert('🔑 Google Sign-In — Coming Soon!\n\nThis will use Firebase Authentication in a future update.');
}

/** Sign in with Apple (placeholder) */
function signInWithApple() {
  alert('🍎 Apple Sign-In — Coming Soon!\n\nThis will use Firebase Authentication in a future update.');
}

/** Sign in with Email (placeholder) */
function signInWithEmail() {
  alert('📧 Email Sign-In — Coming Soon!\n\nThis will use Firebase Authentication in a future update.');
}

/**
 * syncToCloud — placeholder for Firebase Firestore sync.
 * Will upload local birthdays to the user's cloud collection.
 */
async function syncToCloud() {
  // Future implementation:
  // const user = firebase.auth().currentUser;
  // if (!user) return signInWithGoogle();
  // const birthdays = loadBirthdays();
  // const db = firebase.firestore();
  // const batch = db.batch();
  // birthdays.forEach(b => {
  //   const ref = db.collection('users').doc(user.uid).collection('birthdays').doc(b.id);
  //   batch.set(ref, b);
  // });
  // await batch.commit();
  console.log('[syncToCloud] placeholder — Firebase not connected');
}

/**
 * loadFromCloud — placeholder for loading from Firebase.
 * Will merge cloud birthdays into local storage.
 */
async function loadFromCloud() {
  // Future implementation:
  // const user = firebase.auth().currentUser;
  // if (!user) return;
  // const db = firebase.firestore();
  // const snap = await db.collection('users').doc(user.uid).collection('birthdays').get();
  // const cloud = snap.docs.map(d => d.data());
  // saveBirthdays(cloud);
  // renderAll();
  console.log('[loadFromCloud] placeholder — Firebase not connected');
}

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  checkReminders();

  // Check reminders again every hour (for long-running tabs)
  setInterval(checkReminders, 60 * 60 * 1000);
});
