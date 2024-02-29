class Card {
  constructor(hu, en, side) {
    this.hu = hu // the hungarian word
    this.en = en // the othe language translation of the word, en means english
    this.side = side // indicates which side of the card is visible, can be either 'hu' or 'en'
    this.defaultSide = side // the side the card will be on when it's put back into the deck
  }

  getWords() {
    // returns the words in an array, the first element is the word on the current side, the second is the word on the other side
    return this.side === 'hu' ? [this.hu, this.en] : [this.en, this.hu]
  }

  flip() {
    // This is till needed because we still need to know which side the card is on
    this.side = this.side === 'hu' ? 'en' : 'hu'
  }

  default() {
    // flips the card to it's default side, returns true if the card was flipped
    let flip = this.side !== this.defaultSide
    this.side = this.defaultSide
    return flip
  }

  static fromData(data) {
    let card = new Card(data.hu, data.en, data.side)
    return card
  }

  toData() {
    return {
      hu: this.hu,
      en: this.en,
      side: this.side,
      defaultSide: this.defaultSide,
    }
  }
}

// This class is used to store the states of the game before reshuffling the deck, so the user can even undo shuffling the deck
class Backup {
  constructor(deck, learnedDeck, notLearnedDeck, currentCard, lastPress, totalDeckLength) {
    this.deck = deck
    this.learnedDeck = learnedDeck
    this.notLearnedDeck = notLearnedDeck
    this.currentCard = currentCard
    this.lastPress = lastPress
    this.totalDeckLength = totalDeckLength
  }

  loadBackup() {
    return [this.deck, this.learnedDeck, this.notLearnedDeck, this.currentCard, this.lastPress, this.totalDeckLength]
  }

  static fromData(data) {
    let backup = new Backup(
      data.deck.map(Card.fromData),
      data.learnedDeck.map(Card.fromData),
      data.notLearnedDeck.map(Card.fromData),
      data.currentCard ? Card.fromData(data.currentCard) : null,
      data.lastPress,
      data.totalDeckLength,
    )
    return backup
  }

  toData() {
    return {
      deck: this.deck.map((card) => card.toData()),
      learnedDeck: this.learnedDeck.length ? this.learnedDeck.map((card) => card.toData()) : [],
      notLearnedDeck: this.notLearnedDeck.length ? this.notLearnedDeck.map((card) => card.toData()) : [],
      currentCard: this.currentCard ? this.currentCard.toData() : null,
      lastPress: this.lastPress,
      totalDeckLength: this.totalDeckLength,
    }
  }
}

function saveState() {
  const state = {
    deck: deck.map((card) => card.toData()),
    learnedDeck: learnedDeck.map((card) => card.toData()),
    notLearnedDeck: notLearnedDeck.map((card) => card.toData()),
    currentCard: currentCard ? currentCard.toData() : null,
    lastPress: lastPress,
    totalDeckLength: totalDeckLength,
    undoBackup: undoBackup.map((backup) => backup.toData()),
  }
  localStorage.setItem(deckName + 'gameState', JSON.stringify(state))
}

// Load state from localStorage
function loadState() {
  const state = JSON.parse(localStorage.getItem(deckName + 'gameState'))
  if (state) {
    deck = []
    learnedDeck = []
    notLearnedDeck = []
    deck = state.deck.map(Card.fromData)
    learnedDeck = state.learnedDeck.map(Card.fromData)
    notLearnedDeck = state.notLearnedDeck.map(Card.fromData)
    currentCard = state.currentCard ? Card.fromData(state.currentCard) : null // in the inital backup, currentCard is null
    lastPress = state.lastPress
    totalDeckLength = state.totalDeckLength
    undoBackup = state.undoBackup.map(Backup.fromData)
    changeCardText(currentCard.getWords())
    updateProgress()
  }
}

function changeCardText(texts) {
  cardFront.innerHTML = texts[0]
  cardBack.innerHTML = texts[1]
}

function confirmExit(e) {
  if (!currentCard) {
    return
  }
  saveState()

  e.preventDefault()
  e.returnValue = ''
}

function shuffleCards(baseDeck) {
  newDeck = []
  var len = baseDeck.length
  for (let i = 0; i < len; i++) {
    let randomIndex = Math.floor(Math.random() * baseDeck.length)
    newDeck.push(baseDeck[randomIndex])
    baseDeck.splice(randomIndex, 1)
  }
  return newDeck
}



function defaultCard() {
  // toggle the flip animation, if the card was flipped
  flip = currentCard.default()
  if (flip) {
    cardButton.classList.toggle('flipped')
  }
}

function cardFlash(color, duration) {
  cardButton.style.animation = color + '-flash ' + duration + 's cubic-bezier(0.445, 0.050, 0.550, 0.950)'
  setTimeout(() => {
    cardButton.style.animation = ''
  }, duration * 1000)
}
function updateProgress() {
  // call this after taking the new card out of the deck (I think it makes more sense to call it after)
  progressIndicator.innerHTML = 'Progress: ' + (deck.length + 1) + '/' + totalDeckLength
}

