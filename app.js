// EPITA Smart Classroom : audit visuel avec TensorFlow.js + COCO-SSD
// Aucune détection de personnes : la classe "person" est strictement ignorée.

// 79 classes COCO-SSD (toutes sauf 'person', exclue pour le RGPD)
const CATEGORIES = [
  // --- Mobilier ---
  { cls: 'chair', label: 'Chaises', expected: 20, group: 'Mobilier' },
  { cls: 'dining table', label: 'Tables / Bureaux', expected: 10, group: 'Mobilier' },
  { cls: 'couch', label: 'Canapés', expected: 0, group: 'Mobilier' },
  { cls: 'bench', label: 'Bancs', expected: 0, group: 'Mobilier' },
  { cls: 'bed', label: 'Lits', expected: 0, group: 'Mobilier' },
  { cls: 'potted plant', label: 'Plantes en pot', expected: 0, group: 'Mobilier' },
  { cls: 'clock', label: 'Horloges', expected: 0, group: 'Mobilier' },
  { cls: 'vase', label: 'Vases', expected: 0, group: 'Mobilier' },
  { cls: 'book', label: 'Livres', expected: 0, group: 'Mobilier' },
  { cls: 'scissors', label: 'Ciseaux', expected: 0, group: 'Mobilier' },
  // --- Électronique ---
  { cls: 'laptop', label: 'Ordinateurs portables', expected: 5, group: 'Électronique' },
  { cls: 'tv', label: 'Écrans / Moniteurs', expected: 1, group: 'Électronique' },
  { cls: 'keyboard', label: 'Claviers', expected: 0, group: 'Électronique' },
  { cls: 'mouse', label: 'Souris', expected: 0, group: 'Électronique' },
  { cls: 'remote', label: 'Télécommandes', expected: 0, group: 'Électronique' },
  { cls: 'cell phone', label: 'Téléphones portables', expected: 0, group: 'Électronique' },
  // --- Électroménager ---
  { cls: 'microwave', label: 'Micro-ondes', expected: 0, group: 'Électroménager' },
  { cls: 'oven', label: 'Fours', expected: 0, group: 'Électroménager' },
  { cls: 'toaster', label: 'Grille-pain', expected: 0, group: 'Électroménager' },
  { cls: 'refrigerator', label: 'Réfrigérateurs', expected: 0, group: 'Électroménager' },
  { cls: 'sink', label: 'Éviers / Lavabos', expected: 0, group: 'Électroménager' },
  { cls: 'toilet', label: 'Toilettes', expected: 0, group: 'Électroménager' },
  { cls: 'hair drier', label: 'Sèche-cheveux', expected: 0, group: 'Électroménager' },
  { cls: 'toothbrush', label: 'Brosses à dents', expected: 0, group: 'Électroménager' },
  // --- Accessoires ---
  { cls: 'backpack', label: 'Sacs à dos', expected: 0, group: 'Accessoires' },
  { cls: 'handbag', label: 'Sacs à main', expected: 0, group: 'Accessoires' },
  { cls: 'suitcase', label: 'Valises', expected: 0, group: 'Accessoires' },
  { cls: 'umbrella', label: 'Parapluies', expected: 0, group: 'Accessoires' },
  { cls: 'tie', label: 'Cravates', expected: 0, group: 'Accessoires' },
  { cls: 'teddy bear', label: 'Peluches', expected: 0, group: 'Accessoires' },
  // --- Cuisine & Table ---
  { cls: 'bottle', label: 'Bouteilles', expected: 0, group: 'Cuisine & Table' },
  { cls: 'wine glass', label: 'Verres à vin', expected: 0, group: 'Cuisine & Table' },
  { cls: 'cup', label: 'Tasses / Gobelets', expected: 0, group: 'Cuisine & Table' },
  { cls: 'fork', label: 'Fourchettes', expected: 0, group: 'Cuisine & Table' },
  { cls: 'knife', label: 'Couteaux', expected: 0, group: 'Cuisine & Table' },
  { cls: 'spoon', label: 'Cuillères', expected: 0, group: 'Cuisine & Table' },
  { cls: 'bowl', label: 'Bols', expected: 0, group: 'Cuisine & Table' },
  // --- Nourriture ---
  { cls: 'banana', label: 'Bananes', expected: 0, group: 'Nourriture' },
  { cls: 'apple', label: 'Pommes', expected: 0, group: 'Nourriture' },
  { cls: 'sandwich', label: 'Sandwichs', expected: 0, group: 'Nourriture' },
  { cls: 'orange', label: 'Oranges', expected: 0, group: 'Nourriture' },
  { cls: 'broccoli', label: 'Brocolis', expected: 0, group: 'Nourriture' },
  { cls: 'carrot', label: 'Carottes', expected: 0, group: 'Nourriture' },
  { cls: 'hot dog', label: 'Hot-dogs', expected: 0, group: 'Nourriture' },
  { cls: 'pizza', label: 'Pizzas', expected: 0, group: 'Nourriture' },
  { cls: 'donut', label: 'Donuts', expected: 0, group: 'Nourriture' },
  { cls: 'cake', label: 'Gâteaux', expected: 0, group: 'Nourriture' },
  // --- Sport ---
  { cls: 'frisbee', label: 'Frisbees', expected: 0, group: 'Sport' },
  { cls: 'skis', label: 'Skis', expected: 0, group: 'Sport' },
  { cls: 'snowboard', label: 'Snowboards', expected: 0, group: 'Sport' },
  { cls: 'sports ball', label: 'Ballons', expected: 0, group: 'Sport' },
  { cls: 'kite', label: 'Cerfs-volants', expected: 0, group: 'Sport' },
  { cls: 'baseball bat', label: 'Battes de baseball', expected: 0, group: 'Sport' },
  { cls: 'baseball glove', label: 'Gants de baseball', expected: 0, group: 'Sport' },
  { cls: 'skateboard', label: 'Skateboards', expected: 0, group: 'Sport' },
  { cls: 'surfboard', label: 'Planches de surf', expected: 0, group: 'Sport' },
  { cls: 'tennis racket', label: 'Raquettes de tennis', expected: 0, group: 'Sport' },
  // --- Véhicules & Extérieur ---
  { cls: 'bicycle', label: 'Vélos', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'car', label: 'Voitures', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'motorcycle', label: 'Motos', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'airplane', label: 'Avions', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'bus', label: 'Bus', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'train', label: 'Trains', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'truck', label: 'Camions', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'boat', label: 'Bateaux', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'traffic light', label: 'Feux de signalisation', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'fire hydrant', label: 'Bouches d\'incendie', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'stop sign', label: 'Panneaux stop', expected: 0, group: 'Véhicules & Extérieur' },
  { cls: 'parking meter', label: 'Parcmètres', expected: 0, group: 'Véhicules & Extérieur' },
  // --- Animaux ---
  { cls: 'bird', label: 'Oiseaux', expected: 0, group: 'Animaux' },
  { cls: 'cat', label: 'Chats', expected: 0, group: 'Animaux' },
  { cls: 'dog', label: 'Chiens', expected: 0, group: 'Animaux' },
  { cls: 'horse', label: 'Chevaux', expected: 0, group: 'Animaux' },
  { cls: 'sheep', label: 'Moutons', expected: 0, group: 'Animaux' },
  { cls: 'cow', label: 'Vaches', expected: 0, group: 'Animaux' },
  { cls: 'elephant', label: 'Éléphants', expected: 0, group: 'Animaux' },
  { cls: 'bear', label: 'Ours', expected: 0, group: 'Animaux' },
  { cls: 'zebra', label: 'Zèbres', expected: 0, group: 'Animaux' },
  { cls: 'giraffe', label: 'Girafes', expected: 0, group: 'Animaux' }
];

