// EPITA Smart Classroom : audit visuel avec TensorFlow.js + COCO-SSD
// Aucune détection de personnes : la classe "person" est toujours ignorée.

const CATEGORIES = [
  { cls: 'chair',        label: 'Chaises',                 expected: 10 },
  { cls: 'dining table', label: 'Tables',                  expected: 5  },
  { cls: 'laptop',       label: 'Ordinateurs portables',   expected: 2  },
  { cls: 'tv',           label: 'Écrans / TV',             expected: 1  },
  { cls: 'bed',          label: 'Lits',                    expected: 0  },
];
const UNSUPPORTED = ['Tableau', 'Fenêtres'];
const FORBIDDEN_CLASSES = ['person'];
const AUDIT_FRAMES = 5;

const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const statusEl = document.getElementById('status');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnAudit = document.getElementById('btn-audit');
const thresholdInput = document.getElementById('threshold');
const thresholdValue = document.getElementById('threshold-value');

let model = null;
let stream = null;
let running = false;
let threshold = 0.5;
const auditTimes = [];

// ---------- Configuration ----------
const form = document.getElementById('config-form');
CATEGORIES.forEach(c => {
  const row = document.createElement('div');
  row.className = 'cfg-row';
  row.innerHTML = `<label for="exp-${c.cls}" class="text-sm">${c.label} <span class="text-slate-400">(${c.cls})</span></label>
    <input id="exp-${c.cls}" type="number" min="0" value="${c.expected}" />`;
  form.appendChild(row);
});
const getExpected = cls => Math.max(0, parseInt(document.getElementById(`exp-${cls}`).value, 10) || 0);

thresholdInput.addEventListener('input', () => {
  threshold = thresholdInput.value / 100;
  thresholdValue.textContent = thresholdInput.value;
});

// ---------- Modèle ----------
(async () => {
  try {
    model = await cocoSsd.load();
    statusEl.textContent = 'Modèle prêt. Démarrez la caméra.';
  } catch (e) {
    statusEl.textContent = 'Erreur de chargement du modèle : ' + e.message;
  }
})();

// ---------- Caméra ----------
btnStart.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    overlay.classList.add('hidden');
    btnStart.disabled = true;
    btnStop.disabled = false;
    btnAudit.disabled = !model;
    running = true;
    statusEl.textContent = 'Caméra active.';
    loop();
  } catch (e) {
    statusEl.textContent = 'Accès caméra refusé ou indisponible : ' + e.message;
  }
});

btnStop.addEventListener('click', stopCamera);
function stopCamera() {
  running = false;
  if (stream) stream.getTracks().forEach(t => t.stop());
  video.srcObject = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlay.classList.remove('hidden');
  btnStart.disabled = false;
  btnStop.disabled = true;
  btnAudit.disabled = true;
  statusEl.textContent = 'Caméra arrêtée.';
}

// ---------- Détection ----------
async function detect() {
  const raw = await model.detect(video);
  return raw.filter(p => !FORBIDDEN_CLASSES.includes(p.class) && p.score >= threshold);
}

function draw(predictions) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // le canvas est en 640x480 ; la vidéo peut avoir une autre résolution native
  const sx = canvas.width / (video.videoWidth || canvas.width);
  const sy = canvas.height / (video.videoHeight || canvas.height);
  ctx.lineWidth = 2;
  ctx.font = '14px system-ui, sans-serif';
  predictions.forEach(p => {
    const [x, y, w, h] = [p.bbox[0] * sx, p.bbox[1] * sy, p.bbox[2] * sx, p.bbox[3] * sy];
    ctx.strokeStyle = '#22d3ee';
    ctx.strokeRect(x, y, w, h);
    const text = `${p.class} ${(p.score * 100).toFixed(0)}%`;
    const tw = ctx.measureText(text).width + 8;
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(x, Math.max(0, y - 20), tw, 20);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(text, x + 4, Math.max(14, y - 5));
  });
}

async function loop() {
  if (!running || !model) return;
  try { draw(await detect()); } catch (_) {}
  requestAnimationFrame(loop);
}

// ---------- Audit ----------
btnAudit.addEventListener('click', runAudit);
async function runAudit() {
  btnAudit.disabled = true;
  statusEl.textContent = 'Audit en cours…';
  const t0 = performance.now();
  const maxCounts = {};
  const scores = [];
  for (let i = 0; i < AUDIT_FRAMES; i++) {
    const preds = await detect();
    const counts = {};
    preds.forEach(p => { counts[p.class] = (counts[p.class] || 0) + 1; scores.push(p.score); });
    // on garde le max par classe sur plusieurs images pour limiter le bruit
    Object.keys(counts).forEach(k => { maxCounts[k] = Math.max(maxCounts[k] || 0, counts[k]); });
  }
  const elapsed = performance.now() - t0;
  auditTimes.push(elapsed);
  renderAudit(maxCounts, scores);
  statusEl.textContent = `Audit terminé en ${(elapsed / 1000).toFixed(2)} s.`;
  btnAudit.disabled = !running;
}

function renderAudit(counts, scores) {
  const body = document.getElementById('audit-body');
  body.innerHTML = '';
  let gaps = 0;
  CATEGORIES.forEach(c => {
    const expected = getExpected(c.cls);
    const found = counts[c.cls] || 0;
    const diff = found - expected;
    const ok = diff === 0;
    if (!ok) gaps++;
    body.insertAdjacentHTML('beforeend', `<tr>
      <td>${c.label}</td><td>${expected}</td><td>${found}</td>
      <td>${diff > 0 ? '+' : ''}${diff}</td>
      <td><span class="badge ${ok ? 'badge-ok' : 'badge-warn'}">${ok ? 'Conforme' : 'Écart détecté'}</span></td></tr>`);
  });
  UNSUPPORTED.forEach(name => {
    body.insertAdjacentHTML('beforeend', `<tr>
      <td>${name}</td><td>–</td><td>–</td><td>–</td>
      <td><span class="badge badge-na">Non supporté par COCO-SSD</span></td></tr>`);
  });

  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const avgTime = auditTimes.reduce((a, b) => a + b, 0) / auditTimes.length;
  document.getElementById('kpi-rate').textContent =
    `${(avgScore * 100).toFixed(0)} % (seuil ${Math.round(threshold * 100)} %)`;
  document.getElementById('kpi-time').textContent = `${(avgTime / 1000).toFixed(2)} s`;
  document.getElementById('kpi-gaps').textContent = `${gaps} / ${CATEGORIES.length}`;
}
