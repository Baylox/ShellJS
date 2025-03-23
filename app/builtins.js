const fs = require("fs");
const path = require("path");

// Ajoute les commandes builtins qui commencent par le préfixe.
function handlePwd(params, rl) {
  console.log(process.cwd());
  rl.prompt();
}

// Gère la commande exit.
function handleExit(params) {
  const exitCode = parseInt(params[0], 10) || 0;
  process.exit(exitCode);
}

// Gère la commande echo.
function handleEcho(params, rl) {
  console.log(params.join(" "));
  rl.prompt();
}

// Affiche si la commande est un builtin ou un exécutable.
function handleType(params, rl, builtins, pathSeparator) {
  const target = params[0];
  if (!target) {
    console.log(`undefined: not found`);
  } else if (builtins.includes(target)) {
    console.log(`${target} is a shell builtin`);
  } else {
    const found = findExecutable(target, pathSeparator);
    if (!found) console.log(`${target}: not found`);
  }
  rl.prompt();
}

// Trouve un exécutable dans le PATH.
function findExecutable(target, pathSeparator) {
  const pathDirs = process.env.PATH ? process.env.PATH.split(pathSeparator) : [];
  for (const dir of pathDirs) {
    const fullPath = path.join(dir, target);
    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        fs.accessSync(fullPath, fs.constants.X_OK);
        console.log(`${target} is ${fullPath}`);
        return true;
      }
    } catch (err) {}
  }
  return false;
}
// Ajoute les commandes builtins qui commencent par le préfixe.
function handleCd(params, rl) {
  const targetPath = params[0];

  if (!targetPath) {
    rl.prompt();
    return;
  }

  // On résout le chemin absolu (même pour un chemin relatif)
  const resolvedPath = path.resolve(process.cwd(), targetPath);

  try {
    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) throw new Error();

    process.chdir(resolvedPath);
  } catch {
    console.log(`cd: ${targetPath}: No such file or directory`);
  }

  rl.prompt();
}

module.exports = {
  handlePwd,
  handleExit,
  handleEcho,
  handleType,
  handleCd
};