const idOf = cls => 'exp-' + cls.replace(/ /g, '_');

const UNSUPPORTED_CATEGORIES = [
  { name: 'Tableau (Blanc / Noir)', desc: 'Hors vocabulaire COCO-SSD' },
  { name: 'Fenêtres',               desc: 'Hors vocabulaire COCO-SSD' }
];

// Catégories détectées par OWL-ViT (zero-shot, hors vocabulaire COCO)
const OWL_CATEGORIES = [
  { key: 'whiteboard',   label: 'Tableau (Blanc / Noir)', expected: 1, prompts: ['a photo of a whiteboard', 'a photo of a blackboard'] },
  { key: 'window',       label: 'Fenêtres',               expected: 2, prompts: ['a photo of a window'] },
  { key: 'blinds',       label: 'Stores',                 expected: 0, prompts: ['a photo of window blinds'] },
  { key: 'projector',    label: 'Vidéoprojecteur',        expected: 0, prompts: ['a photo of a projector'] },
  { key: 'door',         label: 'Portes',                 expected: 0, prompts: ['a photo of a door'] },
  { key: 'extinguisher', label: 'Extincteurs',            expected: 0, prompts: ['a photo of a fire extinguisher'] }
];
const OWL_FORM = OWL_CATEGORIES.map(o => ({
  cls: 'owl_' + o.key, tag: 'OWL-ViT', label: o.label, expected: o.expected, group: 'Structure de la salle (OWL-ViT)'
}));
const OWL_BASE_THRESHOLD = 0.01;
const OWL_MAX_SIDE = 1024;

