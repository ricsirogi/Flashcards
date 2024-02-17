function startGame() {
  window.location.href = 'game.html?deck=' + encodeURIComponent(selectedDeck) + '&start=' + slider.noUiSlider.get()[0] + '&end=' + slider.noUiSlider.get()[1]
}

function unselect() {
  sliderContainer.style.display = 'none'
  menuContainer.style.display = 'flex'
}

function select() {
  sliderContainer.style.display = 'flex'
  menuContainer.style.display = 'none'
  len = getDeckLength(selectedDeck).then(len => {
    slider.noUiSlider.updateOptions({
      start: [1, Math.floor(len / 2)],
      range: ({
        'min': 1,
        'max': len
      })
    })
  })

}

function getDeckLength(deck) {
  path = decksPath + deck + '.txt'
  return fetch(path)
    .then(response => response.text())
    .then(data => {
      let lines = data.split('\n');
      return Math.floor(lines.length / 2);
    })
    .catch(error => console.error(error));
}

var listOfDecs = [
  'al_bar_it',
  'angol_szavak_en',
  'haloween_ognisanti_it',
  'idojaras_it',
  'il_social_media_it',
  'i_animali_it',
  'i_cibi_it',
  'la salute e il corpo umano_it',
  'la_casa_it',
  'la_famiglia_it',
  'napi_rutin_it',
  'olasz ruhak_it',
  'olasz_tetel_tema_8_1tol_10ig_szavak_it',
  'olasz_tv_multimedia_it',
  'rendhagyo_futuro_semplice_it',
  'rendhagyo_passato_prossimo_it',
  'tempo_libero_it',
  'test_en',
  'unita11_plus_pagina_85_it']

var slider = document.getElementById('slider');
var value1 = document.getElementById('sliderValue1');
var value2 = document.getElementById('sliderValue2');
var decksPath = 'https://raw.githubusercontent.com/ricsirogi/Flashcards/main/decks/'

let menuContainer = document.getElementById('menu-container')
let selectedDeck = ''
let sliderContainer = document.getElementById('slider-container')
let acceptButton = document.getElementById('accept-button')
let unselectButton = document.getElementById('unselect-button')

listOfDecs.forEach((deck) => {
  let button = document.createElement('button')
  button.innerHTML = deck.replace(/_/g, ' ').slice(0, -3);
  button.onclick = function () {
    selectedDeck = deck
    select()
  }
  button.className = 'menu-button'
  menuContainer.appendChild(button)
})

noUiSlider.create(slider, {
  start: [1, 50],
  connect: true,
  range: {
    'min': 1,
    'max': 100
  }
});

slider.noUiSlider.on('update', function (values, handle) {
  if (handle) {
    value2.innerHTML = Math.floor(values[handle]);
  } else {
    value1.innerHTML = Math.floor(values[handle]);
  }
});

sliderContainer.style.display = 'none'

acceptButton.onclick = startGame
unselectButton.onclick = unselect

