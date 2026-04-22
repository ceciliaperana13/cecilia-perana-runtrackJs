$(function () {

  let gameOver = false;

  function shuffle() {
    let tiles = $("#grid > div").toArray();

    tiles.sort(() => Math.random() - 0.5);

    $("#grid").empty().append(tiles);

    $("#message").text("");
    gameOver = false;
  }

  shuffle();

  $("#grid").on("click", ".tile", function () {
    if (gameOver) return;

    let empty = $(".empty");
    let indexTile = $(this).index();
    let indexEmpty = empty.index();

    let valid =
      (indexTile - 1 === indexEmpty && indexTile % 3 !== 0) ||
      (indexTile + 1 === indexEmpty && indexTile % 3 !== 2) ||
      (indexTile - 3 === indexEmpty) ||
      (indexTile + 3 === indexEmpty);

    if (valid) {
      if (indexTile < indexEmpty) {
        empty.after($(this));
      } else {
        empty.before($(this));
      }
    }

    checkWin();
  });

  function checkWin() {
    let correct = true;

    $("#grid .tile img").each(function (index) {
      if ($(this).data("order") != index + 1) {
        correct = false;
      }
    });

    if (correct) {
      $("#message").text("Vous avez gagné").css("color", "green");
      gameOver = true;
    }
  }

  $("#restart").click(function () {
    shuffle();
  });

});