// OWL-HELPERS-START
function overlap(a, b) {
  const x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[0] + a[2], b[0] + b[2]), y2 = Math.min(a[1] + a[3], b[1] + b[3]);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const areaA = a[2] * a[3], areaB = b[2] * b[3];
  const union = areaA + areaB - inter;
  return { iou: union > 0 ? inter / union : 0, min: Math.min(areaA, areaB) > 0 ? inter / Math.min(areaA, areaB) : 0 };
}

function nmsBoxes(preds, iouThr = 0.3, minThr = 0.8) {
  const keep = [];
  [...preds].sort((a, b) => b.score - a.score).forEach(p => {
    if (keep.every(k => { const o = overlap(k.bbox, p.bbox); return o.iou < iouThr && o.min < minThr; })) keep.push(p);
  });
  return keep;
}

function owlPostProcess(raw, scale, threshold) {
  const promptToCat = {};
  OWL_CATEGORIES.forEach(o => o.prompts.forEach(p => { promptToCat[p] = o; }));
  const byCat = {};
  raw.forEach(r => {
    const o = promptToCat[r.label];
    if (!o || r.score < threshold) return;
    const b = r.box;
    if (!byCat[o.key]) byCat[o.key] = [];
    byCat[o.key].push({
      key: o.key, class: o.label, score: r.score, color: '#f59e0b',
      bbox: [b.xmin / scale, b.ymin / scale, (b.xmax - b.xmin) / scale, (b.ymax - b.ymin) / scale]
    });
  });
  return Object.values(byCat).flatMap(list => nmsBoxes(list));
}
// OWL-HELPERS-END

const FORBIDDEN_CLASSES = ['person'];
const AUDIT_FRAMES = 5;

// ---------- DOM refs ----------
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const overlay = document.getElementById('overlay');
const statusEl = document.getElementById('status');
const sourceBadge = document.getElementById('source-badge');
const progressWrap = document.getElementById('progress-wrap');
const progressBar = document.getElementById('progress-bar');

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnAudit = document.getElementById('btn-audit');
const btnImage = document.getElementById('btn-image');
const btnExport = document.getElementById('btn-export');
const fileInput = document.getElementById('file-input');
const thresholdInput = document.getElementById('threshold');
const thresholdValue = document.getElementById('threshold-value');
const owlEnabled = document.getElementById('owl-enabled');
const owlThresholdInput = document.getElementById('owl-threshold');
const owlThresholdValue = document.getElementById('owl-threshold-value');

// ---------- State ----------
let model = null;
let stream = null;
let running = false;
let mode = 'none'; // 'none' | 'camera' | 'image'
let currentImage = null;
let threshold = 0.5;
let lastAuditReport = null;
const auditTimes = [];
let owlThreshold = 0.1;
let lastOwlPreds = [];
let owlCache = null; // { src, raw, scale }

