// $ before a variable name : not useful, but a convention to indicate 
// it's a JQuery variable 

// $(function() {block}) executes the block when the page has charged
// It's like an entry point for the script 
$(function () {

    // Main elements
    const $imagesContainer = $("#images-container");
    const $puzzleBox = $("#puzzle-box");

    // Randomize images at page load
    randomize();

    // Reset button: put images back in original order and clear puzzle
    $("#shuffle").on("click", function () {
        resetToOriginal();
    });

    // Click on an image: move it to the puzzle box (first free slot from the left)
    $(document).on("click", ".picture", function () {

        // Remove previous result message
        $("#result").remove();

        // Move the parent .rainbow div
        if ($puzzleBox.children(".rainbow").length < 6) {
            $puzzleBox.append($(this).parent());
        }

        checkWin();
    });

    // FUNCTIONS

    // Randomize images inside #images-container
    function randomize() {

        // Add all images to an array
        const items = $imagesContainer.children(".rainbow").toArray();

        // Shuffle cheat : Math.random() returns a number between 0 and 1. 
        // By substracting 0.5 => 50% chance of positive, 50% chance of negative 
        // So 50% chance of keeping the order, 50% of inverting the sort 
        items.sort(() => Math.random() - 0.5);

        // Put the images of the array back into the div 
        $imagesContainer.empty().append(items);
    }

    // Reset all images
    function resetToOriginal() {

        // Remove victory/defeat text
        $("#result").remove();

        // Move all pieces (from both containers) back to images container
        const allItems = $imagesContainer.add($puzzleBox).find(".rainbow").toArray();

        // Clear puzzle box and restore ordered images
        $puzzleBox.empty();
        $imagesContainer.empty().append(allItems);

        randomize();
    }

    // Check if the puzzle is correctly assembled
    function checkWin() {

        const $rows = $puzzleBox.children(".rainbow");

        // Not all 6 images placed, return immediatly 
        if ($rows.length < 6) {
            return;
        }

        let correct = true;

        $rows.each(function (index) {
            // 0-5 => 1-6
            const expected = index + 1;
            // Récupère le chiffre de l'id 
            const actual = parseInt(this.id.split("-")[1]);
            if (expected !== actual) {
                correct = false;
            }
        });

        // condition ? value if true : value if false; 
        const msg = correct ? "Vous avez gagné" : "Vous avez perdu";
        const color = correct ? "green" : "red";
        
        // create the short feedback text 
        $("<span id='result'></span>")
            .text(msg)
            .css("color", color)
            .insertAfter("#puzzle-box");
    }

});
