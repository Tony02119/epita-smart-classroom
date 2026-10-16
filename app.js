// EPITA Smart Classroom : audit visuel avec TensorFlow.js + COCO-SSD
// Aucune détection de personnes : la classe "person" est strictement ignorée.

const CATEGORIES = [
  { cls: 'chair',        label: 'Chaises',               expected: 20 },
  { cls: 'dining table', label: 'Tables / Bureaux',       expected: 10 },
  { cls: 'laptop',       label: 'Ordinateurs portables', expected: 5 },
  { cls: 'tv',           label: 'Écrans / Moniteurs',     expected: 1 }
];

const UNSUPPORTED_CATEGORIES = [
  { name: 'Tableau (Blanc / Noir)', desc: 'Hors vocabulaire COCO-SSD' },
  { name: 'Fenêtres',               desc: 'Hors vocabulaire COCO-SSD' }
];

const FORBIDDEN_CLASSES = ['person'];
const AUDIT_FRAMES = 5;

// Éléments DOM
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

let model = null;
let stream = null;
let running = false;
let mode = 'none'; // 'none' | 'camera' | 'image'
let currentImage = null;
let threshold = 0.5;
let lastAuditReport = null;
const auditTimes = [];

// ---------- Génération Dynamique du Formulaire de Config ----------
const form = document.getElementById('config-form');
CATEGORIES.forEach(c => {
  const row = document.createElement('div');
  row.className = 'cfg-row';
  row.innerHTML = `
    <label for="exp-${c.cls}" class="text-xs font-medium text-slate-700">
      ${c.label} <span class="text-slate-400 font-normal">(${c.cls})</span>
    </label>
    <input id="exp-${c.cls}" type="number" min="0" value="${c.expected}" class="text-xs" />
  `;
  form.appendChild(row);
});

const getExpected = cls => Math.max(0, parseInt(document.getElementById(`exp-${cls}`)?.value || 0, 10));

// Gestion du Seuil de Confiance
thresholdInput.addEventListener('input', () => {
  threshold = thresholdInput.value / 100;
  thresholdValue.textContent = `${thresholdInput.value} %`;
});

thresholdInput.addEventListener('change', () => {
  if (mode === 'image' && currentImage) runAudit();
});

// ---------- Chargement Modèle COCO-SSD ----------
const modelReady = cocoSsd.load().then(m => {
  model = m;
  statusEl.textContent = 'Modèle COCO-SSD chargé. Prêt pour l\'analyse.';
  statusEl.className = 'text-sm text-emerald-600 font-medium';
  if (mode !== 'none') btnAudit.disabled = false;
}).catch(e => {
  statusEl.textContent = 'Erreur lors du chargement du modèle : ' + e.message;
  statusEl.className = 'text-sm text-red-600 font-medium';
});

// ---------- Caméra ----------
btnStart.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream;
    video.style.display = 'block';
    await video.play();
    
    currentImage = null;
    mode = 'camera';
    running = true;
    overlay.classList.add('hidden');
    sourceBadge.textContent = 'Caméra Active';
    sourceBadge.className = 'text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded font-medium';

    btnStart.disabled = true;
    btnStop.disabled = false;
    btnAudit.disabled = !model;
    statusEl.textContent = 'Flux vidéo en direct actif.';
    loop();
  } catch (e) {
    statusEl.textContent = 'Accès à la caméra refusé ou non supporté : ' + e.message;
    statusEl.className = 'text-sm text-amber-600 font-medium';
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlay.classList.remove('hidden');
  btnAudit.disabled = true;
  sourceBadge.textContent = 'Inactif';
  sourceBadge.className = 'text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded';
  statusEl.textContent = 'Source arrêtée.';
}

// ---------- Image Importée ----------
btnImage.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    statusEl.textContent = 'Veuillez sélectionner un fichier image valide.';
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
    statusEl.textContent = 'Image importée avec succès. Lancement du modèle…';

    await modelReady;
    if (model) {
      btnAudit.disabled = false;
      runAudit();
    }
    URL.revokeObjectURL(url);
  };

  img.onerror = () => { statusEl.textContent = 'Erreur lors de la lecture de l\'image.'; };
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
  // Neutralisation explicite de la détection des personnes (RGPD)
  return raw.filter(p => !FORBIDDEN_CLASSES.includes(p.class) && p.score >= threshold);
}

