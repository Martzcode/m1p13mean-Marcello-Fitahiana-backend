# MEAN Stack Backend (Express + MongoDB)

Ce projet est une base de backend construite avec Node.js, Express et MongoDB, structurée pour être consommée par un frontend Angular.

## Structure du Projet

- `src/server.js` : Point d'entrée de l'application.
- `src/app.js` : Configuration d'Express (middlewares, routes).
- `src/config/` : Configuration de la base de données.
- `src/routes/` : Définition des points de terminaison de l'API.
- `src/controllers/` : Logique métier pour chaque route.
- `src/models/` : Schémas Mongoose pour MongoDB.
- `src/middlewares/` : Middlewares personnalisés (gestion d'erreurs, etc.).

## Prérequis

- Node.js (v14+)
- MongoDB (local ou Atlas)

## Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Configurer les variables d'environnement dans le fichier `.env` :
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/votre_db
   NODE_ENV=development
   ```

## Lancer l'application

### Mode développement (avec auto-reload)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## API Endpoints (Exemple)

- `GET /api/v1/tasks` : Récupérer toutes les tâches.
- `POST /api/v1/tasks` : Créer une nouvelle tâche.
- `GET /api/v1/tasks/:id` : Récupérer une tâche spécifique.
