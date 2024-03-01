function nextCard() {
    saveChange()
    let card = allCards.pop()
    huWordDisplay.innerHTML = card.hu
    huWordInput.value = card.hu
    itWordDisplay.innerHTML = card.en
    itWordInput.value = card.en
    return card
}

function isCardDifferent(card1, card2) {
    let diffString = ''
    if (card1.hu !== card2.hu) {
        diffString += 'hu'
    }
    if (card1.en !== card2.en) {
        diffString += 'it'
    }
    return diffString
}

function saveChange() {
    if (currentCard !== null) {
        checkedCard = new Card(huWordInput.value, itWordInput.value, 'hu')
        checkedCards.push(currentCard)
        diffString = isCardDifferent(currentCard, checkedCard)
        if (diffString !== '') {
            changedCards.push([checkedCard, diffString])
        }
    } else {
        console.warn("saveChange called when currentCard is null")
    }
}

function addChangeDisplay(huWord, itWord, index) {
    let changeColor = 'greenyellow'

    let huChanged = changedCards[index][1].includes('hu')
    let itChanged = changedCards[index][1].includes('it')
    let huChangedStyle = huChanged ? `style="color:${changeColor}"` : ''
    let itChangedStyle = itChanged ? `style="color:${changeColor}"` : ''

    let changeDisplay = `
        <div class="flex-column" id="change-${index}">
            <p class="max-width small-side-margin">
                <span ${huChangedStyle}class="word-wrap">${huWord}</span>
                -
                <span ${itChangedStyle} class="word-wrap">${itWord}</span>
            </p>
            <div class="flex-row">
                <button class="smaller-text full-height" id="remove-change-${index}">X</button>
            </div>
        </div>
    `
    changesDisplaySection.innerHTML += changeDisplay
}

function skipToChangesCopy(force = false) {
    if (allCards.length === 0 || force) {
        saveChange()
        deckCheckSection.classList.add('hidden')
        changesCopySection.classList.remove('hidden')

        for (let i = 0; i < changedCards.length; i++) {
            addChangeDisplay(changedCards[i][0].hu, changedCards[i][0].en, i)
            /*
            let removeButton = document.getElementById(`remove-change-${i}`)

            removeButton.addEventListener('click', ((i) => {
                element = document.getElementById(`change-${i}`)
                changesDisplaySection.removeChild(element)
                console.log('remove clicked', i)
            })(i))*/
        }
        return
    }
}

let deckInputSection = document.getElementsByName('deck-input-container')[0]
let deckCheckSection = document.getElementsByName('deck-check-container')[0]
let changesCopySection = document.getElementsByName('changes-copy-container')[0]
let changesDisplaySection = document.getElementsByName('changes-display-container')[0]

let deckInputField = document.getElementById('deck-input-field') // the element that contains the manually added deck
let deckInput = '' // a string that contains the name of the already existing deck which will be checked (selected with existingDeckList)
let deckName = ''
let existingDeckList = document.getElementById('existing-decks-list')
let allCards = []
let changedCards = [] // contains a list of this array: [card, diffString] (a diffstring is 'hu' or 'it' or 'huit')
let checkedCards = []
let currentCard = null
let chooseFromExistingDecksButton = document.getElementById('choose-from-existing-decks-button')
let jumpToDeckCheckButton = document.getElementById('jump-to-deck-check-button')

let nextCardButton = document.getElementById('next-card-button')
let skipToChangesCopyButton = document.getElementById('skip-to-changes-copy-button')

let huWordDisplay = document.getElementById('hu-word-display')
let itWordDisplay = document.getElementById('it-word-display')
let huWordInput = document.getElementById('hu-word-input')
let itWordInput = document.getElementById('it-word-input')

chooseFromExistingDecksButton.addEventListener('click', () => {
    if (!existingDeckList.classList.contains('hidden')) { // return if the list is already visible
        existingDeckList.classList.add('hidden')
        while (existingDeckList.firstChild) {
            existingDeckList.removeChild(existingDeckList.firstChild);
        }
        existingDeckList.value = ''
        return
    }

    listTxtFiles().then((result) => {
        existingDeckList.classList.remove('hidden')
        result.forEach((deck) => {
            let option = document.createElement('option')
            option.value = deck
            option.innerHTML = deck
            existingDeckList.appendChild(option)
        })
    })
})

jumpToDeckCheckButton.addEventListener('click', async () => {
    if (!existingDeckList.value) { // if the user didn't select an existing deck, read the input field
        deckInput = deckInputField.value
    } else { // else, get the raw deck from the selected deck
        deckName = existingDeckList.value // set deckName to the selected deck, so the loadData function can use it
        deckInput = await loadData(undefined, true)
    }

    deckInputSection.classList.add('hidden')
    deckCheckSection.classList.remove('hidden')
    loadData(deckInput).then((result) => { // input the raw deck into loadData, and it returns a list of Card objects
        allCards = result
        currentCard = nextCard()
    })
})

nextCardButton.addEventListener('click', () => {
    skipToChangesCopy()
    currentCard = nextCard()
})

skipToChangesCopyButton.addEventListener('click', () => {
    if (confirm('Biztos, hogy átlépsz a változtatások másolásához?')) {
        skipToChangesCopy(true)
    }
})

