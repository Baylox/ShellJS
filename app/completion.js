const fs = require("fs");
const path = require("path");

let lastTabLine = null;
let tabPressCount = 0;

function createCompleter(builtins, pathSeparator, rl) {
  return function completer(line) {
    const completions = new Set();

    addBuiltinsToCompletions(completions, line, builtins);
    addExecutablesToCompletions(completions, line, pathSeparator);

    const matches = Array.from(completions);

    if (matches.length === 0) {
      process.stdout.write('\x07');
      tabPressCount = 0;
      lastTabLine = null;
      return [[], line];
    }

    if (matches.length === 1) {
      tabPressCount = 0;
      lastTabLine = null;
      return [[matches[0] + ' '], line];
    }

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
      rl.prompt();
      process.stdout.write(line);
      return [[], line];
    }

    return [[], line]; // Pour éviter les effets secondaires
  };
}

function addBuiltinsToCompletions(completions, line, builtins) {
  for (const builtin of builtins) {
    if (builtin.startsWith(line)) {
      completions.add(builtin);
    }
  }
}

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
