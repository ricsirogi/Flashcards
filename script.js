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

let deck = []
let leanedDeck = []
let notLearnedDeck = []
let currentCard = null

let loadedCardsRaw = ''
fetch('cards/test.txt')
  .then((response) => response.text())
  .then((data) => {
    // Here's where you handle the response text
    console.log(data)
  })
  .catch((error) => {
    console.error('Error:', error)
  })
