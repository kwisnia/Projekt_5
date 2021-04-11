function modifyOscarList() {
  let oscarFields = document.getElementById("oscars");
  var oscar_number;
  if (document.getElementById("oscar_number").value == "") {
    oscarNumber = 0;
  } else {
    oscarNumber = parseInt(document.getElementById("oscar_number").value);
  }
  oscarFields.innerHTML = "";
  if (oscarNumber > 0 && oscarNumber <= 25) {
    while (oscarFields.children.length != oscarNumber * 2) {
      newInput = document.createElement("input");
      newInput.setAttribute("type", "text");
      newInput.setAttribute("name", "oscar");
      oscarFields.appendChild(newInput);
      oscarFields.appendChild(document.createElement("br"));
    }
  } else {
    let errorMessage = document.createElement("p");
    errorMessage.innerHTML = "<p>Ilość oscarów musi być z zakresu <1,25></p>";
    oscarFields.appendChild(errorMessage);
  }
}