// ---------- Progress helpers ----------
function showProgress(pct, indeterminate = false) {
  progressWrap.classList.add('visible');
  progressBar.classList.toggle('indeterminate', indeterminate);
  if (!indeterminate) {
    const v = Math.max(0, Math.min(100, pct));
    progressBar.style.width = v + '%';
    progressWrap.setAttribute('aria-valuenow', String(Math.round(v)));
  } else {
    progressBar.style.width = '';
    progressWrap.setAttribute('aria-valuenow', '0');
  }
}

function hideProgress() {
  progressWrap.classList.remove('visible');
  progressBar.classList.remove('indeterminate');
  progressBar.style.width = '0%';
}

function setStatus(msg, type = 'loading') {
  statusEl.textContent = msg;
  statusEl.className = 'text-sm font-medium mt-3 status-' + type;
}

// ---------- Génération Dynamique du Formulaire de Config ----------
const form = document.getElementById('config-form');
form.classList.add('cfg-scroll');

const search = document.createElement('input');
search.type = 'search';
search.placeholder = 'Rechercher un objet…';
search.className = 'cfg-search';
search.setAttribute('aria-label', 'Rechercher un objet dans la configuration');
form.parentNode.insertBefore(search, form);

let lastGroup = null;
const frag = document.createDocumentFragment();
[...CATEGORIES, ...OWL_FORM].forEach(c => {
  if (c.group !== lastGroup) {
    const h = document.createElement('p');
    h.className = 'cfg-group';
    h.dataset.group = c.group;
    h.textContent = c.group;
    frag.appendChild(h);
    lastGroup = c.group;
  }
  const row = document.createElement('div');
  row.className = 'cfg-row';
  row.dataset.group = c.group;
  row.dataset.search = `${c.label} ${c.cls}`.toLowerCase();
  row.innerHTML = `
    <label for="${idOf(c.cls)}" class="text-xs font-medium text-slate-700">
      ${c.label} <span class="text-slate-400 font-normal">(${c.tag || c.cls})</span>
    </label>
    <input id="${idOf(c.cls)}" type="number" min="0" value="${c.expected}" class="text-xs" />
  `;
  frag.appendChild(row);
});
form.appendChild(frag);

// Éléments mis en cache une seule fois (évite des querySelectorAll à chaque frappe)
const cfgRows = [...form.querySelectorAll('.cfg-row')];
const cfgGroups = [...form.querySelectorAll('.cfg-group')];
const cfgInputs = new Map(cfgRows.map(r => [r.querySelector('input').id, r.querySelector('input')]));

const cfgEmpty = document.createElement('p');
cfgEmpty.className = 'cfg-empty';
cfgEmpty.textContent = 'Aucun objet ne correspond à la recherche.';
cfgEmpty.hidden = true;
form.appendChild(cfgEmpty);

function filterConfig() {
  const q = search.value.trim().toLowerCase();
  const visibleGroups = new Set();
  let any = false;
  cfgRows.forEach(r => {
    const show = !q || r.dataset.search.includes(q);
    r.hidden = !show;
    if (show) { visibleGroups.add(r.dataset.group); any = true; }
  });
  cfgGroups.forEach(g => { g.hidden = !visibleGroups.has(g.dataset.group); });
  cfgEmpty.hidden = any;
}

let searchTimer = null;
search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(filterConfig, 120); // debounce
});

const getExpected = cls => Math.max(0, parseInt(cfgInputs.get(idOf(cls))?.value || 0, 10) || 0);

// Gestion du Seuil de Confiance
thresholdInput.addEventListener('input', () => {
  threshold = thresholdInput.value / 100;
  thresholdValue.textContent = `${thresholdInput.value} %`;
});
thresholdInput.addEventListener('change', () => {
  if (mode === 'image' && currentImage) runAudit();
});

