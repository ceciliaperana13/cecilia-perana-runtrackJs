function compterVoyelles(phrase) {
    let compteur = 0;
    const voyelles = "aeiouyAEIOUY";

    for (let i = 0; i < phrase.length; i++) {
        if (voyelles.includes(phrase[i])) {
            compteur++;
        }
    }

    console.log(`La phrase contient ${compteur} voyelles`);
}

// Exemple
compterVoyelles("Bonjour tout le monde");