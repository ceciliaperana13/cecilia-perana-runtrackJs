// bouton chaque clique le compteur augmente de 1 
let compteur =0;

function incrementer() {
    compteur++;
    const compteurElement = document.getElementById("compteur");
    compteurElement.textContent = compteur;
}

const btn =document.getElementById("button");
btn.addEventListener("click", incrementer);
