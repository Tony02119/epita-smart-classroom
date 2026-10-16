# EPITA Smart Classroom

## 1. Description du projet
EPITA Smart Classroom est une application web d'audit visuel automatisé conçue pour aider l'EPITA à vérifier rapidement la configuration de ses salles de cours[cite: 1, 2]. L'application analyse un flux vidéo en direct (webcam) ou une image fixe, détecte le mobilier et les équipements, puis compare les résultats à une configuration théorique modifiable.

## 2. Technologies utilisées
* **Frontend :** HTML5, Tailwind CSS, JavaScript (Vanilla)[cite: 4].
* **Modèle de vision :** TensorFlow.js avec le modèle pré-entraîné **COCO-SSD** (exécuté 100% dans le navigateur client).
* **Hébergement & Déploiement :** GitHub (versioning) & Cloudflare Pages (URL publique)[cite: 2, 4].

## 3. URL Publique de Démonstration
* **Cloudflare Pages :** [https://epita-smart-classroom.pages.dev](https://epita-smart-classroom.pages.dev) *(remplacer par votre URL exacte)*[cite: 2, 4]

## 4. Instructions de lancement local
1. Clonez le dépôt :
   ```bash
   git clone [https://github.com/votre-compte/epita-smart-classroom.git](https://github.com/votre-compte/epita-smart-classroom.git)
