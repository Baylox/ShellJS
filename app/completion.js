const fs = require("fs");
const path = require("path");

let lastTabLine = null;
let tabPressCount = 0;


function getLongestCommonPrefix(strings) {
  if (!strings.length) return '';
  let prefix = strings[0];

  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return '';
    }
  }

  return prefix;
}

// Crée la fonction de complétion utilisée par readline.
function createCompleter(builtins, pathSeparator, rl) {
  return function completer(line) {
  const completions = buildCompletions.call(this, line, builtins, pathSeparator);

  const matches = Array.from(completions).sort(); // A faire avant le LCP (Longest Prefix Auto-completion)
  const longestCommonPrefix = getLongestCommonPrefix(matches);

  if (longestCommonPrefix.length > line.length) {
    return completeWithLongestCommonPrefix.call(this, longestCommonPrefix, line, matches);
  }

  if (matches.length === 0) {
    return handleNoMatch.call(this, line);
  }

  if (matches.length === 1) {
    return completeUniqueMatch.call(this, matches[0], line);
  }

  return handleMultipleMatches.call(this, matches, line);
};

function buildCompletions(line, builtins, pathSeparator) {
  const completions = new Set();
  addBuiltinsToCompletions(completions, line, builtins);
  addExecutablesToCompletions(completions, line, pathSeparator);
  return completions;
}

function completeWithLongestCommonPrefix(longestCommonPrefix, line, matches) {
  tabPressCount = 0;
  lastTabLine = null;
  const filteredMatches = matches.filter(m => m.startsWith(longestCommonPrefix));

  if (filteredMatches.length === 1 && filteredMatches[0] === longestCommonPrefix) {
    return [[longestCommonPrefix + ' '], line];
  }
  
  return [[longestCommonPrefix], line];
}

function handleNoMatch(line) {
  process.stdout.write('\x07');
  tabPressCount = 0;
  lastTabLine = null;
  return [[], line];
}

function completeUniqueMatch(match, line) {
  tabPressCount = 0;
  lastTabLine = null;
  return [[match + ' '], line];
}

function handleMultipleMatches(matches, line) {
  if (line === lastTabLine) {
    tabPressCount++;
  } else {
    tabPressCount = 1;
    lastTabLine = line;
  }

  if (tabPressCount === 1) {
    process.stdout.write('\x07');
    return [[], line];
  }

  if (tabPressCount === 2) {
    console.log('\n' + matches.join('  '));
    rl.prompt(); // On affiche le prompt
    return [[], line];
  }

  return [[], line];
}
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
