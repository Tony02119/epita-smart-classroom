// EPITA Smart Classroom — Édition 3D Low-Poly
// 1. Scène Three.js façon "diorama pastel" (hero)
// 2. Audit visuel COCO-SSD (RGPD : classe "person" strictement ignorée)

/* ================= SCÈNE 3D LOW-POLY ================= */
(function init3D() {
  const canvas = document.getElementById('stage3d');
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe6d6f5, 18, 42);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(9.5, 8.5, 9.5);
  camera.lookAt(0, 0.6, 0);

  // Lumières douces
  scene.add(new THREE.HemisphereLight(0xfff2ff, 0xd8c8ea, 0.95));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.15);
  sun.position.set(6, 10, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -10; sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10;
  scene.add(sun);

  const MAT = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
  const P = { floor: 0x8bc34a, floor2: 0xa2cf6e, wood: 0x8d6e63, woodDark: 0x5d4037,
              white: 0xfafafa, pink: 0xf8bbd0, purple: 0xb39ddb, red: 0xf4736a,
              teal: 0x39c8b6, amber: 0xf5b04c, stone: 0xe0e0e0 };

  // Sol : îlot gazonné façon "diorama"
  const base = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.8, 1.1, 9), MAT(P.floor));
  base.position.y = -0.55; base.receiveShadow = true; base.rotation.y = 0.32; scene.add(base);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.4, 0.18, 9), MAT(P.floor2));
  top.position.y = 0.09; top.receiveShadow = true; top.rotation.y = 0.32; scene.add(top);

  // Tapis central (zone salle de classe)
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 0.1, 24), MAT(0xd6c2ea));
  rug.position.y = 0.23; rug.receiveShadow = true; scene.add(rug);

  const G = new THREE.Group(); scene.add(G);

  function box(w, h, d, color, x, y, z, ry = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MAT(color));
    m.position.set(x, y, z); m.rotation.y = ry;
    m.castShadow = true; m.receiveShadow = true; G.add(m); return m;
  }
  function cyl(rT, rB, h, color, x, y, z, seg = 8) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg), MAT(color));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; G.add(m); return m;
  }

  // --- Mur arrière + tableau blanc ---
  box(5.6, 2.6, 0.28, P.white, 0, 1.6, -3.1);
  box(3.6, 1.5, 0.12, P.stone, 0, 1.85, -2.94);              // tableau
  box(0.14, 1.5, 0.12, P.pink, -1.85, 1.85, -2.92);
  box(0.14, 1.5, 0.12, P.pink, 1.85, 1.85, -2.92);
  // Guirlande de fanions
  for (let i = 0; i < 7; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), MAT(i % 2 ? P.pink : P.purple));
    f.position.set(-1.8 + i * 0.6, 3.05 + Math.sin(i * 1.3) * 0.08, -2.8);
    f.rotation.x = Math.PI; f.castShadow = true; G.add(f);
  }

  // --- Fenêtre ---
  box(1.5, 1.3, 0.14, 0xbfe3f5, 3.4, 2.0, -1.4, 0.35);
  box(0.12, 1.3, 0.12, P.white, 3.4, 2.0, -1.32, 0.35);

  // --- Écran TV sur chariot ---
  box(2.0, 1.15, 0.1, 0x1c1430, -3.2, 1.75, 0.4, 0.9);
  cyl(0.12, 0.16, 1.2, P.woodDark, -3.2, 0.6, 0.4, 0.9);
  cyl(0.34, 0.34, 0.1, P.red, -3.2, 0.55, 0.4, 0.9);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.95),
    new THREE.MeshBasicMaterial({ color: 0x9b6fd0 }));
  scr.position.set(-3.09, 1.75, 0.4); scr.rotation.y = 0.9; G.add(scr);

  // --- Bureaux + ordinateurs portables ---
  const desks = [{ x: -1.5, z: 0.4, r: 0.18 }, { x: 1.5, z: 0.4, r: -0.18 }, { x: 0, z: 1.7, r: 0 }];
  desks.forEach(d => {
    box(1.7, 0.12, 0.9, P.wood, d.x, 0.95, d.z, d.r);
    cyl(0.05, 0.05, 0.9, P.woodDark, d.x - 0.75, 0.45, d.z, 6);
    cyl(0.05, 0.05, 0.9, P.woodDark, d.x + 0.75, 0.45, d.z, 6);
    box(0.55, 0.04, 0.38, P.teal, d.x, 1.03, d.z, d.r);
    const lid = box(0.55, 0.34, 0.03, P.teal, d.x, 1.2, d.z - 0.18, d.r);
    lid.rotation.x = -0.28;
  });

  // --- Chaises ---
  const chairs = [
    { x: -1.5, z: 1.15, r: Math.PI }, { x: 1.5, z: 1.15, r: Math.PI },
    { x: 0, z: 2.45, r: Math.PI }, { x: -2.9, z: -1.6, r: 2.2 }, { x: 2.9, z: -1.6, r: -2.2 }
  ];
  chairs.forEach(c => {
    const g = new THREE.Group(); g.position.set(c.x, 0, c.z); g.rotation.y = c.r;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.5), MAT(P.pink));
    seat.position.y = 0.62; seat.castShadow = true; g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.06), MAT(P.pink));
    back.position.set(0, 0.92, 0.24); back.castShadow = true; g.add(back);
    [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 6), MAT(P.woodDark));
      leg.position.set(lx, 0.3, lz); leg.castShadow = true; g.add(leg);
    });
    G.add(g);
  });

  // --- Plante en pot ---
  cyl(0.22, 0.17, 0.32, P.amber, 3.1, 0.39, 2.4);
  cyl(0.02, 0.03, 0.5, 0x6d4c41, 3.1, 0.8, 2.4, 5);
  const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), MAT(0x7cb342));
  foliage.position.set(3.1, 1.2, 2.4); foliage.castShadow = true; G.add(foliage);

  // --- Horloge / lanterne ---
  cyl(0.16, 0.2, 0.34, P.stone, -3.3, 0.4, 2.2);
  const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16), MAT(P.white));
  clock.rotation.x = Math.PI / 2; clock.position.set(-3.3, 0.65, 2.2); clock.castShadow = true; G.add(clock);

  // --- Chemin de pierres ---
  for (let i = 0; i < 4; i++) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.3 + (i % 2) * 0.08, 0.3, 0.06, 7), MAT(P.stone));
    st.position.set(-2.6 + i * 0.5, 0.3, 3.3 - i * 0.35); st.receiveShadow = true; G.add(st);
  }

  // --- Pin de détection flottant ---
  const pin = new THREE.Group();
  const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), MAT(P.red));
  pinHead.position.y = 1.0; pin.add(pinHead);
  const pinTail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 8), MAT(P.red));
  pinTail.position.y = 0.8; pinTail.rotation.x = Math.PI; pin.add(pinTail);
  pin.position.set(-1.5, 1.1, 0.4); G.add(pin);

  // Interaction : rotation à la souris + auto-rotation
  let targetRot = 0.4, autoRot = 0.4, dragging = false, lastX = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; });
  addEventListener('pointerup', () => dragging = false);
  addEventListener('pointermove', e => {
    if (dragging) { targetRot += (e.clientX - lastX) * 0.008; lastX = e.clientX; }
  });

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    if (!dragging) targetRot = autoRot + Math.sin(t * 0.5) * 0.25;
    G.rotation.y += (targetRot - G.rotation.y) * 0.06;
    pin.position.y = 1.1 + Math.sin(t * 2.4) * 0.08;
    pinHead.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
    camera.position.y = 8.5 + Math.sin(t * 0.4) * 0.35;
    camera.lookAt(0, 0.6, 0);
    renderer.render(scene, camera);
  })();
})();

