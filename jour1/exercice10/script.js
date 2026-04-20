function tri(numbers, order) {
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            
            if (
                (order === "asc" && numbers[i] > numbers[j]) ||
                (order === "desc" && numbers[i] < numbers[j])
            ) {
                // échange des valeurs
                let temp = numbers[i];
                numbers[i] = numbers[j];
                numbers[j] = temp;
            }
        }
    }
    return numbers;
}

// Exemples
console.log(tri([5, 2, 9, 1], "asc"));  // [1, 2, 5, 9]
console.log(tri([5, 2, 9, 1], "desc")); // [9, 5, 2, 1]