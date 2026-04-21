const konamiCode = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a"
];

let input = [];

document.addEventListener("keydown", (e) => {
  input.push(e.key);

  // Garder la longueur du tableau égale au code
  if (input.length > konamiCode.length) {
    input.shift();
  }

  // Vérifier si le code est correct
  if (JSON.stringify(input) === JSON.stringify(konamiCode)) {
    activateKonami();
  }
});

function activateKonami() {
  document.body.classList.add("konami");
}