/* ================= LOGIQUE D'AUDIT (COCO-SSD) ================= */

const CATEGORIES = [
  { cls: 'chair',        label: 'Chaises',                expected: 20 },
  { cls: 'dining table', label: 'Tables / Bureaux',       expected: 10 },
  { cls: 'laptop',       label: 'Ordinateurs portables',  expected: 5 },
  { cls: 'tv',           label: 'Écrans / Moniteurs',     expected: 1 },
  { cls: 'keyboard',     label: 'Claviers',               expected: 0 },
  { cls: 'mouse',        label: 'Souris',                 expected: 0 },
  { cls: 'clock',        label: 'Horloges',               expected: 1 },
  { cls: 'book',         label: 'Livres',                expected: 0 },
  { cls: 'backpack',     label: 'Sacs à dos',            expected: 0 },
  { cls: 'potted plant', label: 'Plantes en pot',        expected: 1 },
  { cls: 'cell phone',   label: 'Téléphones',            expected: 0 }
];

const UNSUPPORTED_CATEGORIES = [
  { name: 'Tableau (Blanc / Noir)', desc: 'Hors vocabulaire COCO-SSD — contrôle manuel requis' },
  { name: 'Fenêtres & Stores',      desc: 'Hors vocabulaire COCO-SSD — contrôle manuel requis' },
  { name: 'Vidéoprojecteur',        desc: 'Hors vocabulaire COCO-SSD — contrôle manuel requis' }
];

