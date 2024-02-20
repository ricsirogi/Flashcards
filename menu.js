function startGame() {
  window.location.href = 'game.html?deck=' + encodeURIComponent(selectedDeck) + '&start=' + Math.floor(slider.noUiSlider.get()[0]) + '&end=' + Math.floor(slider.noUiSlider.get()[1]) + '&defaultSide=' + defaultSide
}

function unselect() {
  optionsContainer.style.display = 'none'
  menuContainer.style.display = 'flex'
}

function select() {
  optionsContainer.style.display = 'flex'
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

const deckFolders = {
  'a_scuola': [
    'A scuola', 'a_scuola_part1_it', 'a_scuola_part2_it', 'a_scuola_part3_it', 'i_soggetti_it'
  ],
}

var listOfDecs = [
  ['bevezető szavak',
    deckFolders.a_scuola,
    'napi_rutin_it',
    'tempo_libero_it'],
  ['tételek',
    'olasz_tv_multimedia_it',
    'olasz_tetel_tema_8_1tol_10ig_szavak_it',
    'la salute e il corpo umano_it',],
  ['ünnepek',
    'haloween_ognisanti_it',
    'natale_nuovo_anno_epifania_HAMAROSAN_it'],
  ['rendhagyó igék',
    'rendhagyo_futuro_semplice_it',
    'rendhagyo_passato_prossimo_it',
    'rendhagyo_imperfetto_HAMAROSAN_it'],
  ['olasz témakörök',
    'napi_rutin_it',
    'al_bar_it',
    'tempo_libero_it',
    deckFolders.a_scuola,
    'la_famiglia_it',
    'la_casa_it',
    'idojaras_it',
    'il_social_media_it',
    'i_cibi_it',
    'frasi_per_esprimere_opinioni_it',
    'olasz ruhak_it',
    'i_animali_it',],
  ['tankönyv szavak',
    'unita11_plus_pagina_85_it'],
  ['angol szavak',
    'angol_szavak_en'],
  'test_en',]

var slider = document.getElementById('slider');
var value1 = document.getElementById('sliderValue1');
var value2 = document.getElementById('sliderValue2');
var decksPath = 'https://raw.githubusercontent.com/ricsirogi/Flashcards/main/decks/'

let defaultSide = 'hu'
let menuContainer = document.getElementById('menu-container')
let selectedDeck = ''
let optionsContainer = document.getElementById('options-container')
let acceptButton = document.getElementById('accept-button')
let unselectButton = document.getElementById('unselect-button')
let huSideButton = document.getElementById('hu-side-button')
let enSideButton = document.getElementById('en-side-button')

function makeButtons(inputDeck, parent, indentWidth) {
  inputDeck.forEach((deck) => {
    if (Array.isArray(deck)) {
      let folderContainer = document.createElement('div')
      let folderButton = document.createElement('button')
      let folderElementsContainer = document.createElement('div')

      folderContainer.className = 'flex-column'
      folderButton.className = 'folder-button menu-button'
      folderElementsContainer.className = 'flex-column'

      folderContainer.style.marginLeft = indentWidth + '%'
      folderContainer.style.width = 100 - indentWidth + '%'

      folderElementsContainer.style.display = 'none'

      folderButton.innerHTML = deck[0].replace(/_/g, ' ')
      folderButton.onclick = function () {
        if (folderElementsContainer.style.display === 'none') {
          folderElementsContainer.style.display = 'flex'
        } else {
          folderElementsContainer.style.display = 'none'
        }
      }
      parent.appendChild(folderContainer)
      folderContainer.appendChild(folderButton)
      folderContainer.appendChild(folderElementsContainer)

      makeButtons(deck.slice(1), folderElementsContainer, indentWidth + 5)
    } else {
      let button = document.createElement('button')
      button.style.marginLeft = indentWidth + '%'
      button.style.width = 100 - indentWidth + '%'
      button.innerHTML = deck.replace(/_/g, ' ').slice(0, -3);
      button.onclick = function () {
        selectedDeck = deck
        select()
      }
      button.className = 'menu-button'
      parent.appendChild(button)
    }
  })
}
makeButtons(listOfDecs, menuContainer, 0)

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

huSideButton.addEventListener('click', () => {
  defaultSide = 'hu'
  huSideButton.style.backgroundColor = 'var(--default-side-button-selected-color)'
  enSideButton.style.backgroundColor = 'var(--element-bg-color)'
})
enSideButton.addEventListener('click', () => {
  defaultSide = 'en'
  enSideButton.style.backgroundColor = 'var(--default-side-button-selected-color)'
  huSideButton.style.backgroundColor = 'var(--element-bg-color)'
})
optionsContainer.style.display = 'none'

acceptButton.onclick = startGame
unselectButton.onclick = unselect

