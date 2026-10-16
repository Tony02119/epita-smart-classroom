// OWL-ViT (détection zero-shot) via Transformers.js — chargé à la demande.
// Expose window.OwlDetector = { load(onProgress), detect(canvas, labels, threshold) }

const LIB = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
const MODEL = 'Xenova/owlvit-base-patch32';

let detectorPromise = null;

function load(onProgress) {
  if (!detectorPromise) {
    detectorPromise = import(LIB)
      .then(({ pipeline, env }) => {
        env.allowLocalModels = false;
        return pipeline('zero-shot-object-detection', MODEL, { progress_callback: onProgress });
      })
      .catch(err => { detectorPromise = null; throw err; });
  }
  return detectorPromise;
}

async function detect(canvas, labels, threshold = 0.1) {
  const detector = await load();
  const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
  const url = URL.createObjectURL(blob);
  try {
    // Coordonnées retournées en pixels de l'image envoyée : { score, label, box:{xmin,ymin,xmax,ymax} }
    return await detector(url, labels, { threshold });
  } finally {
    URL.revokeObjectURL(url);
  }
}

window.OwlDetector = { load, detect };
