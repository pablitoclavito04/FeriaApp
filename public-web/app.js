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

// Base URL for data files
const BASE_URL = '/FeriaApp/data';

// Load all data from JSON files
const loadData = async () => {
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
    renderSchedule(concerts);
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

// Show main app
const showApp = () => {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  window.scrollTo(0, 0);
  loadData();
};

// Show section
const showSection = (section) => {
  document.querySelectorAll('.app-section').forEach((s) => s.classList.add('hidden'));
  const target = document.getElementById(`${section}-section`);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.app-nav-btn').forEach((btn) => {
    const isActive = btn.dataset.section === section;
    btn.classList.toggle('is-active', isActive);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Initialize Fuse.js for smart search
const initFuse = () => {
  fuse = new Fuse(casetas, {
    keys: ['name', 'number'],
    threshold: 0.4,
  });
};

// Search casetas
const searchCasetas = () => {
  const query = document.getElementById('search-input').value;
  if (!query) {
    renderCasetas(casetas);
    return;
  }
  const results = fuse.search(query).map((r) => r.item);
  renderCasetas(results);
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
    <article class="caseta-card" onclick="openCasetaDetail('${caseta._id}')">
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

// Render casetas grid
const renderCasetas = (data) => {
  const container = document.getElementById('casetas-list');
  if (!container) return;
  if (data.length === 0) {
    container.innerHTML = '<p class="no-results">No se han encontrado casetas</p>';
    return;
  }
  container.innerHTML = data.map(buildCasetaCard).join('');
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

    const itemsHtml = items.length > 0
      ? items.map((m) => `<li><span>${m.name}</span><span class="price">${m.price}€</span></li>`).join('')
      : '<li><span>Sin sugerencias disponible</span><span></span></li>';

    return `
      <article class="menu-caseta-card">
        <h3>${caseta.name}</h3>
        ${image}
        <h4 class="menu-caseta-subtitle">Sugerencias del chef</h4>
        <ul class="menu-items">${itemsHtml}</ul>
        <button class="btn btn-primary menu-caseta-pdf" type="button">Descargar menú completo (PDF)</button>
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

// Render schedule
const renderSchedule = (data) => {
  const container = document.getElementById('schedule-list');
  if (!container) return;
  if (data.length === 0) {
    container.innerHTML = '<p class="no-results">No hay conciertos programados</p>';
    return;
  }
  container.innerHTML = data.map((concert) => `
    <div class="concert-card">
      <div class="concert-time">${concert.time}</div>
      <div class="concert-info">
        <h3>${concert.artist}</h3>
        <p>${concert.genre || ''} · ${concert.caseta?.name || ''}</p>
        <p class="concert-date">${new Date(concert.date).toLocaleDateString('es-ES')}</p>
      </div>
    </div>
  `).join('');
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
  setTimeout(() => initDetailMap(caseta), 150);
};

const renderDetailMenu = (id) => {
  const casetaMenus = menus.filter((m) => m.caseta?._id === id || m.caseta === id);
  const list = document.getElementById('detail-menu-list');
  if (casetaMenus.length === 0) {
    list.innerHTML = '<li><span>Sin menú disponible</span><span></span></li>';
    return;
  }
  list.innerHTML = casetaMenus.map((m) => `
    <li>
      <span>${m.name}</span>
      <span class="price">${m.price}€</span>
    </li>
  `).join('');
};

const renderDetailSchedule = (id) => {
  const casetaConcerts = concerts.filter((c) => c.caseta?._id === id || c.caseta === id);
  const list = document.getElementById('detail-schedule-list');
  if (casetaConcerts.length === 0) {
    list.innerHTML = '<li><span>Sin conciertos programados</span><span></span></li>';
    return;
  }
  list.innerHTML = casetaConcerts.map((c) => `
    <li>
      <span>${c.artist}${c.genre ? ` · ${c.genre}` : ''}</span>
      <span class="time">${c.time}</span>
    </li>
  `).join('');
};

const renderDetailNearby = (caseta) => {
  const currentNum = Number(caseta.number);
  const sorted = [...casetas]
    .filter((c) => c._id !== caseta._id && !Number.isNaN(Number(c.number)))
    .sort((a, b) => Math.abs(Number(a.number) - currentNum) - Math.abs(Number(b.number) - currentNum));
  const nearby = sorted.slice(0, 3);
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

const showInstallUI = () => {
  const installBtn = document.getElementById('install-btn');
  const appInstallBtn = document.getElementById('app-install-btn');
  const banner = document.getElementById('install-banner');
  if (installBtn) installBtn.style.display = 'inline-flex';
  if (appInstallBtn) appInstallBtn.style.display = 'inline-flex';
  if (banner && !localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY)) {
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
  localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, '1');
};

window.addEventListener('appinstalled', () => {
  hideInstallUI();
});
