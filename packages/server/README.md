# Projet Backend avec TypeScript, Prisma et CodeGen

Initialisation du projet Backend du code Social Network GraphQL

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- Se déplacer dans le dossier 
```sh
cd .\packages\server\
```
- [Node.js](https://nodejs.org/) (version 16+ recommandée)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) ou une autre base de données supportée par Prisma

## Installation

1. **Cloner le dépôt**

   ```sh
   [git clone https://github.com/votre-repo/votre-projet-backend.git](https://github.com/lucastreille/social-network-graphql.git)
   ```

2. **Installer les dépendances**

   ```sh
   npm install
   ```

3. **Configurer la base de données**

   Renommez le fichier `.env.example` en `.env` et renseignez vos informations de connexion à la base de données.

4. **Appliquer la migration Prisma**

   ```sh
   npx prisma migrate dev --name init
   ```

5. **Générer les types Prisma**

   ```sh
   npm run codegen
   ```

## Démarrer le serveur en mode développement et accéder à la base de données

Pour lancer le projet en mode développement :

```sh
npm run dev
```

Le serveur démarrera généralement sur `http://localhost:3000/`.

Pour démarrer l'interface Prisma Studio et explorer la base de données :

```sh
npx prisma studio
```

Cela ouvrira une interface web permettant de visualiser et modifier les données facilement.

Pour lancer le projet en mode développement :

```sh
npm run dev
```

Le serveur démarrera généralement sur `http://localhost:3000/`.

## Génération automatique de code avec CodeGen - Normalement déjà fonctionnel

Si votre projet utilise **GraphQL CodeGen** et **Prisma**, assurez-vous que les configurations sont bien définies, puis exécutez :

```sh
npm run codegen
```

Cela générera automatiquement les types TypeScript basés sur Prisma et GraphQL.

