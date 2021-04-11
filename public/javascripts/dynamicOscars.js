function modifyOscarList() {
  let oscarFields = document.getElementById("oscars");
  let oscarNumberField = document.getElementById("liczba_oscarow_filmu");
  var oscarNumber;
  if (oscarNumberField.value == "") {
    oscarNumber = 0;
  } else {
    oscarNumber = parseInt(oscarNumberField.value);
  }
  oscarFields.innerHTML = "";

  if (oscarNumber > 0 && oscarNumber <= 25) {
    while (oscarFields.children.length != oscarNumber * 2) {
      if (oscarNumber * 2 > oscarFields.children.length) {
        newInput = document.createElement("input");
        newInput.setAttribute("type", "text");
        newInput.setAttribute("name", "oscar");
        oscarFields.appendChild(newInput);
        oscarFields.appendChild(document.createElement("br"));
      } else {
        oscarFields.removeChild(oscarFields.lastChild);
      }
    }
  } else {
    let errorMessage = document.createElement("p");
    errorMessage.innerHTML = "<p>Ilość oscarów musi być z zakresu <1,25></p>";
    oscarFields.appendChild(errorMessage);
  }
}

function updatePreview() {
  let posterPreview = document.getElementById("preview");
  let posterURL = document.getElementById("plakat_url");
  posterPreview.setAttribute("src", posterURL.value);
}
