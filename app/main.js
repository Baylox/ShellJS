const readline = require("readline");

// Création de l'interface readline
const rl = readline.createInterface({ 
  input: process.stdin,
  output: process.stdout,
  prompt: "$ "
});

rl.prompt(); // Affiche le premier prompt

rl.on("line", (input) => {
  const args = input.trim().split(" "); // Sépare la commande et les arguments
  const command = args[0]; // Récupère le premier mot (la commande)
  const params = args.slice(1).join(" "); // Récupère tout ce qui suit


  if (command === "exit") {
    const exitCode = params ? parseInt(params, 10) : 0; // Si un code est donné, l'utiliser ; sinon 0
    rl.close();
    process.exit(exitCode); // Quitte avec le code donné
  } else if (command === "echo") {
    console.log(params);
  } else {
    console.log(`${input}: command not found`);
  }

  rl.prompt(); // Affiche à nouveau le prompt
});