//knowornot is a string, either 'know' or 'not-know' depending on which button was pressed
function nextCard(knowornot) {
  if (!currentCard) {
    return
  }

  console.log('next card from', currentCard.getWords()[0])
  defaultCard()

  if (knowornot === 'know') {
    learnedDeck.push(currentCard)
    lastPress.push('know')
  } else if (knowornot === 'not-know') {
    notLearnedDeck.push(currentCard)
    lastPress.push('not-know')
  } else {
    console.error('Invalid argument in nextCard()')
  }
  if (deck.length > 0) {
    currentCard = deck.pop()
  } else if (notLearnedDeck.length > 0) {
    // Before resetting the decks and stuff, we need to save the current state of the game, so we can undo the last action

    // we need to remove currentCard from either learned or not learned deck, otherwise,
    // if the user undoes the last action, the card will be shown twice

    // Also we need to .pop() the lastPress array, so the undo button will work correctly
    backupLearnedDeck = [...learnedDeck]
    backupNotLearnedDeck = [...notLearnedDeck]
    if (knowornot === 'know') {
      backupLearnedDeck.pop()
    } else if (knowornot === 'not-know') {
      backupNotLearnedDeck.pop()
    }
    lastPress.pop()

    undoBackup.push(new Backup([...deck], backupLearnedDeck, backupNotLearnedDeck, currentCard, [...lastPress], totalDeckLength))

    // if the deck is empty, then the game is over, start over with the not learned cards
    deck = shuffleCards(notLearnedDeck)
    learnedDeck = []
    notLearnedDeck = []
    totalDeckLength = deck.length
    currentCard = deck.pop()
    lastPress = []
  } else {
    progressIndicator.innerHTML = 'Game over! Refresh the page to start over.'
    currentCard = null
    return
  }

  console.log('to', currentCard.getWords()[0])

  // Flash the card with the appropriate color and then change the card
  let flashDuration = 0.25
  cardFlash(knowornot, flashDuration)
  setTimeout(() => {
    changeCardText(currentCard.getWords())
    updateProgress()
  }, flashDuration * 1000)
}

let params = new URLSearchParams(window.location.search)
let deckName = params.get('deck')
let startNum = params.get('start') - 1 // -1 because uh indexes
let endNum = params.get('end') - 1
let deckDefaultSide = params.get('defaultSide')
const language = deckName.split('_')[deckName.split('_').length - 1]

let cardButton = document.getElementById('card-button')
let cardFront = cardButton.getElementsByClassName('front')[0]
let cardBack = cardButton.getElementsByClassName('back')[0]
let knowButton = document.getElementById('know-button')
let notKnowButton = document.getElementById('not-know-button')
let undoButton = document.getElementById('undo-button')
let backButton = document.getElementById('back-button')
let resetButton = document.getElementById('reset-button')
let progressIndicator = document.getElementById('progress-indicator')

let deck = [] // stack that stores the cards that are to be pulled
let learnedDeck = [] // stack that stores the cards that the user knows
let notLearnedDeck = [] // stack that stores the cards that the user doesn't know, will be reshuffled and placed back into the deck
let currentCard = null // the card that is currently being shown
let lastPress = [] // keeps track if the button presses (a stack of strings 'know' or 'not-know')
let totalDeckLength = 0 // the total number of cards in the current deck
let initialDeckLength = 0 // the total number of cards in the initial deck (before disposing the known cards into the learnedDeck stack)
let undoBackup = [] // stack that stores the states of the game before reshuffling the deck, so the user can even undo shuffling the deck

window.addEventListener('beforeunload', confirmExit)

// load the game state from localStorage
// If it's not there, load the data from the file
if (localStorage.getItem(deckName + 'gameState') === null) {
  loadData().then(() => {
    totalDeckLength = deck.length
    currentCard = deck.pop()
    changeCardText(currentCard.getWords())
    updateProgress()
  })
} else {
  loadState()
}

cardButton.addEventListener('click', () => {
  cardButton.classList.toggle('flipped')
  currentCard.flip()
})

knowButton.addEventListener('click', () => nextCard('know'))
notKnowButton.addEventListener('click', () => nextCard('not-know'))

undoButton.addEventListener('click', () => {
  // only add currentCard back into the deck, if it's not null, and the deck it would pull back from is not empty
  if (!currentCard || lastPress.length === 0) {
    // if we're undoing something that happened after the last shuffle, then we need to load the state before the shuffle
    if (deck.length !== initialDeckLength - 1 && deck.length == totalDeckLength - 1) {
      let backup = undoBackup.pop().loadBackup()
      deck = backup[0]
      learnedDeck = backup[1]
      notLearnedDeck = backup[2]
      currentCard = backup[3]
      lastPress = backup[4]
      totalDeckLength = backup[5]
      updateProgress()
      changeCardText(currentCard.getWords())
      return
    } else {
      return
    }
  }

  defaultCard()

  deck.push(currentCard)

  if (lastPress[lastPress.length - 1] === 'know' && learnedDeck.length > 0) {
    currentCard = learnedDeck.pop()
  } else if (lastPress[lastPress.length - 1] === 'not-know' && notLearnedDeck.length > 0) {
    currentCard = notLearnedDeck.pop()
  } else {
    return
  }

  let flashDuration = 0.25
  cardFlash('undo', flashDuration)
  setTimeout(() => {
    lastPress.pop()
    changeCardText(currentCard.getWords())
    updateProgress()
  }, flashDuration * 1000)
})

function backToMenu() {
  window.removeEventListener('beforeunload', confirmExit)
  window.location.href = 'index.html'
}
// exit confirmation prompt
backButton.addEventListener('click', () => {
  if (currentCard) {
    saveState()
    if (confirm('Biztos hogy vissza ki akarsz lépni? A játék állása el lesz mentve.')) {
      backToMenu()
    }
  } else {
    backToMenu()
  }
})

resetButton.addEventListener('click', () => {
  if (!currentCard || confirm('Biztos hogy újra akarod kezdeni? A játék jelenlegi állása törölve lesz.')) {
    localStorage.removeItem(deckName + 'gameState')
    window.removeEventListener('beforeunload', confirmExit)
    window.location.reload()
  }
})
