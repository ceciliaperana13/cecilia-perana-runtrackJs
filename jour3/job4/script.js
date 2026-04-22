$(function () {

  $("#champ").focus(function () {
    $(this).animate({
      width: "300px"
    }, 300);
  });

  $("#champ").blur(function () {
    $(this).animate({
      width: "200px"
    }, 300);
  });

});