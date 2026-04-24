function jourTravaille(date) {
    const joursFeries2024 = [
        "2024-01-01",
        "2024-04-01",
        "2024-05-01",
        "2024-05-08",
        "2024-05-09",
        "2024-05-20",
        "2024-07-14",
        "2024-08-15",
        "2024-11-01",
        "2024-11-11",
        "2024-12-25"
    ];

    const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const mois = [
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"
    ];

    // Format YYYY-MM-DD pour comparaison
    const dateStr = date.toISOString().split("T")[0];

    const jour = jours[date.getDay()];
    const jourNum = date.getDate();
    const moisNom = mois[date.getMonth()];
    const annee = date.getFullYear();

    if (joursFeries2024.includes(dateStr)) {
        console.log(`Le ${jourNum} ${moisNom} ${annee} est un jour férié`);
    } else if (date.getDay() === 0 || date.getDay() === 6) {
        console.log(`Non, ${jourNum} ${moisNom} ${annee} est un week-end`);
    } else {
        console.log(`Oui, ${jourNum} ${moisNom} ${annee} est un jour travaillé`);
    }
}

// Exemple
jourTravaille(new Date("2024-05-01")); // férié
jourTravaille(new Date("2024-05-04")); // week-end
jourTravaille(new Date("2024-05-02")); // travaillé