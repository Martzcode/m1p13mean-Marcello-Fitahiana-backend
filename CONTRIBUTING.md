# Guide de Développement et Collaboration

Ce document définit les standards et les conventions pour harmoniser le travail entre les développeurs du projet.

## 🌿 Stratégie Git (Branching)

Nous utilisons une approche simplifiée basée sur des branches de fonctionnalités.

### Naming des branches
Toutes les branches doivent être nommées en minuscule avec des tirets (`-`) comme séparateurs.

- **Fonctionnalités** : `feat/nom-de-la-feature` (ex: `feat/auth-jwt`)
- **Corrections de bugs** : `fix/description-du-bug` (ex: `fix/db-connection-error`)
- **Documentation** : `docs/sujet-doc` (ex: `docs/update-api-endpoints`)
- **Refactorisation** : `refactor/nom-du-module` (ex: `refactor/task-controller`)

### Workflow
1. Toujours créer une branche à partir de `main`.
2. Faire des commits réguliers avec des messages clairs.
3. Une fois terminé, créer une **Pull Request (PR)** vers `main`.
4. La PR doit être revue (code review) par l'autre collaborateur avant d'être mergée.

---

## 📝 Conventions de Nommage

### Code (JavaScript)
- **Variables & Fonctions** : `camelCase` (ex: `getTasks`, `isLoggedIn`).
- **Modèles (Mongoose)** : `PascalCase` au singulier (ex: `Task`, `User`).
- **Constantes / Env** : `UPPER_SNAKE_CASE` (ex: `MAX_LIMIT`, `MONGODB_URI`).

### Fichiers
- **Controllers** : `xxxController.js` (ex: `taskController.js`).
- **Routes** : `xxxRoutes.js` (ex: `taskRoutes.js`).
- **Models** : `NomDuModel.js` (ex: `Task.js`).
- **Middlewares** : `xxxMiddleware.js` (ex: `authMiddleware.js`).

---

## 📂 Organisation du Projet

Le backend est structuré pour séparer les responsabilités :

- **`src/config/`** : Paramètres techniques (DB, Cloud, etc.).
- **`src/models/`** : Uniquement la définition des schémas de données.
- **`src/controllers/`** : C'est ici que réside la "logique" (traitement des requêtes, calculs).
- **`src/routes/`** : Mappage des URLs vers les fonctions des contrôleurs.
- **`src/services/`** : (Optionnel) Pour externaliser les appels API tiers ou les calculs complexes réutilisables.
- **`src/middlewares/`** : Fonctions s'exécutant entre la requête et le contrôleur (ex: vérifier un token).

---

## 💬 Messages de Commit

Nous suivons la convention **Conventional Commits** :

- `feat: ...` : Ajout d'une nouvelle fonctionnalité.
- `fix: ...` : Correction d'un bug.
- `docs: ...` : Changement dans la documentation.
- `style: ...` : Changements esthétiques (espaces, virgules) sans impact sur le code.
- `refactor: ...` : Modification du code qui ne répare ni ne rajoute de fonction.

---

## 🚀 Bonnes Pratiques

- **Async/Await** : Utiliser systématiquement `try/catch` dans les contrôleurs ou un wrapper asynchrone.
- **Statuts HTTP** : Toujours retourner le code d'état approprié (200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Error).
- **Pas de données sensibles** : Ne jamais pousser le fichier `.env` sur Git (il est déjà dans `.gitignore`).
