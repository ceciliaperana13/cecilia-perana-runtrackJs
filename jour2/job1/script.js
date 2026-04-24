function citation() {
    const contenu = document.getElementById("citation").textContent;
    console.log(contenu);
}

const btn = document.getElementById("button");
btn.addEventListener("click", citation);