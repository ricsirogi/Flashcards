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

function createOptions() {
  let parent = document.getElementById('menu-container')
  listOfDecs.forEach((deck) => {
    let button = document.createElement('button')
    button.innerHTML = deck
    button.onclick = function () {
      console.log('deck:',deck)
      window.location.href = 'game.html?deck=' + encodeURIComponent(deck)
    }
    button.className = 'menu-button'
    parent.appendChild(button)
  })
}

createOptions()
