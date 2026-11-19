
# Atomic Habits Tracker — Full-Stack Web App

Application web full-stack de suivi d'habitudes et de développement personnel inspirée du livre *Atomic Habits* de James Clear, construite avec **Laravel 11 (API REST / Sanctum)** et **React 18 (Vite + Tailwind CSS)**.

## Fonctionnalités principales
- **Système basé sur l'identité :** Création, édition et suivi d'identités cibles avec accumulation de « votes » à chaque action validée.
- **Les 4 Lois du changement de comportement :**
  - *Bonnes habitudes :* Signal (heure/lieu), Envie (identité), Réponse (Règle des 2 minutes), Récompense (séries / streaks), avec édition complète et validation rapide (`full` ou `2 min`).
  - *Mauvaises habitudes :* Inversion des 4 Lois (Invisible, Repoussant, Difficile, Insatisfaisant) persistée en base de données.
- **Tableau de bord analytique :** Taux de complétion du jour, meilleure série, heatmap d'assiduité sur 30 jours, alerte *Never Miss Twice* et suivi hebdomadaire Humeur / Énergie.
- **Journal quotidien & Citations multilingues :** Bilan quotidien (humeur, énergie, gratitude, réflexion, priorité du lendemain) et bibliothèque de citations traduisibles en **Français, Anglais et Espagnol**.
- **Expérience utilisateur & Performance :** Thème clair/sombre (*Dark Mode*), hydratage initial groupé (`/api/bootstrap`), mise en cache locale (`sessionStorage`) et mise à jour optimiste (*Optimistic UI*).

## Stack Technique
- **Backend :** PHP 8.2+, Laravel 11, Laravel Sanctum, Eloquent ORM, MySQL
- **Frontend :** React 18, Vite, Tailwind CSS, Axios, Lucide React

## Installation locale

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


