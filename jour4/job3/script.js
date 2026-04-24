document.getElementById("filtrerBtn").addEventListener("click", filtrer);

function filtrer() { //fonction, qui permet de filtrer "id","nom","type"
    const id = document.getElementById("id").value;
    const nom = document.getElementById("nom").value.toLowerCase();
    const type = document.getElementById("type").value;

    fetch("/jour4/job3/pokemon.json")// a pas oublier le chemin 
        .then(response => response.json())
        .then(data => {

            const resultats = data.filter(pokemon => {
                return (
                    (id === "" || pokemon.id == id) &&
                    (nom === "" || pokemon.name.french.toLowerCase().includes(nom)) &&
                    (type === "" || pokemon.type.includes(type))
                );
            });

            afficher(resultats);
        })
        .catch(error => console.error("Erreur :", error));
}

function afficher(data) {
    const container = document.getElementById("resultats");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p>Aucun résultat</p>";
        return;
    }

    data.forEach(pokemon => {
        const div = document.createElement("div");

        div.innerHTML = `
            <p><strong>ID:</strong> ${pokemon.id}</p>
            <p><strong>Nom:</strong> ${pokemon.name.french}</p>
            <p><strong>Type:</strong> ${pokemon.type.join(", ")}</p>
            <hr>
        `;

        container.appendChild(div);
    });
}