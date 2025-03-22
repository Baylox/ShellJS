const readline = require("readline");
const { createCompleter } = require("./completion"); // 👈

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const builtins = ["echo", "exit", "type"];
const pathSeparator = process.platform === "win32" ? ";" : ":";

// On crée une variable rl pour pouvoir l'utiliser dans la fonction par la suite
// On ne peut pas utiliser rl.prompt() dans la fonction createCompleter car rl n'est pas encore défini
let rl;

// On crée le completer AVANT d'initialiser rl
const completer = (line) => createCompleter(builtins, pathSeparator, rl)(line);

// Création de l'interface readline
rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
  completer: completer
});

function resolveExecutable(command) {
  const pathDirs = process.env.PATH ? process.env.PATH.split(pathSeparator) : [];

  for (const dir of pathDirs) {
    const fullPath = path.join(dir, command);
    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        fs.accessSync(fullPath, fs.constants.X_OK);
        return fullPath;
      }
    } catch (err) {
      // on continue sur les autres chemins
    }
  }

  return null; // Rien trouvé
}

function executeExternalCommand(command, args) {
  const fullPath = resolveExecutable(command); // On récupère le chemin de l'exécutable et on le stocke dans fullPath, resolveExecutable gère la recherche de l'exécutable dans le PATH
  
  if (!fullPath) {
    console.log(`${command}: command not found`);
    rl.prompt(); // On affiche le prompt maintenant
    return;
  }

  const child = spawn(command, args, { stdio: "inherit" }); // On exécute la commande

  child.on("exit", () => {
    rl.prompt(); // on re-prompt seulement quand l'exécutable a fini de s'exécuter
  });

  child.on("error", () => {
    console.log(`${command}: command not found`);
    rl.prompt(); // même en cas d’erreur, on affiche le prompt
  });
}


// Événement déclenché à chaque ligne entrée par l'utilisateur
rl.on("line", (input) => {
  const args = input.trim().split(" ");
  const command = args[0];
  const params = args.slice(1);

  // On redirige vers la bonne fonction en fonction de la commande
  if (command === "exit") {
    handleExit(params);
  } else if (command === "echo") {
    handleEcho(params);
  } else if (command === "type") {
    handleType(params);
    rl.prompt(); 
  } else {
    executeExternalCommand(command, params);  // Exécuter un programme externe, on passe rl pour pouvoir afficher le prompt après
  }
});

rl.prompt(); // Affiche le premier prompt

// Exit
function handleExit(params) {
  const exitCode = parseInt(params[0], 10) || 0;
  rl.close();
  process.exit(exitCode);
}

// Echo
function handleEcho(params) {
  console.log(params.join(" "));
  rl.prompt(); // On affiche le prompt après l'exécution de la commande
}

// Type
function handleType(params) {
  const target = params[0];

  if (!target) {
    console.log(`undefined: not found`);
  } else if (builtins.includes(target)) {
    console.log(`${target} is a shell builtin`);
  } else {
    findExecutable(target);
  }
}

// Fonction pour trouver un exécutable dans le PATH
function findExecutable(target) {
  const pathDirs = process.env.PATH ? process.env.PATH.split(pathSeparator) : []; // On récupère les dossiers du PATH et on les gère en fonction de l'OS

  for (const dir of pathDirs) {
    const fullPath = path.join(dir, target);

    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        fs.accessSync(fullPath, fs.constants.X_OK);
        console.log(`${target} is ${fullPath}`);
        return true
      }
    } catch (err) {
      // On ignore l'erreur, on teste les autres chemins
    }
  }
  console.log(`${target}: not found`);
  return false;
}











