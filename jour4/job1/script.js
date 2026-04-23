document.getElementById("button").addEventListener("click", () => {//appelle du button et event click
    fetch("/jour4/job1/expression.txt")//fetch
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors du chargement du fichier");
            }
            return response.text();
        })
        .then(data => {
            // Supprime l'ancien paragraphe s'il existe
            const oldP = document.querySelector("p");
            if (oldP) oldP.remove();

            const p = document.createElement("p");
            p.textContent = data;
            document.body.appendChild(p);
        })
        .catch(error => console.error(error));
});