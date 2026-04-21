//De la même façon qu’une barre de chargement, la couleur du footer doit évoluer en fonction du pourcentage de scrolling

const footer = document.querySelector("footer");
window.addEventListener("scroll", function(){
    const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    footer.style.backgroundColor = `rgb(${scrollPercentage}, 0, 0)`;
});
