const fs = require("fs");
const path = require("path");

let lastTabLine = null;
let tabPressCount = 0;

// Crée la fonction de complétion utilisée par readline.
function createCompleter(builtins, pathSeparator, rl) {
  return function completer(line) {
    const completions = new Set();

    // Ajoute les commandes internes (builtins) possibles
    addBuiltinsToCompletions(completions, line, builtins);
    // Ajoute les exécutables présents dans le PATH
    addExecutablesToCompletions(completions, line, pathSeparator);

    const matches = Array.from(completions).sort(); // Par ordre alphabétique

    // Aucun match → cloche
    if (matches.length === 0) {
      process.stdout.write('\x07');
      tabPressCount = 0;
      lastTabLine = null;
      return [[], line];
    }

    // Un seul match → autocomplétion directe + espace
    if (matches.length === 1) {
      tabPressCount = 0;
      lastTabLine = null;
      return [[matches[0] + ' '], line];
    }

    // Plusieurs matches → affichage des possibilités
    if (line === lastTabLine) {
      tabPressCount++;
    } else {
      tabPressCount = 1;
      lastTabLine = line;
    }

    // Premier <TAB> → cloche
    if (tabPressCount === 1) {
      process.stdout.write('\x07');
      return [[], line];
    }

    // Deuxième <TAB> → afficher tous les résultats
    if (tabPressCount === 2) {
      console.log('\n' + matches.join('  ')); // 2 espaces entre les suggestions
      rl.prompt();
      process.stdout.write(line); // Réécrit la ligne tapée
      return [[], line];
    }

    return [[], line]; // Pour éviter les effets secondaires
  };
}
// Ajoute les commandes builtins qui commencent par le préfixe.
function addBuiltinsToCompletions(completions, line, builtins) {
  for (const builtin of builtins) {
    if (builtin.startsWith(line)) {
      completions.add(builtin);
    }
  }
}

// Parcourt les répertoires du PATH pour ajouter les exécutables.
function addExecutablesToCompletions(completions, line, pathSeparator) {
  const pathDirs = process.env.PATH ? process.env.PATH.split(pathSeparator) : [];

  for (const dir of pathDirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (isExecutableFile(file, fullPath, line)) {
          completions.add(file);
        }
      }
    } catch (e) {
      // Ignorer les erreurs de lecture
    }
  }
}
// Vérifie si un fichier correspond au préfixe donné et est exécutable.
function isExecutableFile(file, fullPath, line) {
  return (
    file.startsWith(line) &&
    fs.statSync(fullPath).isFile() &&
    fs.accessSync(fullPath, fs.constants.X_OK) === undefined
  );
}

module.exports = {
  createCompleter
};
