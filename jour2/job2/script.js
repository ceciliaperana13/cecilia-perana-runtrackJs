//faire un bouton qui fais appaitre et disparaitre la cication “showhide()”.
function showHide() {
    const citation = document.getElementById("citation");
    if (citation.style.display === "none") {
        citation.style.display = "block";
    } else {
        citation.style.display = "none";
    }
}

const btn = document.getElementById("button");
btn.addEventListener("click", showHide);
