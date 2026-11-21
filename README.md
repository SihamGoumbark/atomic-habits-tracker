
# Atomic Habits Tracker — Full-Stack Web App

Application web full-stack de suivi d'habitudes et de développement personnel inspirée du livre *Atomic Habits* de James Clear, construite avec **Laravel 13 (API REST / Sanctum)**, **React 18 (Vite + Tailwind CSS)** et conteneurisée avec **Docker**.

## Fonctionnalités principales
- **Système basé sur l'identité :** Création, édition et suivi d'identités cibles avec accumulation de « votes » à chaque action validée.
- **Les 4 Lois du changement de comportement :**
  - *Bonnes habitudes :* Signal (heure/lieu), Envie (identité), Réponse (Règle des 2 minutes), Récompense (séries / streaks), avec édition complète et validation rapide (`full` ou `2 min`).
  - *Mauvaises habitudes :* Inversion des 4 Lois (Invisible, Repoussant, Difficile, Insatisfaisant) persistée en base de données.
- **Tableau de bord analytique :** Taux de complétion du jour, meilleure série, heatmap d'assiduité sur 30 jours, alerte *Never Miss Twice* et suivi hebdomadaire Humeur / Énergie.
- **Journal quotidien & Citations multilingues :** Bilan quotidien (humeur, énergie, gratitude, réflexion, priorité du lendemain) et bibliothèque de citations traduisibles en **Français, Anglais et Espagnol**.
- **Expérience utilisateur & Performance :** Thème clair/sombre (*Dark Mode*), hydratage initial groupé (`/api/bootstrap`), mise en cache locale (`sessionStorage`) et mise à jour optimiste (*Optimistic UI*).

## Stack Technique
- **Backend :** PHP 8.3+, Laravel 13, Laravel Sanctum, Eloquent ORM, SQL (MySQL / MariaDB)
- **Frontend :** React 18, Vite, Tailwind CSS, Axios, Lucide React
- **DevOps & Conteneurisation :** Docker & Docker Compose

## Lancement rapide avec Docker (Recommandé)

Assurez-vous d'avoir **Docker Desktop** installé et démarré, puis exécutez à la racine du projet :

```bash
docker compose up --build

```

Une fois les conteneurs démarrés, l'application est accessible sur :

* **Frontend (React) :** `http://localhost:5173`
* **Backend API (Laravel) :** `http://localhost:8000`
* **Base de données (MariaDB) :** Port `3307`

## Installation locale manuelle (Sans Docker)

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configurer DB_DATABASE, DB_PORT, DB_USERNAME dans .env
php artisan migrate
php artisan serve

```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev

```

## Rapport & Conception

Retrouvez le rapport complet du projet (Analyse fonctionnelle, Architecture 3-Tiers, Diagrammes UML, Modélisation Merise MCD/MLD/MPD, Sécurité et Aperçu visuel) dans le document PDF :
**[Consulter le Rapport Complet (PDF)](docs/Rapport_Atomic_Habits_Tracker.pdf)**

*(Note : Si l'aperçu intégré de GitHub ne s'affiche pas directement, cliquez simplement sur le bouton **Download** (`⤓`) ou **View raw** en haut à droite de la page du fichier pour l'ouvrir.)*