// ---------- OWL-ViT ----------
owlThresholdInput.addEventListener('input', () => {
  owlThreshold = owlThresholdInput.value / 100;
  owlThresholdValue.textContent = `${owlThresholdInput.value} %`;
});
owlThresholdInput.addEventListener('change', () => {
  if (mode === 'image' && currentImage && owlEnabled.checked) runAudit();
});
owlEnabled.addEventListener('change', () => {
  if (!owlEnabled.checked) lastOwlPreds = [];
  if (mode === 'image' && currentImage) runAudit();
});

async function runOwl(source) {
  const owl = window.OwlDetector;
  if (!owl) throw new Error('module owl.js non chargé');

  let entry = (mode === 'image' && owlCache && owlCache.src === source) ? owlCache : null;
  if (!entry) {
    const nw = source.naturalWidth || source.videoWidth;
    const nh = source.naturalHeight || source.videoHeight;
    if (!nw || !nh) throw new Error('source vide');
    const scale = Math.min(1, OWL_MAX_SIDE / Math.max(nw, nh));
    const tmp = document.createElement('canvas');
    tmp.width = Math.round(nw * scale);
    tmp.height = Math.round(nh * scale);
    tmp.getContext('2d').drawImage(source, 0, 0, tmp.width, tmp.height);

    await owl.load(p => {
      if (p && p.status === 'progress' && typeof p.progress === 'number') {
        const pct = Math.round(p.progress);
        setStatus(`Téléchargement OWL-ViT… ${pct} % (${p.file || ''})`, 'loading');
        showProgress(pct);
      }
    });
    setStatus('Analyse OWL-ViT en cours (tableau, fenêtres…)…', 'loading');
    showProgress(0, true);

    const labels = OWL_CATEGORIES.flatMap(o => o.prompts);
    const raw = await owl.detect(tmp, labels, OWL_BASE_THRESHOLD);
    entry = { src: source, raw, scale };
    if (mode === 'image') owlCache = entry;
  }
  return owlPostProcess(entry.raw, entry.scale, owlThreshold);
}

// ---------- Chargement Modèle COCO-SSD ----------
showProgress(0, true);
const modelReady = cocoSsd.load().then(m => {
  model = m;
  hideProgress();
  setStatus('Modèle COCO-SSD chargé. Prêt pour l\'analyse.', 'ok');
  if (mode !== 'none') btnAudit.disabled = false;
}).catch(e => {
  hideProgress();
  setStatus('Erreur lors du chargement du modèle : ' + e.message, 'error');
});

// ---------- Caméra ----------
btnStart.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream;
    video.style.display = 'block';
    await video.play();

    currentImage = null;
    lastOwlPreds = [];
    mode = 'camera';
    running = true;
    overlay.classList.add('hidden');
    sourceBadge.textContent = 'Caméra Active';
    sourceBadge.className = 'text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded font-medium';

    btnStart.disabled = true;
    btnStop.disabled = false;
    btnAudit.disabled = !model;
    setStatus('Flux vidéo en direct actif.', 'ok');
    loop();
  } catch (e) {
    setStatus('Accès à la caméra refusé ou non supporté : ' + e.message, 'warn');
  }
});

btnStop.addEventListener('click', () => {
  stopCamera();
  resetStage();
});

function stopCamera() {
  running = false;
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
  btnStart.disabled = false;
  btnStop.disabled = true;
}

function resetStage() {
  mode = 'none';
  currentImage = null;
  lastOwlPreds = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlay.classList.remove('hidden');
  btnAudit.disabled = true;
  sourceBadge.textContent = 'Inactif';
  sourceBadge.className = 'text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded';
  setStatus('Source arrêtée.', 'loading');
  hideProgress();
}

