//Lorsqu’un utilisateur effectue un code konami, la page devient stylisée, aux couleurs de la plateforme. Le code konami est une séquence de touches : haut, haut, bas, bas, gauche, droite, gauche, droite, B, A.
const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiIndex = 0;
const body = document.body;

document.addEventListener("keydown", function(event){
    if (event.key === konamiCode[konamiIndex]) {
        konamiIndex++;}
        if (konamiIndex === konamiCode.length) {
            body.style.backgroundColor = "#003cff";
            body.style.color = "#ffffff";
            konamiIndex = 0;
        }
    
});