const FORBIDDEN_CLASSES = ['person'];
const AUDIT_FRAMES = 5;

const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const statusEl = document.getElementById('status');
const sourceBadge = document.getElementById('source-badge');

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnAudit = document.getElementById('btn-audit');
const btnImage = document.getElementById('btn-image');
const btnExport = document.getElementById('btn-export');
const fileInput = document.getElementById('file-input');
const thresholdInput = document.getElementById('threshold');
const thresholdValue = document.getElementById('threshold-value');

let model = null, stream = null, running = false;
let mode = 'none', currentImage = null, threshold = 0.5, lastAuditReport = null;
const auditTimes = [];

// Formulaire de config dynamique
const form = document.getElementById('config-form');
CATEGORIES.forEach(c => {
  const row = document.createElement('div');
  row.className = 'cfg-row';
  row.innerHTML = `
    <label for="exp-${c.cls}">${c.label} <small>(${c.cls})</small></label>
    <input id="exp-${c.cls}" type="number" min="0" value="${c.expected}" />`;
  form.appendChild(row);
});
const getExpected = cls => Math.max(0, parseInt(document.getElementById(`exp-${c.cls}`)?.value || 0, 10));

thresholdInput.addEventListener('input', () => {
  threshold = thresholdInput.value / 100;
  thresholdValue.textContent = `${thresholdInput.value} %`;
});
thresholdInput.addEventListener('change', () => { if (mode === 'image' && currentImage) runAudit(); });

// Chargement COCO-SSD
const modelReady = cocoSsd.load().then(m => {
  model = m;
  statusEl.textContent = 'Modèle COCO-SSD chargé. Prêt pour l\'analyse. ✅';
  statusEl.style.color = '#12866f';
  if (mode !== 'none') btnAudit.disabled = false;
}).catch(e => {
  statusEl.textContent = 'Erreur de chargement du modèle : ' + e.message + ' — vérifiez votre connexion.';
  statusEl.style.color = '#c2412f';
});

// Caméra
btnStart.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream;
    video.style.display = 'block';
    await video.play();
    currentImage = null; mode = 'camera'; running = true;
    overlay.classList.add('hidden');
    sourceBadge.textContent = '🎥 Caméra active';
    sourceBadge.style.background = '#d9f5ee'; sourceBadge.style.color = '#12866f';
    btnStart.disabled = true; btnStop.disabled = false; btnAudit.disabled = !model;
    statusEl.textContent = 'Flux vidéo en direct actif.';
    loop();
  } catch (e) {
    statusEl.textContent = 'Accès caméra refusé ou non supporté : ' + e.message + ' — utilisez « Importer une Image ».';
    statusEl.style.color = '#c2412f';
  }
});

btnStop.addEventListener('click', () => { stopCamera(); resetStage(); });

function stopCamera() {
  running = false;
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  video.srcObject = null;
  btnStart.disabled = false; btnStop.disabled = true;
}

function resetStage() {
  mode = 'none'; currentImage = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlay.classList.remove('hidden');
  btnAudit.disabled = true;
  sourceBadge.textContent = 'Inactif';
  sourceBadge.style.background = ''; sourceBadge.style.color = '';
  statusEl.textContent = 'Source arrêtée.';
}

// Image importée
btnImage.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { statusEl.textContent = 'Fichier image invalide.'; return; }
  stopCamera();
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = async () => {
    currentImage = img; mode = 'image';
    video.style.display = 'none';
    overlay.classList.add('hidden');
    sourceBadge.textContent = '🖼 Image fixe';
    sourceBadge.style.background = '#ede4f4'; sourceBadge.style.color = '#6b5b8d';
    drawImage(img);
    statusEl.textContent = 'Image importée. Lancement du modèle…';
    await modelReady;
    if (model) { btnAudit.disabled = false; runAudit(); }
    URL.revokeObjectURL(url);
  };
  img.onerror = () => { statusEl.textContent = 'Erreur de lecture de l\'image.'; };
  img.src = url;
  fileInput.value = '';
});

