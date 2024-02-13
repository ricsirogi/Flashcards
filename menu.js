var listOfDecs = [
  'angol_szavak_en',
  'i_animali_it',
  'la salute e il corpo umano_it',
  'olasz ruhak_it',
  'olasz_tetel_tema_8_1tol_10ig_szavak_it',
  'olasz_tv_multimedia_it',
  'unita11_plus_pagina_85_it',
  'test_en',
]

function createOptions() {
  let parent = document.getElementById('menu-container')
  listOfDecs.forEach((deck) => {
    let button = document.createElement('button')
    button.innerHTML = deck
    button.onclick = function () {
      console.log('deck:', deck)
      window.location.href = 'game.html?deck=' + encodeURIComponent(deck)
    }
    button.className = 'menu-button'
    parent.appendChild(button)
  })
}

createOptions()
