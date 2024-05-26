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

async function loadData(inputDeck, returnRaw = false) {
  let data = {}

  if (inputDeck === undefined) {
    try {
      let response = await fetch('https://raw.githubusercontent.com/ricsirogi/Flashcards/main/decks/' + deckName + '.txt')
      data = await response.text()
      if (returnRaw) {
        return data
      }
    } catch (error) {
      console.error('Error:', error)
    }

    //* create all the cards
    data = data.split('\n')
  }
  else {
    data = inputDeck.split('\n')
    startNum = 0
    endNum = data.length
  }

  // remove all stray newline characters from the end of data
  while (data[data.length - 1] === '\n' || data[data.length - 1] === '') {
    data.pop()
  }

  // check if the number of lines in the file is even
  if (data.length % 2 !== 0) {
    console.error('The number of lines in the file is not even.' + '\n' + data)
    console.log('this is the last', data[data.length - 1])
    return
  }

  allCards = []
  for (let i = 0; i < data.length; i = i + 2) {
    if (i < startNum * 2) {
      continue
    } else if (i > endNum * 2) {
      break
    }
    huWord = uppercaseFirstLetter(hungarizeWord(data[i]))
    enWord = uppercaseFirstLetter(data[i + 1])
    allCards.push(new Card(huWord, enWord, defaultSide))
  }

  if (inputDeck !== undefined) {
    return allCards
  }

  totalDeckLength = allCards.length
  initialDeckLength = allCards.length

  // shuffle the cards and put them into the deck
  if (shuffleMode) {
    console.log("shuffled")
    shuffleCards(allCards).forEach((element) => {
      deck.push(element)
    })
  } else {
    console.log("Didnt shuffle")
    allCards.reverse().forEach((element) => {
      deck.push(element)
    })
  }
}

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

function uppercaseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

async function listTxtFiles() {
  const url = `https://raw.githubusercontent.com/ricsirogi/Flashcards/master/decks/allDecks.json`;
  const response = await fetch(url);
  const files = await response.json();
  return files['decks']
}