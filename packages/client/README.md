# Projet Frontend avec Vite et CodeGen

Initialisation du projet fontend Social Network GraphQL

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- Se déplacer dans le dossier 
```sh
cd .\packages\client\
```
- [Node.js](https://nodejs.org/) (version 16+ recommandée)
- [npm](https://www.npmjs.com/)

## Installation

1. **Cloner le dépôt**

   ```sh
   git clone https://github.com/votre-repo/votre-projet.git
   cd votre-projet
   ```

2. **Installer les dépendances**

   ```sh
   npm install
   ```

## Démarrer le projet en mode développement

Pour lancer le projet en mode développement :

```sh
npm run dev
```

Vite démarrera un serveur local généralement sur `http://localhost:5173/`.

## Génération automatique de code avec CodeGen - Normalement déjà fonctionnel

Si votre projet utilise **GraphQL CodeGen**, assurez-vous que la configuration est bien définie dans `codegen.yml`, puis exécutez :

```sh
npm run codegen
```

Cela générera automatiquement les types TypeScript basés sur GraphQL.

