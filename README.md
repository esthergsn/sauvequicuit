# Sauve Qui Cuit !

Plateforme web anti-gaspillage alimentaire développée avec Node.js, Express, Prisma et SQLite.

## Sécurité & Fonctionnalités
- **Sécurité serveur** : Hachage des mots de passe via `bcrypt`, protection des en-têtes HTTP avec `helmet`, et validation stricte du mot de passe (14 caractères min, majuscule, minuscule, chiffre, caractère spécial).
- **Moteur anti-gaspi** : Tolérance aux saisies (singulier/pluriel).
- **Architecture** : Structure MVC et persistance de session utilisateur (`localStorage`).

## Installation & Lancement

1. Installer les dépendances :
   `npm install`

2. Copier les variables d'environnement :
   `cp .env.example .env`

3. Appliquer la base de données SQLite :
   `npx prisma db push`

4. Lancer le serveur de développement :
   `npm run dev`