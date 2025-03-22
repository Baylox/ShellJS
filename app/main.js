const readline = require("readline");

// Création de l'interface readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// Afficher le prompt initial
rl.prompt();

// Gestion de l'entrée utilisateur
rl.on("line", (command) => {
  if (command.trim() === "exit") {
      rl.close();
  } else {
      console.log(`${command}: command not found`);
      rl.prompt();
  }
});

// Gérer la fermeture du REPL proprement
rl.question("$ ", (answer) => {
  console.log(`${answer}: command not found`);
  rl.close();
});