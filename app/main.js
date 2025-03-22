const readline = require("readline");

// Création de l'interface readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Gérer la fermeture du REPL proprement
rl.question("$ ", (answer) => {
  console.log(`${answer}: command not found`);
  rl.close();
});

function prompt() {
    rl.question("$ ", (answer) => {
      console.log(`${answer}: command not found`);
      prompt(); // Recursively call the function to keep the loop going
    });
  }
  prompt();