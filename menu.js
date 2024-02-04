var listOfDecs = ['angol_szavak', 'la salute e il corpo umano', 'olasz ruhak', 'olasz_tetel_tema_8_1tol_10ig_szavak', 'olasz_tv_multimedia', 'unita11_plus_pagina_85']

function createOptions() {
  let parent = document.getElementById('menu-container')
  console.log(parent)
  listOfDecs.forEach((deck) => {
    let button = document.createElement('button')
    button.innerHTML = deck
    button.onclick = function () {
      window.location.href = 'game.html?deck=' + encodeURIComponent(deck)
    }
    button.className = 'menu-button'
    parent.appendChild(button)
  })
}

createOptions()