// ---------- Image Importée ----------
btnImage.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setStatus('Veuillez sélectionner un fichier image valide.', 'warn');
    return;
  }

  stopCamera();
  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = async () => {
    currentImage = img;
    mode = 'image';
    video.style.display = 'none';
    overlay.classList.add('hidden');
    sourceBadge.textContent = 'Image Fixe';
    sourceBadge.className = 'text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded font-medium';

    drawImage(img);
    setStatus('Image importée. Préparation de l\'analyse…', 'loading');
    showProgress(0, true);

    await modelReady;
    if (model) {
      btnAudit.disabled = false;
      runAudit();
    }
    URL.revokeObjectURL(url);
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    setStatus('Erreur lors de la lecture de l\'image.', 'error');
    hideProgress();
  };
  img.src = url;
  fileInput.value = '';
});

function drawImage(img) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const ox = (canvas.width - w) / 2;
  const oy = (canvas.height - h) / 2;

  ctx.drawImage(img, ox, oy, w, h);
  return { sx: scale, sy: scale, ox, oy };
}

// ---------- Détection & Bounding Boxes ----------
async function detect(source) {
  if (!model) return [];
  const raw = await model.detect(source);
  return raw.filter(p => !FORBIDDEN_CLASSES.includes(p.class) && p.score >= threshold);
}

function drawBoxes(predictions, transform = { sx: 1, sy: 1, ox: 0, oy: 0 }) {
  ctx.lineWidth = 2;
  ctx.font = '13px system-ui, sans-serif';

  for (const p of predictions) {
    const x = p.bbox[0] * transform.sx + transform.ox;
    const y = p.bbox[1] * transform.sy + transform.oy;
    const w = p.bbox[2] * transform.sx;
    const h = p.bbox[3] * transform.sy;

    const color = p.color || '#06b6d4';
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, w, h);

    const text = `${p.class} ${(p.score * 100).toFixed(0)}%`;
    const tw = ctx.measureText(text).width + 8;

    ctx.fillStyle = color;
    ctx.fillRect(x, Math.max(0, y - 20), tw, 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + 4, Math.max(14, y - 5));
  }
}

