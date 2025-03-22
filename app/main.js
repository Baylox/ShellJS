const readline = require("readline");
const builtins = ["echo", "exit", "type"]; // Liste des builtins
const fs = require("fs"); 
const path = require("path"); // Module pour manipuler les chemins de fichiers
const pathSeparator = process.platform === "win32" ? ";" : ":";

// Création de l'interface readline
const rl = readline.createInterface({ 
  input: process.stdin,
  output: process.stdout,
  prompt: "$ "
});

rl.prompt(); // Affiche le premier prompt

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
  } else {
    handleUnknownCommand(input);
  }

  rl.prompt();
});

// Exit
function handleExit(params) {
  const exitCode = parseInt(params[0], 10) || 0;
  rl.close();
  process.exit(exitCode);
}

// Echo
function handleEcho(params) {
  console.log(params.join(" "));
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
  let found = false;

  for (const dir of pathDirs) {
    const fullPath = path.join(dir, target);

    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        fs.accessSync(fullPath, fs.constants.X_OK);
        console.log(`${target} is ${fullPath}`);
        found = true;
        break;
      }
    } catch (err) {
      // Si erreur on continue pour le moment
    }
  }

  if (!found) {
    console.log(`${target}: not found`);
  }
}

function handleUnknownCommand(input) {
  console.log(`${input}: command not found`);
}