function drawImage(img) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#2c2140';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
  const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
  const ox = (canvas.width - w) / 2, oy = (canvas.height - h) / 2;
  ctx.drawImage(img, ox, oy, w, h);
  return { sx: scale, sy: scale, ox, oy };
}

// Détection
async function detect(source) {
  if (!model) return [];
  const raw = await model.detect(source);
  return raw.filter(p => !FORBIDDEN_CLASSES.includes(p.class) && p.score >= threshold);
}

function drawBoxes(predictions, transform = { sx: 1, sy: 1, ox: 0, oy: 0 }) {
  ctx.lineWidth = 2; ctx.font = '13px sans-serif';
  predictions.forEach(p => {
    const x = p.bbox[0] * transform.sx + transform.ox;
    const y = p.bbox[1] * transform.sy + transform.oy;
    const w = p.bbox[2] * transform.sx;
    const h = p.bbox[3] * transform.sy;
    ctx.strokeStyle = '#4fd6c3';
    ctx.strokeRect(x, y, w, h);
    const text = `${p.class} ${(p.score * 100).toFixed(0)}%`;
    const tw = ctx.measureText(text).width + 8;
    ctx.fillStyle = '#26b09c';
    ctx.fillRect(x, Math.max(0, y - 20), tw, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + 4, Math.max(14, y - 5));
  });
}

