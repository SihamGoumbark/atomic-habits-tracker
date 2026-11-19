# Atomic Habits Tracker — Full-Stack Web App

Application web de suivi d'habitudes et de développement personnel inspirée du livre *Atomic Habits* de James Clear, construite avec **Laravel 11 (API Sanctum)** et **React (Vite + Tailwind CSS)**.

## Fonctionnalités principales
- **Système basé sur l'identité :** Création d'identités cibles et accumulation de « votes » à chaque action validée.
- **Les 4 Lois du changement de comportement :**
  - *Bonnes habitudes :* Signal (heure/lieu), Envie (identité), Réponse (Règle des 2 minutes), Récompense (séries / streaks).
  - *Mauvaises habitudes :* Inversion des 4 Lois (Invisible, Repoussant, Difficile, Insatisfaisant) persistée en base de données.
- **Tableau de bord analytique :** Taux de complétion du jour, meilleure série, heatmap de constance sur 30 jours, alerte *Never Miss Twice* et suivi hebdomadaire Humeur / Énergie.
- **Journal quotidien & Citations :** Bilan d'humeur/énergie et bibliothèque de citations motivantes.

## Stack Technique
- **Backend :** PHP 8.2+, Laravel 11, Laravel Sanctum, MySQL
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

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```