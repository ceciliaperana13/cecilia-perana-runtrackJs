function bisextile(annee) {
    return (annee % 4 === 0 && annee % 100 !== 0) || (annee % 400 === 0);
}

// Tests (affichage dans la console)
console.log(bisextile(2024)); // true
console.log(bisextile(2023)); // false
console.log(bisextile(1900)); // false
console.log(bisextile(2000)); // true