async function loop() {
  if (!running || !model) { if (running) requestAnimationFrame(loop); return; }
  try {
    const preds = await detect(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoxes(preds, {
      sx: canvas.width / (video.videoWidth || canvas.width),
      sy: canvas.height / (video.videoHeight || canvas.height),
      ox: 0, oy: 0
    });
  } catch (_) {}
  requestAnimationFrame(loop);
}

// Audit
btnAudit.addEventListener('click', runAudit);

async function runAudit() {
  if (!model || mode === 'none') return;
  btnAudit.disabled = true;
  statusEl.textContent = 'Audit en cours… ✨';

  const t0 = performance.now();
  const maxCounts = {}; const scores = [];
  let lastPreds = [];
  const source = mode === 'image' ? currentImage : video;
  const frames = mode === 'image' ? 1 : AUDIT_FRAMES;

  for (let i = 0; i < frames; i++) {
    const preds = await detect(source);
    lastPreds = preds;
    const counts = {};
    preds.forEach(p => { counts[p.class] = (counts[p.class] || 0) + 1; scores.push(p.score); });
    Object.keys(counts).forEach(k => { maxCounts[k] = Math.max(maxCounts[k] || 0, counts[k]); });
  }

  const elapsed = performance.now() - t0;
  auditTimes.push(elapsed);
  if (mode === 'image') { const t = drawImage(currentImage); drawBoxes(lastPreds, t); }

  renderAudit(maxCounts, scores, elapsed, lastPreds.length);
  statusEl.textContent = `Audit terminé en ${(elapsed / 1000).toFixed(2)} s (${mode === 'image' ? 'mode image' : 'mode vidéo'}).`;
  btnAudit.disabled = false;
  btnExport.disabled = false;
}

function renderAudit(counts, scores, elapsed, totalDetected) {
  const body = document.getElementById('audit-body');
  body.innerHTML = '';
  let totalGaps = 0;
  let categoriesRecognized = 0;
  let verifiableRules = 0;
  const auditDetails = [];

  CATEGORIES.forEach(c => {
    const expected = getExpected(c.cls);
    const found = counts[c.cls] || 0;
    const diff = found - expected;
    const isRule = expected > 0;
    if (isRule) verifiableRules++;
    if (found > 0) categoriesRecognized++;
    const ok = diff === 0;
    if (isRule && !ok) totalGaps++;

    auditDetails.push({ label: c.label, expected, found, diff, ok, supported: true });
    body.insertAdjacentHTML('beforeend', `
      <tr>
        <td><strong>${c.label}</strong> <small style="color:#9d8fb8">(${c.cls})</small></td>
        <td>${expected}</td>
        <td>${found}</td>
        <td style="font-weight:800; color:${diff === 0 ? '#4a3b63' : diff > 0 ? '#7e57c2' : '#c2412f'}">${diff > 0 ? '+' : ''}${diff}</td>
        <td><span class="badge ${ok ? 'badge-ok' : 'badge-warn'}">${ok ? 'Conforme' : 'Écart détecté'}</span></td>
      </tr>`);
  });

  UNSUPPORTED_CATEGORIES.forEach(u => {
    auditDetails.push({ label: u.name, expected: '-', found: '-', diff: '-', ok: false, supported: false });
    body.insertAdjacentHTML('beforeend', `
      <tr class="unsupported">
        <td>${u.name}</td><td>–</td><td>–</td><td>–</td>
        <td><span class="badge badge-na" title="${u.desc}">Non supporté par COCO-SSD</span></td>
      </tr>`);
  });

  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  document.getElementById('kpi-total').textContent = totalDetected;
  document.getElementById('kpi-cats').textContent = categoriesRecognized;
  document.getElementById('kpi-rules').textContent = verifiableRules;
  document.getElementById('kpi-gaps').textContent = totalGaps;
  document.getElementById('kpi-rate').textContent = scores.length ? `${(avgScore * 100).toFixed(0)} %` : 'N/A';
  document.getElementById('kpi-time').textContent = `${(elapsed / 1000).toFixed(2)} s`;

  const statusKpi = document.getElementById('kpi-status');
  if (totalGaps === 0) {
    statusKpi.textContent = '✅ Conforme';
    statusKpi.className = 'badge badge-ok';
  } else {
    statusKpi.textContent = `⚠️ ${totalGaps} écart(s)`;
    statusKpi.className = 'badge badge-warn';
  }

  lastAuditReport = {
    date: new Date().toLocaleString('fr-FR'),
    mode,
    threshold: `${Math.round(threshold * 100)}%`,
    totalDetected,
    categoriesRecognized,
    verifiableRules,
    avgScore: `${(avgScore * 100).toFixed(1)}%`,
    executionTime: `${(elapsed / 1000).toFixed(2)}s`,
    totalGaps,
    details: auditDetails
  };
}

// Export rapport
btnExport.addEventListener('click', () => {
  if (!lastAuditReport) return;
  const r = lastAuditReport;
  let txt = `=================================================\n`;
  txt += `  EPITA SMART CLASSROOM - RAPPORT D'AUDIT VISUEL  \n`;
  txt += `=================================================\n`;
  txt += `Date de l'audit        : ${r.date}\n`;
  txt += `Source d'analyse       : ${r.mode.toUpperCase()}\n`;
  txt += `Seuil de confiance     : ${r.threshold}\n`;
  txt += `Objets détectés        : ${r.totalDetected}\n`;
  txt += `Catégories reconnues   : ${r.categoriesRecognized}\n`;
  txt += `Règles vérifiables     : ${r.verifiableRules}\n`;
  txt += `Confiance moyenne      : ${r.avgScore}\n`;
  txt += `Temps de traitement    : ${r.executionTime}\n`;
  txt += `Écarts constatés       : ${r.totalGaps}\n`;
  txt += `-------------------------------------------------\n\n`;
  txt += `DÉTAIL PAR ÉQUIPEMENT :\n`;
  r.details.forEach(d => {
    if (d.supported) {
      txt += `- ${d.label.padEnd(24)} | Attendu: ${String(d.expected).padEnd(2)} | Détecté: ${String(d.found).padEnd(2)} | Statut: ${d.ok ? 'CONFORME' : 'ÉCART'}\n`;
    } else {
      txt += `- ${d.label.padEnd(24)} | [NON SUPPORTÉ PAR LE MODÈLE IA - VÉRIFICATION MANUELLE REQUISE]\n`;
    }
  });
  txt += `\n-------------------------------------------------\n`;
  txt += `LIMITES DE L'ANALYSE :\n`;
  txt += `- Un objet non détecté n'est pas forcément absent (occlusion, cadrage, luminosité, seuil de confiance).\n`;
  txt += `- Le modèle COCO-SSD ne reconnaît ni les tableaux, ni les fenêtres, ni les vidéoprojecteurs.\n\n`;
  txt += `RECOMMANDATIONS DE CONTRÔLE COMPLÉMENTAIRE :\n`;
  txt += `- Vérifier manuellement le tableau, les fenêtres et le vidéoprojecteur.\n`;
  txt += `- Refaire l'audit sous un autre angle / avec un meilleur éclairage en cas d'écart.\n`;
  txt += `- Comparer avec plusieurs images de la même salle.\n\n`;
  txt += `-------------------------------------------------\n`;
  txt += `Avertissement Éthique : Conformément aux consignes, aucune personne n'a été analysée ni enregistrée.\n`;

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Audit_EPITA_Smart_Classroom_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});
