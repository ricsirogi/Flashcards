class Card {
  constructor(hu, en, side) {
    this.hu = hu // the hungarian word
    this.en = en // the othe language translation of the word, en means english
    this.side = side // indicates which side of the card is visible, can be either 'hu' or 'en'
  }

  get_word() {
    return this.side === 'hu' ? this.hu : this.en
  }

  flip() {
    this.side = this.side === 'hu' ? 'en' : 'hu'
  }
}

let params = new URLSearchParams(window.location.search)
let deckName = params.get('deck')

let deck = []
let learnedDeck = []
let notLearnedDeck = []
let currentCard = null
let lastPress = [] // keeps track if the button presses (a stack of strings 'know' or 'not-know')

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
      hu_word = hungarizeWord(data[i])
      allCards.push(new Card(hu_word, data[i + 1], 'hu'))
    }

    // shuffle the cards and put them into the deck
    shuffleCards(allCards).forEach((element) => {
      deck.push(element)
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

loadData().then(() => {
  currentCard = deck.pop()
  cardButton.innerHTML = currentCard.hu
})

//* ACTION BUTTONS
function nextCard(knowornot) {
  if (currentCard === null) {
    return
  }
  if (knowornot === 'know') {
    learnedDeck.push(currentCard)
    lastPress.push('know')
  } else if (knowornot === 'not-know') {
    notLearnedDeck.push(currentCard)
    lastPress.push('not-know')
  }
  if (deck.length > 0) {
    currentCard = deck.pop()
  } else {
    // if the deck is empty, then the game is over, start over with the not learned cards
    deck = shuffleCards(notLearnedDeck)
    notLearnedDeck = []
    learnedDeck = []
    currentCard = deck.pop()
  }
  cardButton.innerHTML = currentCard.hu
  console.log('\n', deck)
  console.log(learnedDeck)
  console.log(notLearnedDeck)
}

let cardButton = document.getElementById('card-button')
let knowButton = document.getElementById('know-button')
let notKnowButton = document.getElementById('not-know-button')
let undoButton = document.getElementById('undo-button')
cardButton.addEventListener('click', () => {
  if (currentCard.side === 'hu') {
    cardButton.innerHTML = currentCard.en
  } else {
    cardButton.innerHTML = currentCard.hu
  }
  currentCard.flip()
})

knowButton.addEventListener('click', () => nextCard('know'))
notKnowButton.addEventListener('click', () => nextCard('not-know'))
undoButton.addEventListener('click', () => {
  // only add currentCard back into the deck, if it's not null, and the deck it would pull back from isn't empty
  if (!currentCard) {
    return
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
  console.log('\n', deck)
  console.log(learnedDeck)
  console.log(notLearnedDeck)
  cardButton.innerHTML = currentCard.hu
})
