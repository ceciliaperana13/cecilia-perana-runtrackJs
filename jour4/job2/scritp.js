function jsonValueKey(jsonString, key) {
    try {
        const obj = JSON.parse(jsonString);
        return obj[key];
    } catch (error) {
        console.error("JSON invalide");
        return null;
    }
}

// json ici
const json = `{
    "name": "Laplateforme_",
    "address": "8 rue d'hozier",
    "city": "Marseille",
    "nb_staff": "11",
    "creation": "2019"
}`;

// Test
console.log(jsonValueKey(json, "city"));