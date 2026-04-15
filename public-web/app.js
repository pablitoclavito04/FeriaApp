// Data
let fairs = [];
let casetas = [];
let menus = [];
let concerts = [];
let map = null;
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
    renderSchedule(concerts);
    initMap();
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

// Show main app
const showApp = () => {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  loadData();
};

// Show section
const showSection = (section) => {
  document.querySelectorAll('.section').forEach((s) => s.classList.add('hidden'));
  document.getElementById(`${section}-section`).classList.remove('hidden');

  if (section === 'map' && map) {
    setTimeout(() => map.invalidateSize(), 100);
  }
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

// Render casetas grid
const renderCasetas = (data) => {
  const container = document.getElementById('casetas-list');
  if (data.length === 0) {
    container.innerHTML = '<p class="no-results">No casetas found</p>';
    return;
  }
  container.innerHTML = data.map((caseta) => `
    <div class="caseta-card" onclick="openCasetaModal('${caseta._id}')">
      ${caseta.image
        ? `<img src="${caseta.image.replace('/uploads/', '/FeriaApp/uploads/')}" alt="${caseta.name}" class="caseta-card-image" />`
        : '<div class="caseta-no-image"></div>'
      }
      <div class="caseta-number">${caseta.number}</div>
      <h3>${caseta.name}</h3>
      <p>${caseta.description || ''}</p>
    </div>
  `).join('');
};

// Render schedule
const renderSchedule = (data) => {
  const container = document.getElementById('schedule-list');
  if (data.length === 0) {
    container.innerHTML = '<p class="no-results">No concerts scheduled</p>';
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

// Initialize map
const initMap = () => {
  if (map) return;

  const bounds = [[0, 0], [1052, 1514]];

  map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 3,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
  });

  L.imageOverlay('/FeriaApp/plano_feria.png', bounds).addTo(map);
  map.fitBounds(bounds);

  // Add caseta markers
  casetas.forEach((caseta) => {
    if (caseta.location?.x) {
      const marker = L.marker([caseta.location.x, caseta.location.y]);
      marker.bindPopup(`
        <strong>${caseta.name}</strong><br>
        Caseta nº ${caseta.number}<br>
        <button onclick="openCasetaModal('${caseta._id}')">Ver detalles</button>
      `);
      marker.addTo(map);
    }
  });
};

// Open caseta modal
const openCasetaModal = (id) => {
  const caseta = casetas.find((c) => c._id === id);
  if (!caseta) return;

  const casetaMenus = menus.filter((m) => m.caseta?._id === id || m.caseta === id);
  const casetaConcerts = concerts.filter((c) => c.caseta?._id === id || c.caseta === id);

  document.getElementById('modal-body').innerHTML = `
    ${caseta.image
      ? `<img src="${caseta.image.replace('/uploads/', '/FeriaApp/uploads/')}" alt="${caseta.name}" style="width:100%;border-radius:8px;margin-bottom:1rem;max-height:200px;object-fit:cover;" />`
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
      : '<p>No menu available</p>'
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
      : '<p>No concerts scheduled</p>'
    }
  `;

  document.getElementById('caseta-modal').classList.remove('hidden');
};

// Close modal
const closeModal = () => {
  document.getElementById('caseta-modal').classList.add('hidden');
};