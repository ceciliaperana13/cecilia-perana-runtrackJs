document.getElementById("updateBtn").addEventListener("click", loadUsers);

function loadUsers() {
    fetch("/jour4/job4/utilisateur.json")
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#userTable tbody");

            data.forEach(user => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nom}</td>
                    <td>${user.prenom}</td>
                    <td>${user.email}</td>
                `;

                tbody.appendChild(tr); // ajout fonctionne pas totalement 
            });
        })
        .catch(error => {
            console.error("Erreur :", error);
            alert("Problème de chargement du JSON");
        });
}