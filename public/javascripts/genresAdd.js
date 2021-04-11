let elements = document.getElementsByClassName("genreField");

function addField() {
  let form = document.getElementById("genres");
  let lastIndex = elements[elements.length - 1].name;
  console.log(elements[elements.length - 1].name);
  let lastGenreNumber = parseInt(lastIndex.replace(/[^0-9]/g, ""));
  lastGenreNumber += 1;
  form.innerHTML += `<input type="text" class="genreField" name="g${lastGenreNumber}" value=""></input></br>`;
}
