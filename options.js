
// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("default_library");
  var library = select.children[select.selectedIndex].value;
  localStorage["default_library"] = library;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var library = localStorage["default_library"];
  if (!library) {
    return;
  }
  var select = document.getElementById("default_library");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == library) {
      child.selected = "true";
      break;
    }
  }
}

function onload() {
    document.getElementById("save").onclick = save_options;
    restore_options();
}

window.addEventListener("load", onload);