async function loop() {
  if (!running || !model) {
    if (running) requestAnimationFrame(loop);
    return;
  }
  try {
    const preds = await detect(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoxes([...preds, ...lastOwlPreds], {
      sx: canvas.width / (video.videoWidth || canvas.width),
      sy: canvas.height / (video.videoHeight || canvas.height),
      ox: 0, oy: 0
    });
  } catch (_) { /* ignore frame errors */ }
  requestAnimationFrame(loop);
}

// ---------- Logique d'Audit & Calculs ----------
btnAudit.addEventListener('click', runAudit);

async function runAudit() {
  if (!model || mode === 'none') return;

  btnAudit.disabled = true;
  setStatus('Audit en cours d\'exécution…', 'loading');
  showProgress(5);

  const t0 = performance.now();
  const maxCounts = {};
  const scores = [];
  let lastPreds = [];
  const source = mode === 'image' ? currentImage : video;
  const frames = mode === 'image' ? 1 : AUDIT_FRAMES;

  for (let i = 0; i < frames; i++) {
    const preds = await detect(source);
    lastPreds = preds;
    const counts = {};
    for (const p of preds) {
      counts[p.class] = (counts[p.class] || 0) + 1;
      scores.push(p.score);
    }
    for (const k of Object.keys(counts)) {
      maxCounts[k] = Math.max(maxCounts[k] || 0, counts[k]);
    }
    showProgress(10 + Math.round((i + 1) / frames * 45));
  }

  // Détection complémentaire OWL-ViT
  let owlPreds = null;
  let owlError = '';
  if (owlEnabled.checked) {
    try {
      showProgress(60, true);
      owlPreds = await runOwl(source);
      showProgress(90);
    } catch (e) {
      owlError = e.message || String(e);
      console.error('OWL-ViT :', e);
    }
  }
  lastOwlPreds = owlPreds || [];

  const elapsed = performance.now() - t0;
  auditTimes.push(elapsed);

  if (mode === 'image') {
    const t = drawImage(currentImage);
    drawBoxes([...lastPreds, ...lastOwlPreds], t);
  }

  renderAudit(maxCounts, scores, elapsed, lastPreds.length + lastOwlPreds.length, owlPreds);
  showProgress(100);
  setTimeout(hideProgress, 400);

  const owlNote = owlError ? ` OWL-ViT indisponible (${owlError}).` : '';
  setStatus(`Audit terminé en ${(elapsed / 1000).toFixed(2)} s (${mode === 'image' ? 'mode image' : 'mode vidéo'}).${owlNote}`, owlError ? 'warn' : 'ok');
  btnAudit.disabled = false;
  btnExport.disabled = false;
}

function renderAudit(counts, scores, elapsed, totalDetected, owlPreds = null) {
  const body = document.getElementById('audit-body');
  const rows = [];
  let totalGaps = 0;
  const auditDetails = [];

  // 1. Équipements COCO-SSD
  for (const c of CATEGORIES) {
    const expected = getExpected(c.cls);
    const found = counts[c.cls] || 0;
    if (expected === 0 && found === 0) continue;

    const diff = found - expected;
    const ok = diff === 0;
    if (!ok) totalGaps++;

    auditDetails.push({ label: c.label, expected, found, diff, ok, supported: true });

    const diffClass = diff === 0 ? 'text-slate-600' : diff > 0 ? 'text-blue-600' : 'text-amber-600';
    rows.push(`
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-medium text-slate-800">${c.label} <span class="text-xs text-slate-400 font-normal">(${c.cls})</span></td>
        <td class="py-3 px-4 text-slate-600">${expected}</td>
        <td class="py-3 px-4 text-slate-600">${found}</td>
        <td class="py-3 px-4 font-semibold ${diffClass}">${diff > 0 ? '+' : ''}${diff}</td>
        <td class="py-3 px-4">
          <span class="badge ${ok ? 'badge-ok' : 'badge-warn'}">${ok ? 'Conforme' : 'Écart détecté'}</span>
        </td>
      </tr>
    `);
  }

  // 2. Structure de la salle (OWL-ViT) ou non supporté
  if (owlPreds) {
    for (const o of OWL_CATEGORIES) {
      const expected = getExpected('owl_' + o.key);
      const found = owlPreds.filter(p => p.key === o.key).length;
      if (expected === 0 && found === 0) continue;

      const diff = found - expected;
      const ok = diff === 0;
      if (!ok) totalGaps++;

      auditDetails.push({ label: o.label, expected, found, diff, ok, supported: true, source: 'OWL-ViT' });

      const diffClass = diff === 0 ? 'text-slate-600' : diff > 0 ? 'text-blue-600' : 'text-amber-600';
      rows.push(`
        <tr class="hover:bg-slate-50">
          <td class="py-3 px-4 font-medium text-slate-800">${o.label} <span class="text-xs text-amber-600 font-normal">(OWL-ViT)</span></td>
          <td class="py-3 px-4 text-slate-600">${expected}</td>
          <td class="py-3 px-4 text-slate-600">${found}</td>
          <td class="py-3 px-4 font-semibold ${diffClass}">${diff > 0 ? '+' : ''}${diff}</td>
          <td class="py-3 px-4">
            <span class="badge ${ok ? 'badge-ok' : 'badge-warn'}" title="Détection zero-shot : à confirmer visuellement">
              ${ok ? 'Conforme' : 'Écart détecté'}
            </span>
          </td>
        </tr>
      `);
    }
  } else {
    for (const u of UNSUPPORTED_CATEGORIES) {
      auditDetails.push({ label: u.name, expected: '-', found: '-', diff: '-', ok: false, supported: false });
      rows.push(`
        <tr class="bg-slate-50/50">
          <td class="py-3 px-4 text-slate-500 font-medium">${u.name}</td>
          <td class="py-3 px-4 text-slate-400">–</td>
          <td class="py-3 px-4 text-slate-400">–</td>
          <td class="py-3 px-4 text-slate-400">–</td>
          <td class="py-3 px-4">
            <span class="badge badge-na" title="${u.desc}">Non analysé (OWL-ViT désactivé)</span>
          </td>
        </tr>
      `);
    }
  }

  const totalCats = CATEGORIES.length + (owlPreds ? OWL_CATEGORIES.length : 0);
  const shown = auditDetails.filter(d => d.supported).length;
  const hidden = totalCats - shown;
  if (hidden > 0) {
    rows.push(`
      <tr><td colspan="5" class="py-2 px-4 text-xs text-slate-400 italic">
        ${hidden} autre(s) catégorie(s) surveillée(s) : aucune attendue, aucune détectée.
      </td></tr>
    `);
  }

  body.innerHTML = rows.length
    ? rows.join('')
    : `<tr><td colspan="5" class="py-6 text-center text-slate-400">Aucun objet détecté ni attendu.</td></tr>`;

  // KPIs
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  document.getElementById('kpi-total').textContent = totalDetected;
  document.getElementById('kpi-rate').textContent = scores.length ? `${(avgScore * 100).toFixed(0)} %` : 'N/A';
  document.getElementById('kpi-time').textContent = `${(elapsed / 1000).toFixed(2)} s`;

  const statusKpi = document.getElementById('kpi-status');
  if (totalGaps === 0) {
    statusKpi.textContent = 'Conforme';
    statusKpi.className = 'kpi-value text-sm font-bold text-emerald-600';
  } else {
    statusKpi.textContent = `${totalGaps} Écart(s)`;
    statusKpi.className = 'kpi-value text-sm font-bold text-amber-600';
  }

  lastAuditReport = {
    date: new Date().toLocaleString('fr-FR'),
    mode,
    threshold: `${Math.round(threshold * 100)}%`,
    totalDetected,
    avgScore: `${(avgScore * 100).toFixed(1)}%`,
    executionTime: `${(elapsed / 1000).toFixed(2)}s`,
    totalGaps,
    details: auditDetails
  };
}

// ---------- Exportation du Rapport ----------
btnExport.addEventListener('click', () => {
  if (!lastAuditReport) return;

  let reportTxt = `=================================================\n`;
  reportTxt += `  EPITA SMART CLASSROOM - RAPPORT D'AUDIT VISUEL  \n`;
  reportTxt += `=================================================\n`;
  reportTxt += `Date de l'audit     : ${lastAuditReport.date}\n`;
  reportTxt += `Source d'analyse    : ${lastAuditReport.mode.toUpperCase()}\n`;
  reportTxt += `Seuil de confiance  : ${lastAuditReport.threshold}\n`;
  reportTxt += `Objets détectés     : ${lastAuditReport.totalDetected}\n`;
  reportTxt += `Confiance moyenne   : ${lastAuditReport.avgScore}\n`;
  reportTxt += `Temps de traitement : ${lastAuditReport.executionTime}\n`;
  reportTxt += `Écarts constatés    : ${lastAuditReport.totalGaps}\n`;
  reportTxt += `-------------------------------------------------\n\n`;
  reportTxt += `DÉTAIL PAR ÉQUIPEMENT :\n`;

  lastAuditReport.details.forEach(d => {
    if (d.supported) {
      reportTxt += `- ${d.label.padEnd(22, ' ')} | Attendu: ${String(d.expected).padEnd(2)} | Détecté: ${String(d.found).padEnd(2)} | Statut: ${d.ok ? 'CONFORME' : 'ÉCART'}${d.source ? ' [' + d.source + ']' : ''}\n`;
    } else {
      reportTxt += `- ${d.label.padEnd(22, ' ')} | [NON SUPPORTÉ PAR LE MODÈLE IA - VÉRIFICATION MANUELLE REQUISE]\n`;
    }
  });

  reportTxt += `\n-------------------------------------------------\n`;
  if (lastAuditReport.details.some(d => d.source)) {
    reportTxt += `Note : les lignes [OWL-ViT] proviennent d'une détection zero-shot, moins fiable que COCO-SSD ; contrôle visuel recommandé.\n`;
  }
  reportTxt += `Avertissement Éthique : Conformément aux consignes, aucune personne n'a été analysée ni enregistrée.\n`;

  const blob = new Blob([reportTxt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Audit_EPITA_Smart_Classroom_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});
