document.getElementById("get-quote").addEventListener("click", getQuote);

function getQuote() {
    const url = "https://zenquotes.io/api/random";
    const proxy = "https://corsproxy.io/?";

    fetch(proxy + encodeURIComponent(url))
        .then(response => response.json())
        .then(data => {
            const quote = data[0].q;
            const author = data[0].a;

            document.getElementById("quote").textContent = quote;
            document.getElementById("author").textContent = "- " + author;
        })
        .catch(error => {
            document.getElementById("quote").textContent = "Erreur lors du chargement.";
            document.getElementById("author").textContent = "";
            console.error("Erreur API :", error);
        });
}
