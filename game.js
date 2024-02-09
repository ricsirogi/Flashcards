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
}

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
}

let params = new URLSearchParams(window.location.search)
let deckName = params.get('deck')

let cardButton = document.getElementById('card-button')
let cardFront = cardButton.getElementsByClassName('front')[0]
let cardBack = cardButton.getElementsByClassName('back')[0]
let knowButton = document.getElementById('know-button')
let notKnowButton = document.getElementById('not-know-button')
let undoButton = document.getElementById('undo-button')
let backButton = document.getElementById('back-button')
let progressIndicator = document.getElementById('progress-indicator')

let deck = []
let learnedDeck = []
let notLearnedDeck = []
let currentCard = null
let lastPress = [] // keeps track if the button presses (a stack of strings 'know' or 'not-know')
let totalDeckLength = 0
let initialDeckLength = 0
let undoBackup = new Backup(deck, learnedDeck, notLearnedDeck, currentCard, lastPress, totalDeckLength)

function changeCardText(texts) {
  cardFront.innerHTML = texts[0]
  cardBack.innerHTML = texts[1]
}

function confirmExit(e) {
  if (!currentCard) {
    return
  }
  e.preventDefault()
  e.returnValue = ''
}
window.addEventListener('beforeunload', confirmExit)

function hungarizeWord(word) {
  // for a while when I was writing the words file, I didn't know why python was displaying the hungarian characters wrong
  // so I used these to replace the characters with the correct ones
  // now I don't need them, but I'll keep them here for a while
  word = word.replace(/o:(?!:)/g, 'ö')
  word = word.replace(/u:(?!:)/g, 'ü')
  word = word.replace(/o'(?!')/g, 'ó')
  word = word.replace(/o"(?!")/g, 'ő')
  word = word.replace(/u'(?!')/g, 'ú')
  word = word.replace(/u"(?!")/g, 'ű')
  word = word.replace(/e'(?!')/g, 'é')
  word = word.replace(/a'(?!')/g, 'á')
  word = word.replace(/i'(?!')/g, 'í')

  return word
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

function uppercaseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// animate is a boolean, if true, the card will be flipped with an animation
function defaultCard(animate) {
  // toggle the flip animation, if the card was flipped
  flip = currentCard.default()
  if (true && flip) {
    cardButton.classList.toggle('flipped')
  }
}

async function loadData() {
  try {
    let response = await fetch('https://raw.githubusercontent.com/ricsirogi/Flashcards/main/cards/' + deckName + '.txt')
    let data = await response.text()

    // create all the cards
    data = data.split('\n')
    if (data.length % 2 !== 0) {
      console.error('The number of lines in the file is not even.' + '\n' + data)
      return
    }

    allCards = []
    for (let i = 0; i < data.length; i = i + 2) {
      huWord = uppercaseFirstLetter(hungarizeWord(data[i]))
      enWord = uppercaseFirstLetter(data[i + 1])
      allCards.push(new Card(huWord, enWord, 'hu'))
    }

    totalDeckLength = allCards.length
    initialDeckLength = allCards.length

    // shuffle the cards and put them into the deck
    shuffleCards(allCards).forEach((element) => {
      deck.push(element)
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

loadData().then(() => {
  totalDeckLength = deck.length
  currentCard = deck.pop()
  changeCardText(currentCard.getWords())
  updateProgress()
})

function updateProgress() {
  // call this after taking the new card out of the deck (I think it makes more sense to call it after)
  progressIndicator.innerHTML = 'Progress: ' + (deck.length + 1) + '/' + totalDeckLength
}

function cardFlash(color, duration) {
  cardButton.style.animation = color + '-flash ' + duration + 's cubic-bezier(0.445, 0.050, 0.550, 0.950)'
  setTimeout(() => {
    cardButton.style.animation = ''
  }, duration * 1000)
}
//* ACTION BUTTONS

//knowornot is a string, either 'know' or 'not-know' depending on which button was pressed
function nextCard(knowornot) {
  if (currentCard === null) {
    return
  }
  console.log(currentCard)

  defaultCard(true)

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
    // if the deck is empty, then the game is over, start over with the not learned cards
    undoBackup = Backup(deck, learnedDeck, notLearnedDeck, currentCard, lastPress, totalDeckLength)
    deck = shuffleCards(notLearnedDeck)
    learnedDeck = []
    notLearnedDeck = []
    currentCard = deck.pop()
    lastPress = []
    totalDeckLength = deck.length
  } else {
    progressIndicator.innerHTML = 'Game over! Refresh the page to start over.'
    currentCard = null
    return
  }

  // Flash the card with the appropriate color and then change the card
  let flashColor = knowornot === 'know' ? 'green' : 'red'
  let flashDuration = 0.25
  cardFlash(flashColor, flashDuration)
  setTimeout(() => {
    changeCardText(currentCard.getWords())
    updateProgress()
    console.log(currentCard)
  }, flashDuration * 1000)
}

cardButton.addEventListener('click', () => {
  cardButton.classList.toggle('flipped')
  currentCard.flip()
})

knowButton.addEventListener('click', () => nextCard('know'))
notKnowButton.addEventListener('click', () => nextCard('not-know'))

undoButton.addEventListener('click', () => {
  // only add currentCard back into the deck, if it's not null, and the deck it would pull back from is not empty
  if (!currentCard) {
    return
  }
  defaultCard(true)

  if (deck.length !== initialDeckLength && deck.length == totalDeckLength - 1) {
    console.log('This is when the point where the deck was shuffled')
  }
  if (lastPress[lastPress.length - 1] === 'know' && learnedDeck.length > 0) {
    deck.push(currentCard)
    lastPress.pop()
    currentCard = learnedDeck.pop()
  } else if (lastPress[lastPress.length - 1] === 'not-know' && notLearnedDeck.length > 0) {
    deck.push(currentCard)
    lastPress.pop()
    currentCard = notLearnedDeck.pop()
  } else {
    return
  }
  changeCardText(currentCard.getWords())

  updateProgress()
})

function backToMenu() {
  window.removeEventListener('beforeunload', confirmExit)
  window.location.href = 'index.html'
}
// exit confirmation prompt
backButton.addEventListener('click', () => {
  if (currentCard) {
    if (confirm('Are you sure you want to go back? All progress will be lost.')) {
      backToMenu()
    }
  } else {
    backToMenu()
  }
})
