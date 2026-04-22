function changeTheme() {
  document.body.classList.toggle("dark");
}

document
  .getElementById("toggle-theme")
  .addEventListener("click", changeTheme);