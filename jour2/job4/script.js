// cree un keylogger qui affiche les touches

const textarea = document.getElementById("keylogger");

document.addEventListener("keydown", function(event) {
    // Vérifie si c'est une lettre entre a et z
    if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
        
        // Si le focus est dans le textarea
        if (document.activeElement === textarea) {
            textarea.value += event.key + event.key;
        } else {
            textarea.value += event.key;
        }
    }
});
