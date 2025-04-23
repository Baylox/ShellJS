# ShellJS

Un shell UNIX minimal codé en JavaScript pur, sans bibliothèque externe.

Ce projet implémente les fondations d’un interpréteur de commandes à la main, et permet de mieux comprendre la logique derrière les shells classiques (bash, zsh...).

Il repose sur les API natives de Node.js (`fs`, `process`, `child_process`, etc.), et se concentre sur l'apprentissage de la gestion des entrées utilisateur, des redirections, et de l'environnement système.



## Fonctionnalités

- Interprétation de commandes :
  - `echo`, `exit`, `type`, `cd`, etc.
- Support de `cd` avec :
  - chemins relatifs (`../`, `./`)
  - absolus (`/home/user`)
  - raccourci `~` pour le home
- Redirections :
  - `>` : redirection de la sortie dans un fichier
  - `<` : lecture d’un fichier en entrée
- Exécution de commandes externes (`ls`, `cat`, etc.)
- Gestion de l'environnement (`PATH`, variables, etc.)
- Système d’autocomplétion intelligent (commande + fichiers)
- Gestion de l’historique
- Message de prompt personnalisé



## Lancement

Placez-vous dans le dossier app :
```bash
cd app
```
Puis lancez le fichier principal :
```bash
node main.js
```
