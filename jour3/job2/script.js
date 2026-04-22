$(function () {

  // shuffle images on button click
  $("#shuffle").click(function () {
    let images = $("#container img").toArray();

    images.sort(() => Math.random() - 0.5);

    $("#container").empty().append(images);

    $("#message").text("");
  });

  // switch images on click
  let first = null;

  $("#container").on("click", "img", function () {

    if (!first) {
      first = $(this);
    } else {
      let second = $(this);

      let temp = first.clone();
      first.replaceWith(second.clone());
      second.replaceWith(temp);

      first = null;

      checkOrder();
    }
  });

  // check order of images
  function checkOrder() {
    let correct = true;

    $("#container img").each(function (index) {
      if ($(this).data("order") != index + 1) {
        correct = false;
      }
    });

    if (correct) {
      $("#message")
        .text("Vous avez gagné")
        .css("color", "green");
    } else {
      $("#message")
        .text("Vous avez perdu")
        .css("color", "red");
    }
  }

});