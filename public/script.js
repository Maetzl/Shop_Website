// Get the modal
var modal = document.getElementById("myModal");
var span = [...document.getElementsByClassName("close")];
var articleid = undefined;
var bewertet = [];

function showModal() {
  setModal();
  modal.style.display = "block";
}
function setModal() {
  modal = document.getElementById(getcurrentitem());
}

// When the user clicks on <span> (x), close the modal
span.forEach((element, index, array) => {
  element.onclick = () => {
    setModal();
    modal.style.display = "none";
  };
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function setcurrentitem(articlea) {
  articleid = articlea;
  showModal();
}
function getcurrentitem() {
  return articleid;
}

function bewertung(i, id) {
  if (bewertet[id - 1] == null || bewertet[id - 1] == false) {
    fetch("/postBewertung", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        i,
        id,
      }),
    }).catch((e) => {
      console.log(e);
    });
    console.log(bewertet);
    bewertet[id - 1] = true;
  } else {
    console.log("Schon bewertet");
  }
}
