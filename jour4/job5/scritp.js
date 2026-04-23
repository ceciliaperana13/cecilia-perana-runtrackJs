document.getElementById("get-quote").addEventListener("click", getQuote);

function getQuote() {
    fetch("https://zenquotes.io/api/random")
        .then(response => response.json())
        .then(data => {
            const quote = data[0].q;
            const author = data[0].a;

            document.getElementById("quote").textContent = quote;
            document.getElementById("author").textContent = "- " + author;
        })
        .catch(error => {
            document.getElementById("quote").textContent = "Erreur lors du chargement de la citation.";
            document.getElementById("author").textContent = "";
            console.error(error);
        });
}
