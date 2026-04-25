// Data
let fairs = [];
let casetas = [];
let menus = [];
let concerts = [];
let fuse = null;

// Detail page state
let detailMap = null;
let detailMarker = null;
let currentDetailId = null;

// Casetas global map state
let casetasMap = null;
let casetasMarkersLayer = null;
let casetasMarkersById = new Map();
let casetasSort = 'number';

// Schedule filters
let selectedScheduleDay = 'all';
let scheduleCasetaFilter = null;

// Base URL for data files
const BASE_URL = '/FeriaApp/data';

// Load all data from JSON files
let loadDataPromise = null;
const loadData = () => {
  if (loadDataPromise) return loadDataPromise;
  loadDataPromise = (async () => {
    try {
      const [fairsRes, casetasRes, menusRes, concertsRes] = await Promise.all([
        fetch(`${BASE_URL}/fairs.json`),
        fetch(`${BASE_URL}/casetas.json`),
        fetch(`${BASE_URL}/menus.json`),
        fetch(`${BASE_URL}/concerts.json`),
      ]);

      fairs = await fairsRes.json();
      casetas = await casetasRes.json();
      menus = await menusRes.json();
      concerts = await concertsRes.json();

      initFuse();
      renderCasetas(casetas);
      renderMenus(casetas);
      renderScheduleDays();
      renderSchedule();
      setTimeout(initCasetasMap, 150);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  })();
  return loadDataPromise;
};

const APP_STATE_KEY = 'feriaapp:last-state';
const PERSISTED_SECTIONS = ['casetas', 'menus', 'schedule'];

const persistAppState = (section, extra = {}) => {
  try {
    sessionStorage.setItem(APP_STATE_KEY, JSON.stringify({ inApp: true, section, ...extra }));
  } catch (_) {}
};

const clearAppState = () => {
  try { sessionStorage.removeItem(APP_STATE_KEY); } catch (_) {}
};

const getPersistedAppState = () => {
  try {
    const raw = sessionStorage.getItem(APP_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) { return null; }
};

// History helpers: push a state entry unless we're responding to popstate
let suppressHistoryPush = false;
const pushHistory = (state) => {
  if (suppressHistoryPush) return;
  history.pushState(state, '');
};

// Show main app
const showApp = (initialSection = 'casetas', options = {}) => {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  window.scrollTo(0, 0);
  const wantsDetail = initialSection === 'detail' && options.detailId;
  const section = wantsDetail
    ? 'casetas'
    : (PERSISTED_SECTIONS.includes(initialSection) ? initialSection : 'casetas');
  if (!wantsDetail && section !== 'casetas') showSection(section);
  persistAppState(section);
  pushHistory({ view: 'app', section });
  loadData().then(() => {
    if (wantsDetail) openCasetaDetail(options.detailId);
  });
};

// Back to landing / welcome page
const showLanding = () => {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
  clearAppState();
  pushHistory({ view: 'landing' });
  window.scrollTo(0, 0);
};

// Show section
const showSection = (section, options = {}) => {
  document.querySelectorAll('.app-section').forEach((s) => s.classList.add('hidden'));
  const target = document.getElementById(`${section}-section`);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.app-nav-btn, .app-mobile-nav-btn').forEach((btn) => {
    const isActive = btn.dataset.section === section;
    btn.classList.toggle('is-active', isActive);
  });

  if (section !== 'schedule' || !options.keepScheduleFilter) {
    if (scheduleCasetaFilter) {
      scheduleCasetaFilter = null;
      updateScheduleCasetaFilterUI();
      renderSchedule();
    }
  }

  if (PERSISTED_SECTIONS.includes(section)) persistAppState(section);
  if (section !== 'detail') pushHistory({ view: 'app', section });

  if (section === 'casetas') {
    setTimeout(initCasetasMap, 150);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const restoreAppState = () => {
  history.replaceState({ view: 'landing' }, '');
  const state = getPersistedAppState();
  if (state && state.inApp) {
    if (state.section === 'detail' && state.detailId) {
      showApp('detail', { detailId: state.detailId });
    } else {
      showApp(state.section || 'casetas');
    }
  }
};

window.addEventListener('popstate', (event) => {
  const target = event.state || { view: 'landing' };
  suppressHistoryPush = true;
  try {
    if (target.view === 'landing') {
      showLanding();
    } else if (target.section === 'detail' && target.detailId) {
      const caseta = casetas.find((c) => c._id === target.detailId);
      if (caseta) {
        openCasetaDetail(target.detailId);
      } else {
        showApp('detail', { detailId: target.detailId });
      }
    } else {
      document.getElementById('landing').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      showSection(target.section || 'casetas');
    }
  } finally {
    suppressHistoryPush = false;
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', restoreAppState);
} else {
  restoreAppState();
}

const getActiveSectionId = () => {
  const active = document.querySelector('.app-nav-btn.is-active');
  if (active) return active.dataset.section;
  const visible = document.querySelector('.app-section:not(.hidden)');
  if (!visible) return 'casetas';
  return visible.id.replace('-section', '');
};

const syncMobileNavActive = () => {
  const active = getActiveSectionId();
  document.querySelectorAll('.app-mobile-nav-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.section === active);
  });
};

const openMobileNav = () => {
  const drawer = document.getElementById('app-mobile-nav');
  const btn = document.querySelector('.app-hamburger');
  if (!drawer) return;
  syncMobileNavActive();
  const installBtn = document.getElementById('mobile-install-btn');
  const appInstallBtn = document.getElementById('app-install-btn');
  if (installBtn) installBtn.hidden = !(appInstallBtn && appInstallBtn.style.display !== 'none');
  drawer.hidden = false;
  requestAnimationFrame(() => drawer.classList.add('is-open'));
  if (btn) btn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
};

const closeMobileNav = () => {
  const drawer = document.getElementById('app-mobile-nav');
  const btn = document.querySelector('.app-hamburger');
  if (!drawer) return;
  drawer.classList.remove('is-open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  setTimeout(() => { drawer.hidden = true; }, 200);
};

const toggleMobileNav = () => {
  const drawer = document.getElementById('app-mobile-nav');
  if (!drawer) return;
  if (drawer.hidden) openMobileNav();
  else closeMobileNav();
};

const selectMobileSection = (section) => {
  closeMobileNav();
  showSection(section);
};

const installFromMobileNav = () => {
  closeMobileNav();
  installApp();
};

// Initialize Fuse.js for smart search
const initFuse = () => {
  fuse = new Fuse(casetas, {
    keys: ['name', 'number'],
    threshold: 0.4,
  });
};

// Get casetas filtered by current search query (or all if empty)
const getFilteredCasetas = () => {
  const queryEl = document.getElementById('search-input');
  const query = queryEl ? queryEl.value : '';
  if (!query) return casetas.slice();
  if (!fuse) return casetas.slice();
  return fuse.search(query).map((r) => r.item);
};

// Sort casetas array in-place according to current sort option
const sortCasetas = (arr) => {
  const copy = arr.slice();
  if (casetasSort === 'name') {
    copy.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));
  } else if (casetasSort === 'status') {
    copy.sort((a, b) => {
      const diff = (isCasetaOpen(b) ? 1 : 0) - (isCasetaOpen(a) ? 1 : 0);
      if (diff !== 0) return diff;
      return Number(a.number || 0) - Number(b.number || 0);
    });
  } else {
    copy.sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
  }
  return copy;
};

// Search casetas
const searchCasetas = () => {
  const filtered = getFilteredCasetas();
  renderCasetas(filtered);
};

// Change sort option and re-render
const changeCasetasSort = (value) => {
  casetasSort = value;
  renderCasetas(getFilteredCasetas());
};

// Determine if a caseta is currently open
const isCasetaOpen = (caseta) => {
  if (typeof caseta.isOpen === 'boolean') return caseta.isOpen;
  if (caseta.status === 'open' || caseta.status === 'abierta') return true;
  if (caseta.status === 'closed' || caseta.status === 'cerrada') return false;
  return false;
};

// Build caseta card markup
const buildCasetaCard = (caseta) => {
  const open = isCasetaOpen(caseta);
  const statusClass = open ? 'is-open' : 'is-closed';
  const statusLabel = open ? 'Abierta' : 'Cerrado';
  const image = caseta.image
    ? `<img src="${caseta.image.replace('/uploads/', '/FeriaApp/uploads/')}" alt="${caseta.name}" class="caseta-card-image" />`
    : '<div class="caseta-no-image"></div>';
  return `
    <article class="caseta-card" data-caseta-id="${caseta._id}" onclick="openCasetaDetail('${caseta._id}')" onmouseenter="highlightMapMarker('${caseta._id}', true)" onmouseleave="highlightMapMarker('${caseta._id}', false)">
      ${image}
      <div class="caseta-card-head">
        <h3>${caseta.name}</h3>
        <span class="caseta-status ${statusClass}">${statusLabel}</span>
      </div>
      <button class="caseta-card-btn" type="button" onclick="event.stopPropagation(); openCasetaDetail('${caseta._id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/>
          <line x1="12" y1="11" x2="12" y2="16"/>
          <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>
        </svg>
        <span>Más información</span>
      </button>
    </article>
  `;
};

// Render casetas grid (and update map markers to match)
const renderCasetas = (data) => {
  const container = document.getElementById('casetas-list');
  if (!container) return;
  const sorted = sortCasetas(data);
  if (sorted.length === 0) {
    container.innerHTML = '<p class="no-results">No se han encontrado casetas</p>';
  } else {
    container.innerHTML = sorted.map(buildCasetaCard).join('');
  }
  renderCasetasMarkers(sorted);
};

// Render menus grouped by caseta
const renderMenus = (casetasData) => {
  const container = document.getElementById('menus-list');
  if (!container) return;

  if (casetasData.length === 0) {
    container.innerHTML = '<p class="no-results">No se han encontrado casetas</p>';
    return;
  }

  const entries = casetasData.map((caseta) => ({
    caseta,
    items: menus.filter((m) => m.caseta?._id === caseta._id || m.caseta === caseta._id),
  }));

  container.innerHTML = entries.map(({ caseta, items }) => {
    const image = caseta.image
      ? `<img src="${caseta.image.replace('/uploads/', '/FeriaApp/uploads/')}" alt="${caseta.name}" class="menu-caseta-image" />`
      : '<div class="menu-caseta-no-image"></div>';

    const suggestions = items.slice(0, 3);
    const itemsHtml = suggestions.length > 0
      ? suggestions.map((m) => `<li><span>${m.name}</span><span class="price">${m.price}€</span></li>`).join('')
      : '<li><span>Sin sugerencias disponible</span><span></span></li>';

    return `
      <article class="menu-caseta-card">
        <h3>${caseta.name}</h3>
        ${image}
        <h4 class="menu-caseta-subtitle">Sugerencias del chef</h4>
        <ul class="menu-items">${itemsHtml}</ul>
        <button class="btn btn-primary menu-caseta-pdf" type="button" onclick="downloadMenuPDF('${caseta._id}')">Descargar menú completo (PDF)</button>
      </article>
    `;
  }).join('');
};

// Search menus by caseta name
const searchMenus = () => {
  const query = document.getElementById('menus-search-input').value;
  if (!query) {
    renderMenus(casetas);
    return;
  }
  const results = fuse.search(query).map((r) => r.item);
  renderMenus(results);
};

// Build a stable YYYY-MM-DD key from a concert date (avoids TZ shifts)
const concertDayKey = (concert) => {
  const d = new Date(concert.date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const dateToKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Return the list of day keys that make up the fair (start..end inclusive)
const getFairDayKeys = () => {
  const fair = fairs.find((f) => f.active) || fairs[0];
  if (!fair?.startDate || !fair?.endDate) {
    return [...new Set(concerts.map(concertDayKey))].sort();
  }
  const start = new Date(fair.startDate);
  const end = new Date(fair.endDate);
  const keys = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= endDay) {
    keys.push(dateToKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
};

// Render day chips + "All" + (if > 7 days) calendar picker
const renderScheduleDays = () => {
  const container = document.getElementById('schedule-days');
  if (!container) return;

  const allKeys = getFairDayKeys();
  const dayKeys = allKeys.length > 7 ? allKeys.slice(0, 7) : allKeys;

  const chip = (key, label) => `
    <button type="button" class="schedule-day ${selectedScheduleDay === key ? 'is-active' : ''}" onclick="selectScheduleDay('${key}')">
      ${label}
    </button>
  `;

  const allChip = `
    <button type="button" class="schedule-day schedule-day-all ${selectedScheduleDay === 'all' ? 'is-active' : ''}" onclick="selectScheduleDay('all')">
      <span class="schedule-day-weekday">Todos</span>
    </button>
  `;

  const dayChips = dayKeys.map((key) => {
    const d = new Date(`${key}T00:00:00`);
    const label = `<span class="schedule-day-weekday">${DAY_NAMES[d.getDay()]}</span><span class="schedule-day-number">${d.getDate()}</span>`;
    return chip(key, label);
  }).join('');

  const calendarActive = selectedScheduleDay !== 'all' && !dayKeys.includes(selectedScheduleDay);
  const calendarChip = allKeys.length > 7 ? `
    <button type="button" class="schedule-day schedule-day-calendar ${calendarActive ? 'is-active' : ''}" title="Elegir otro día" onclick="openScheduleDatePicker(event)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
      <input type="date" class="schedule-day-date-input" aria-hidden="true" tabindex="-1"
        min="${allKeys[0]}" max="${allKeys[allKeys.length - 1]}"
        value="${calendarActive ? selectedScheduleDay : ''}"
        onchange="selectScheduleDay(this.value)" />
    </button>
  ` : '';

  container.innerHTML = allChip + dayChips + calendarChip;
};

const selectScheduleDay = (key) => {
  selectedScheduleDay = key;
  renderScheduleDays();
  renderSchedule();
};

const openScheduleDatePicker = (event) => {
  const btn = event.currentTarget;
  const input = btn && btn.querySelector('.schedule-day-date-input');
  if (!input) return;
  if (typeof input.showPicker === 'function') {
    try { input.showPicker(); return; } catch (_) {}
  }
  input.focus();
  input.click();
};

// Render filtered schedule list
const renderSchedule = () => {
  const container = document.getElementById('schedule-list');
  if (!container) return;

  const queryEl = document.getElementById('schedule-search-input');
  const query = (queryEl?.value || '').trim().toLowerCase();

  const filtered = concerts
    .filter((c) => !scheduleCasetaFilter || (c.caseta?._id || c.caseta) === scheduleCasetaFilter)
    .filter((c) => selectedScheduleDay === 'all' || concertDayKey(c) === selectedScheduleDay)
    .filter((c) => {
      if (!query) return true;
      const artist = (c.artist || '').toLowerCase();
      const casetaName = (c.caseta?.name || '').toLowerCase();
      return artist.includes(query) || casetaName.includes(query);
    })
    .sort((a, b) => {
      const keyDiff = concertDayKey(a).localeCompare(concertDayKey(b));
      if (keyDiff !== 0) return keyDiff;
      return (a.time || '').localeCompare(b.time || '');
    });

  if (filtered.length === 0) {
    let msg;
    if (scheduleCasetaFilter) {
      msg = 'Actualmente esta caseta no celebra nada';
    } else if (selectedScheduleDay !== 'all') {
      msg = 'Este día no hay nada programado';
    } else {
      msg = 'No hay conciertos que coincidan';
    }
    container.innerHTML = `<p class="no-results">${msg}</p>`;
    return;
  }

  container.innerHTML = filtered.map((concert) => {
    const casetaId = concert.caseta?._id || concert.caseta;
    const clickAttr = casetaId ? `onclick="openCasetaDetail('${casetaId}')"` : '';
    return `
      <div class="concert-card" ${clickAttr}>
        <div class="concert-time">${concert.time}</div>
        <div class="concert-info">
          <h3>${concert.artist}</h3>
          <p>${concert.genre || ''} · ${concert.caseta?.name || ''}</p>
          <p class="concert-date">${new Date(concert.date).toLocaleDateString('es-ES')}</p>
        </div>
      </div>
    `;
  }).join('');
};

const filterSchedule = () => renderSchedule();

const updateScheduleCasetaFilterUI = () => {
  const banner = document.getElementById('schedule-caseta-filter');
  const nameEl = document.getElementById('schedule-caseta-filter-name');
  if (!banner || !nameEl) return;
  if (scheduleCasetaFilter) {
    const caseta = casetas.find((c) => c._id === scheduleCasetaFilter);
    nameEl.textContent = caseta?.name || '';
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
};

const openFullScheduleForCurrentCaseta = () => {
  if (!currentDetailId) return;
  scheduleCasetaFilter = currentDetailId;
  selectedScheduleDay = 'all';
  const searchEl = document.getElementById('schedule-search-input');
  if (searchEl) searchEl.value = '';
  updateScheduleCasetaFilterUI();
  renderScheduleDays();
  renderSchedule();
  showSection('schedule', { keepScheduleFilter: true });
};

const clearScheduleCasetaFilter = () => {
  scheduleCasetaFilter = null;
  updateScheduleCasetaFilterUI();
  renderSchedule();
};

// ===== Casetas global map =====
const CASETAS_MAP_BOUNDS = [[0, 0], [1052, 1514]];

const buildCasetaMarker = (caseta) => {
  const open = isCasetaOpen(caseta);
  const cls = open ? 'caseta-pin is-open' : 'caseta-pin is-closed';
  const icon = L.divIcon({
    className: 'caseta-pin-wrap',
    html: `<span class="${cls}" aria-hidden="true"><span class="caseta-pin-inner">${caseta.number ?? ''}</span></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
  const marker = L.marker([caseta.location.x, caseta.location.y], { icon, title: caseta.name });
  marker.on('click', () => openCasetaDetail(caseta._id));
  return marker;
};

const initCasetasMap = () => {
  const mapEl = document.getElementById('casetas-map');
  if (!mapEl) return;

  // If the container has no size yet (hidden or not laid out), retry on the
  // next animation frame. Leaflet needs a real width/height to render tiles.
  if (mapEl.offsetWidth === 0 || mapEl.offsetHeight === 0) {
    requestAnimationFrame(initCasetasMap);
    return;
  }

  if (!casetasMap) {
    casetasMap = L.map(mapEl, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 3,
      maxBounds: CASETAS_MAP_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: false,
    });
    L.imageOverlay('/FeriaApp/plano_feria.png', CASETAS_MAP_BOUNDS).addTo(casetasMap);
    casetasMarkersLayer = L.layerGroup().addTo(casetasMap);
  }

  casetasMap.invalidateSize();
  casetasMap.fitBounds(CASETAS_MAP_BOUNDS);
  renderCasetasMarkers(getFilteredCasetas());
};

const renderCasetasMarkers = (data) => {
  if (!casetasMap || !casetasMarkersLayer) return;
  casetasMarkersLayer.clearLayers();
  casetasMarkersById = new Map();

  data.forEach((caseta) => {
    if (caseta.location?.x == null || caseta.location?.y == null) return;
    const marker = buildCasetaMarker(caseta);
    marker.addTo(casetasMarkersLayer);
    casetasMarkersById.set(caseta._id, marker);
  });
};

const highlightMapMarker = (id, on) => {
  const marker = casetasMarkersById.get(id);
  if (!marker) return;
  const el = marker.getElement();
  if (!el) return;
  el.classList.toggle('is-highlighted', !!on);
};

// ===== Caseta detail page =====
const openCasetaDetail = (id) => {
  const caseta = casetas.find((c) => c._id === id);
  if (!caseta) return;
  currentDetailId = id;

  const mediaEl = document.getElementById('detail-media');
  mediaEl.innerHTML = caseta.image
    ? `<img src="${caseta.image.replace('/uploads/', '/FeriaApp/uploads/')}" alt="${caseta.name}" />`
    : '<span>Imagen no disponible</span>';

  document.getElementById('detail-name').textContent = caseta.name;
  document.getElementById('detail-description').innerHTML = caseta.description
    ? `<strong>Descripción:</strong> ${caseta.description}`
    : `<strong>Caseta nº ${caseta.number}</strong>`;

  renderDetailMenu(id);
  renderDetailSchedule(id);
  renderDetailNearby(caseta);

  showDetailTab('menu');
  showSection('detail');
  persistAppState('detail', { detailId: id });
  pushHistory({ view: 'app', section: 'detail', detailId: id });
  setTimeout(() => initDetailMap(caseta), 150);
};

const downloadMenuPDF = (id) => {
  if (!id) return;
  const caseta = casetas.find((c) => c._id === id);
  if (!caseta) return;
  const casetaMenus = menus.filter((m) => m.caseta?._id === id || m.caseta === id);

  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text(`Menú - ${caseta.name}`, 20, 20);

  doc.setFontSize(12);
  doc.text(`Caseta nº ${caseta.number}`, 20, 30);

  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  let y = 45;
  doc.setFontSize(11);

  casetaMenus.forEach((m) => {
    doc.text(m.name, 20, y);
    doc.text(`${m.price}€`, 170, y, { align: 'right' });
    if (m.description) {
      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(m.description, 25, y);
      doc.setFontSize(11);
      doc.setTextColor(0);
    }
    y += 10;
  });

  const safeName = caseta.name.toLowerCase().replace(/\s+/g, '-');
  doc.save(`menu-${safeName}.pdf`);
};

const renderDetailMenu = (id) => {
  const casetaMenus = menus.filter((m) => m.caseta?._id === id || m.caseta === id);
  const list = document.getElementById('detail-menu-list');
  if (casetaMenus.length === 0) {
    list.innerHTML = '<li><span>Sin menú disponible</span><span></span></li>';
    return;
  }
  const suggestions = casetaMenus.slice(0, 3);
  list.innerHTML = suggestions.map((m) => `
    <li>
      <span>${m.name}</span>
      <span class="price">${m.price}€</span>
    </li>
  `).join('');
};

const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const formatConcertDay = (dateStr) => {
  const d = new Date(dateStr);
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
};

const renderDetailSchedule = (id) => {
  const casetaConcerts = concerts
    .filter((c) => c.caseta?._id === id || c.caseta === id)
    .sort((a, b) => {
      const keyDiff = concertDayKey(a).localeCompare(concertDayKey(b));
      if (keyDiff !== 0) return keyDiff;
      return (a.time || '').localeCompare(b.time || '');
    });

  const list = document.getElementById('detail-schedule-list');

  if (casetaConcerts.length === 0) {
    list.innerHTML = '<li class="detail-schedule-empty"><span>Sin conciertos programados</span></li>';
    return;
  }

  const grouped = casetaConcerts.reduce((acc, c) => {
    const key = concertDayKey(c);
    (acc[key] = acc[key] || []).push(c);
    return acc;
  }, {});

  const showDays = Object.keys(grouped).length > 1;

  list.innerHTML = Object.entries(grouped).map(([key, items]) => {
    const header = showDays
      ? `<li class="detail-schedule-day-header">${formatConcertDay(`${key}T00:00:00`)}</li>`
      : '';
    const rows = items.map((c) => `
      <li class="detail-schedule-item">
        <div class="detail-schedule-main">
          <span class="detail-schedule-artist">${c.artist}</span>
          <span class="detail-schedule-meta">${c.genre || ''}${c.genre && !showDays ? ' · ' : ''}${!showDays ? formatConcertDay(c.date) : ''}</span>
        </div>
        <span class="time">${c.time}</span>
      </li>
    `).join('');
    return header + rows;
  }).join('');
};

const renderDetailNearby = (caseta) => {
  const currentNum = Number(caseta.number);
  const ordered = [...casetas]
    .filter((c) => c._id !== caseta._id && !Number.isNaN(Number(c.number)))
    .sort((a, b) => Number(a.number) - Number(b.number));

  const idx = ordered.findIndex((c) => Number(c.number) > currentNum);
  const rotated = idx === -1 ? ordered : ordered.slice(idx).concat(ordered.slice(0, idx));
  const nearby = rotated.slice(0, 3);

  const container = document.getElementById('detail-nearby-list');
  if (nearby.length === 0) {
    container.innerHTML = '<p class="no-results">No hay más casetas</p>';
    return;
  }
  container.innerHTML = nearby.map(buildCasetaCard).join('');
};

const showDetailTab = (tab) => {
  document.querySelectorAll('.detail-tab').forEach((btn) => {
    const active = btn.dataset.tab === tab;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  document.getElementById('detail-tab-menu').classList.toggle('hidden', tab !== 'menu');
  document.getElementById('detail-tab-schedule').classList.toggle('hidden', tab !== 'schedule');
};

const initDetailMap = (caseta) => {
  const mapEl = document.getElementById('detail-map');
  if (!mapEl) return;

  const bounds = [[0, 0], [1052, 1514]];

  if (!detailMap) {
    detailMap = L.map(mapEl, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 3,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: false,
    });
    L.imageOverlay('/FeriaApp/plano_feria.png', bounds).addTo(detailMap);
  }

  detailMap.invalidateSize();

  if (detailMarker) {
    detailMap.removeLayer(detailMarker);
    detailMarker = null;
  }

  if (caseta.location?.x != null && caseta.location?.y != null) {
    detailMarker = L.marker([caseta.location.x, caseta.location.y]).addTo(detailMap);
    detailMap.setView([caseta.location.x, caseta.location.y], 1);
  } else {
    detailMap.fitBounds(bounds);
  }
};

// PWA Install
let deferredPrompt;
const INSTALL_BANNER_DISMISSED_KEY = 'feriaapp:install-banner-dismissed';
try { localStorage.removeItem(INSTALL_BANNER_DISMISSED_KEY); } catch (_) {}

const showInstallUI = () => {
  const installBtn = document.getElementById('install-btn');
  const appInstallBtn = document.getElementById('app-install-btn');
  const banner = document.getElementById('install-banner');
  if (installBtn) installBtn.style.display = 'inline-flex';
  if (appInstallBtn) appInstallBtn.style.display = 'inline-flex';
  if (banner && !sessionStorage.getItem(INSTALL_BANNER_DISMISSED_KEY)) {
    banner.hidden = false;
  }
};

const hideInstallUI = () => {
  const installBtn = document.getElementById('install-btn');
  const appInstallBtn = document.getElementById('app-install-btn');
  const banner = document.getElementById('install-banner');
  if (installBtn) installBtn.style.display = 'none';
  if (appInstallBtn) appInstallBtn.style.display = 'none';
  if (banner) banner.hidden = true;
};

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallUI();
});

const installApp = () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((result) => {
    if (result.outcome === 'accepted') {
      console.log('App installed');
    }
    deferredPrompt = null;
    hideInstallUI();
  });
};

const dismissInstallBanner = () => {
  const banner = document.getElementById('install-banner');
  if (banner) banner.hidden = true;
  sessionStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, '1');
};

window.addEventListener('appinstalled', () => {
  hideInstallUI();
});