function drawBoxes(predictions, transform = { sx: 1, sy: 1, ox: 0, oy: 0 }) {
  ctx.lineWidth = 2;
  ctx.font = '13px sans-serif';

  predictions.forEach(p => {
    const x = p.bbox[0] * transform.sx + transform.ox;
    const y = p.bbox[1] * transform.sy + transform.oy;
    const w = p.bbox[2] * transform.sx;
    const h = p.bbox[3] * transform.sy;

    ctx.strokeStyle = '#06b6d4';
    ctx.strokeRect(x, y, w, h);

    const text = `${p.class} ${(p.score * 100).toFixed(0)}%`;
    const tw = ctx.measureText(text).width + 8;

    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(x, Math.max(0, y - 20), tw, 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + 4, Math.max(14, y - 5));
  });
}

async function loop() {
  if (!running || !model) {
    if (running) requestAnimationFrame(loop);
    return;
  }
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

// ---------- Logique d'Audit & Calculs ----------
btnAudit.addEventListener('click', runAudit);

async function runAudit() {
  if (!model || mode === 'none') return;

  btnAudit.disabled = true;
  statusEl.textContent = 'Audit en cours d\'exécution…';

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
    preds.forEach(p => {
      counts[p.class] = (counts[p.class] || 0) + 1;
      scores.push(p.score);
    });

    Object.keys(counts).forEach(k => {
      maxCounts[k] = Math.max(maxCounts[k] || 0, counts[k]);
    });
  }

  const elapsed = performance.now() - t0;
  auditTimes.push(elapsed);

  if (mode === 'image') {
    const t = drawImage(currentImage);
    drawBoxes(lastPreds, t);
  }

  renderAudit(maxCounts, scores, elapsed, lastPreds.length);
  statusEl.textContent = `Audit terminé en ${(elapsed / 1000).toFixed(2)} s (${mode === 'image' ? 'mode image' : 'mode vidéo'}).`;
  btnAudit.disabled = false;
  btnExport.disabled = false;
}

function renderAudit(counts, scores, elapsed, totalDetected) {
  const body = document.getElementById('audit-body');
  body.innerHTML = '';

  let totalGaps = 0;
  const auditDetails = [];

  // 1. Équipements gérés
  CATEGORIES.forEach(c => {
    const expected = getExpected(c.cls);
    const found = counts[c.cls] || 0;
    const diff = found - expected;
    const ok = diff === 0;

    if (!ok) totalGaps++;

    auditDetails.push({ label: c.label, expected, found, diff, ok, supported: true });

    body.insertAdjacentHTML('beforeend', `
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-medium text-slate-800">${c.label} <span class="text-xs text-slate-400 font-normal">(${c.cls})</span></td>
        <td class="py-3 px-4 text-slate-600">${expected}</td>
        <td class="py-3 px-4 text-slate-600">${found}</td>
        <td class="py-3 px-4 font-semibold ${diff === 0 ? 'text-slate-600' : diff > 0 ? 'text-blue-600' : 'text-amber-600'}">
          ${diff > 0 ? '+' : ''}${diff}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${ok ? 'badge-ok' : 'badge-warn'}">
            ${ok ? 'Conforme' : 'Écart détecté'}
          </span>
        </td>
      </tr>
    `);
  });

  // 2. Équipements non supportés
  UNSUPPORTED_CATEGORIES.forEach(u => {
    auditDetails.push({ label: u.name, expected: '-', found: '-', diff: '-', ok: false, supported: false });
    body.insertAdjacentHTML('beforeend', `
      <tr class="bg-slate-50/50">
        <td class="py-3 px-4 text-slate-500 font-medium">${u.name}</td>
        <td class="py-3 px-4 text-slate-400">–</td>
        <td class="py-3 px-4 text-slate-400">–</td>
        <td class="py-3 px-4 text-slate-400">–</td>
        <td class="py-3 px-4">
          <span class="badge badge-na" title="${u.desc}">Non supporté par COCO-SSD</span>
        </td>
      </tr>
    `);
  });

  // Mise à jour du Tableau de Bord (KPIs)
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const avgTime = auditTimes.reduce((a, b) => a + b, 0) / auditTimes.length;

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

  // Stockage pour l'exportation
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
      reportTxt += `- ${d.label.padEnd(22, ' ')} | Attendu: ${String(d.expected).padEnd(2)} | Détecté: ${String(d.found).padEnd(2)} | Statut: ${d.ok ? 'CONFORME' : 'ÉCART'}\n`;
    } else {
      reportTxt += `- ${d.label.padEnd(22, ' ')} | [NON SUPPORTÉ PAR LE MODÈLE IA - VÉRIFICATION MANUELLE REQUISE]\n`;
    }
  });

  reportTxt += `\n-------------------------------------------------\n`;
  reportTxt += `Avertissement Éthique : Conformément aux consignes, aucune personne n'a été analysée ni enregistrée.\n`;

  const blob = new Blob([reportTxt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Audit_EPITA_Smart_Classroom_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});