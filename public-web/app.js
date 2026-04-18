// Data
let fairs = [];
let casetas = [];
let menus = [];
let concerts = [];
let fuse = null;

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
    btn.classList.toggle('is-active', btn.dataset.section === section);
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

// Render casetas grid
const renderCasetas = (data) => {
  const container = document.getElementById('casetas-list');
  if (!container) return;
  if (data.length === 0) {
    container.innerHTML = '<p class="no-results">No se han encontrado casetas</p>';
    return;
  }
  container.innerHTML = data.map((caseta) => {
    const open = isCasetaOpen(caseta);
    const statusClass = open ? 'is-open' : 'is-closed';
    const statusLabel = open ? 'Abierta' : 'Cerrado';
    const image = caseta.image
      ? `<img src="${caseta.image.replace('/uploads/', '/FeriaApp/uploads/')}" alt="${caseta.name}" class="caseta-card-image" />`
      : '<div class="caseta-no-image"></div>';
    return `
      <article class="caseta-card" onclick="openCasetaModal('${caseta._id}')">
        ${image}
        <div class="caseta-card-head">
          <h3>${caseta.name}</h3>
          <span class="caseta-status ${statusClass}">${statusLabel}</span>
        </div>
        <a class="caseta-card-link" href="#" onclick="event.preventDefault(); event.stopPropagation(); openCasetaModal('${caseta._id}')">Ver menú</a>
      </article>
    `;
  }).join('');
};

// Render menus grouped by caseta
const renderMenus = (casetasData) => {
  const container = document.getElementById('menus-list');
  if (!container) return;
  const withMenus = casetasData
    .map((caseta) => ({
      caseta,
      items: menus.filter((m) => m.caseta?._id === caseta._id || m.caseta === caseta._id),
    }))
    .filter((entry) => entry.items.length > 0);

  if (withMenus.length === 0) {
    container.innerHTML = '<p class="no-results">No hay menús disponibles</p>';
    return;
  }

  container.innerHTML = withMenus.map(({ caseta, items }) => `
    <article class="menu-caseta-card">
      <h3>${caseta.name}</h3>
      <ul class="menu-items">
        ${items.map((m) => `
          <li>
            <span>${m.name}</span>
            <span class="price">${m.price}€</span>
          </li>
        `).join('')}
      </ul>
    </article>
  `).join('');
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

// Open caseta modal
const openCasetaModal = (id) => {
  const caseta = casetas.find((c) => c._id === id);
  if (!caseta) return;

  const casetaMenus = menus.filter((m) => m.caseta?._id === id || m.caseta === id);
  const casetaConcerts = concerts.filter((c) => c.caseta?._id === id || c.caseta === id);

  document.getElementById('modal-body').innerHTML = `
    ${caseta.image
      ? `<img src="${caseta.image.replace('/uploads/', '/FeriaApp/uploads/')}" alt="${caseta.name}" style="width:100%;border-radius:12px;margin-bottom:1rem;max-height:220px;object-fit:cover;" />`
      : ''
    }
    <h2>${caseta.name}</h2>
    <p class="caseta-number-detail">Caseta nº ${caseta.number}</p>
    <p>${caseta.description || ''}</p>

    <h3>Menú</h3>
    ${casetaMenus.length > 0
      ? `<ul class="menu-list">
          ${casetaMenus.map((m) => `
            <li>
              <span>${m.name}</span>
              <span class="price">${m.price}€</span>
            </li>
          `).join('')}
        </ul>`
      : '<p>Sin menú disponible</p>'
    }

    <h3>Programación</h3>
    ${casetaConcerts.length > 0
      ? `<ul class="concert-list">
          ${casetaConcerts.map((c) => `
            <li>
              <span>${c.time} - ${c.artist}</span>
              <span class="genre">${c.genre || ''}</span>
            </li>
          `).join('')}
        </ul>`
      : '<p>Sin conciertos programados</p>'
    }
  `;

  document.getElementById('caseta-modal').classList.remove('hidden');
};

// Close modal
const closeModal = () => {
  document.getElementById('caseta-modal').classList.add('hidden');
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
