function nextCard() {
    saveChange()

    let card = allCards.pop()
    displayCard(card)

    return card
}

function displayCard(card) {
    huWordDisplay.innerHTML = card.hu
    huWordInput.value = card.hu
    itWordDisplay.innerHTML = card.en
    itWordInput.value = card.en
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

// Save cards to localStorage
// currentCard, the checkedCards, the changedCards, the currentCardNum, the changedLastCard
function saveCards() {
    let data = {
        deckName: deckName,
        allCards: allCards.map(card => card.toData()),
        checkedCards: checkedCards.map(card => card.toData()),
        changedCards: changedCards.map(([card, str, num]) => [card.toData(), str, num]),
        currentCard: currentCard ? currentCard.toData() : null,
        currentCardNum: currentCardNum,
        changedLastCard: changedLastCard
    }
    localStorage.setItem('deckCheckState', JSON.stringify(data));
}

// Load cards from localStorage
function loadCards() {
    let data = JSON.parse(localStorage.getItem('deckCheckState'));
    if (data) {
        deckName = data.deckName
        allCards = data.allCards.map(card => Card.fromData(card));
        checkedCards = data.checkedCards.map(card => Card.fromData(card));
        changedCards = data.changedCards.map(([card, str, num]) => [Card.fromData(card), str, num]);
        currentCard = data.currentCard ? Card.fromData(data.currentCard) : null
        currentCardNum = data.currentCardNum;
        changedLastCard = data.changedLastCard;
        displayCard(currentCard)
    } else {
        console.warn("there was an error when loading the cards from localStorage")
    }
}

function updateContinueToDeckCheckButtonText() {
    let dname = JSON.parse(localStorage.getItem('deckCheckState')).deckName
    continueToDeckCheckButton.innerHTML = "Folytatás ennél a paklinál:" + dname
}

function saveChange() {
    if (currentCard !== null) {
        let checkedCard = new Card(huWordInput.value, itWordInput.value, 'hu')
        checkedCards.push(currentCard)
        let diffString = ''

        // if both inputs are empty, the card is marked to be removed
        if (huWordInput.value == '' && itWordInput.value == '') {
            diffString = 'remove'
            // the card is marked to be removed, so we won't save the empty strings as their values
            checkedCard.hu = currentCard.hu
            checkedCard.en = currentCard.en
        } else {
            diffString = isCardDifferent(currentCard, checkedCard)
        }

        if (diffString !== '') {
            changedCards.push([checkedCard, diffString, currentCardNum])
            changedLastCard.push(true)
        } else {
            changedLastCard.push(false)
        }
        currentCardNum++
    } else {
        console.warn("saveChange called when currentCard is null")
    }
}

function addChangeDisplay(huWord, itWord, index) {
    let changeColor = 'greenyellow'
    let huChanged = ''
    let itChanged = ''
    let huChangedStyle = ''
    let itChangedStyle = ''

    if (changedCards[index][1] == "remove") {
        changeColor = 'red'
        huChangedStyle = `style="color:${changeColor}"`
        itChangedStyle = `style="color:${changeColor}"`
    } else {
        huChanged = changedCards[index][1].includes('hu')
        itChanged = changedCards[index][1].includes('it')
        huChangedStyle = huChanged ? `style="color:${changeColor}"` : ''
        itChangedStyle = itChanged ? `style="color:${changeColor}"` : ''
    }

    let changeDisplay = `
        <div class="flex-column" id="change-${index}">
            <p class="max-width small-side-margin">
                <span ${huChangedStyle}class="word-wrap" id="hu-word-${index}">${huWord}</span>
                -
                <span ${itChangedStyle} class="word-wrap" id="it-word-${index}">${itWord}</span>
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
        changesDisplaySection.innerHTML = ''
        for (let i = 0; i < changedCards.length; i++) {
            addChangeDisplay(changedCards[i][0].hu, changedCards[i][0].en, i);
        }
        restoreState = changesDisplaySection.innerHTML
        localStorage.setItem('section', 2)
        localStorage.setItem('restoreState', restoreState)
        saveCards()
    }
}

let deckInputSection = document.getElementsByName('deck-input-container')[0] // the index of this section is 0
let deckCheckSection = document.getElementsByName('deck-check-container')[0] // the index of this section is 1
let changesCopySection = document.getElementsByName('changes-copy-container')[0] // the index of this section is 2
let changesDisplaySection = document.getElementsByName('changes-display-container')[0] // this isn't a new 'page'; this is where the changes are displayed WITHIN changesCopySection
let sectionTracker = 0 // keeps track of which section is currently displayed (used for storing it in localStorage, so the user can return to the same section after refreshing the page)
let deckCheckState = {} // stores the state of the deckCheckSection (the currentCard, the checkedCards, the changedCards, the currentCardNum, the changedLastCard)

let chooseFromExistingDecksButton = document.getElementById('choose-from-existing-decks-button')
let jumpToDeckCheckButton = document.getElementById('jump-to-deck-check-button')
let deckInputField = document.getElementById('deck-input-field') // the element that contains the manually added deck
let existingDeckList = document.getElementById('existing-decks-list')
let continueToDeckCheckButton = document.getElementById('continue-to-deck-check-button') // only appears if there is a saved state for deck check
let backToDeckInputButtons = document.getElementsByClassName('back-to-deck-input-button') //! This is a list not a single element
let deckInput = '' // a string that contains the name of the already existing deck which will be checked (selected with existingDeckList)
let deckName = ''

let nextCardButton = document.getElementById('next-card-button')
let undoCardbutton = document.getElementById('undo-card-button')
let skipToChangesCopyButton = document.getElementById('skip-to-changes-copy-button')
let huWordDisplay = document.getElementById('hu-word-display')
let itWordDisplay = document.getElementById('it-word-display')
let huWordInput = document.getElementById('hu-word-input')
let itWordInput = document.getElementById('it-word-input')
let allCards = []
let initialDeckLength = 0
// changedCards contains a list of this array: [card, diffString, currentCardNum] 
// (a diffstring is 'hu' or 'it' or 'huit' or 'remove'; used for displaying which side of the card was changed (or if the card was removed))
// (currentCardNum is the index of the card in the original deck)
let changedCards = []
let checkedCards = []
let currentCard = null
let currentCardNum = 0
let changedLastCard = [] // a queue that contains whether the last card was changed or not (queue because if we undo multiple times a simple bool wont do)

let restoreButton = document.getElementById('restore-button')
let copyButton = document.getElementById('copy-button')
let restoreState = `` // stores the changes in the changesDisplaySection also used for saving in localStorage
let backToDeckCheckButton = document.getElementById('back-to-deck-check-button')

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

    // prioritize manual input over the selected deck
    if (deckInputField.value) { // if the user inputted a deck manually
        deckInput = deckInputField.value
        if (!deckInput.includes("\n")) {
            console.warn('The deck input is not valid')
            return
        }
        deckName = "egyedi pakli"
    } else { // else, get the raw deck string from the selected online deck (from my github)
        deckName = existingDeckList.value // set deckName to the selected deck, so the loadData function can use it
        deckInput = await loadData(undefined, true)
    }

    deckInputSection.classList.add('hidden')
    deckCheckSection.classList.remove('hidden')
    loadData(deckInput).then((result) => { // input the raw deck into loadData, and it returns a list of Card objects
        allCards = result
        initialDeckLength = allCards.length
        currentCard = nextCard()
        localStorage.setItem('section', 1)
        checkedCards = []
        changedCards = []
        changedLastCard = []
        currentCardNum = 0
        restoreState = ``
        localStorage.setItem('restoreState', restoreState)
        saveCards()
    })
})

continueToDeckCheckButton.addEventListener('click', () => {
    deckInputSection.classList.add('hidden')
    deckCheckSection.classList.remove('hidden')
    loadCards()
})

nextCardButton.addEventListener('click', () => {
    skipToChangesCopy()

    // Save the state every 5 cards
    if (currentCardNum % 5 === 0) {
        saveCards()
    }

    if (allCards.length !== 0) {
        currentCard = nextCard()
    }
})

undoCardbutton.addEventListener('click', () => {
    if (currentCard !== null && checkedCards.length > 0) {
        allCards.push(currentCard)
        currentCard = checkedCards.pop()
        if (changedLastCard.pop()) {
            changedCards.pop()
        }
        displayCard(currentCard)
        currentCardNum--
    } else {
        console.warn("undoSaveChange called when currentCard is null, or there are no checked cards to undo to")
        return
    }
})

skipToChangesCopyButton.addEventListener('click', () => {
    if (confirm('Biztos, hogy átlépsz a változtatások másolásához?')) {
        skipToChangesCopy(true)
    }
})

changesDisplaySection.addEventListener('click', function (event) {
    if (event.target.tagName.toLowerCase() === 'button') {
        let buttonId = event.target.id;
        let index = buttonId.replace('remove-change-', '');
        let element = document.getElementById(`change-${index}`);
        if (element) {
            changesDisplaySection.removeChild(element);
            console.log('remove clicked', index);
        } else {
            console.warn(`${buttonId} was clicked, but the element was not found`);
        }
    }
});

restoreButton.addEventListener('click', () => {
    changesDisplaySection.innerHTML = restoreState
})

copyButton.addEventListener('click', () => {
    let changes = ""

    // cc is shorthand for changedCards; at this point changedCards might not be loaded in the javascript, but it should be loaded in localStorage
    cc = JSON.parse(localStorage.getItem('deckCheckState')).changedCards.map(([card, str, num]) => [Card.fromData(card), str, num])
    for (let i = 0; i < cc.length; i++) {
        let huWordContainer = document.getElementById(`hu-word-${i}`)
        let itWordContainer = document.getElementById(`it-word-${i}`)
        console.log(i, huWordContainer, itWordContainer)
        if (!huWordContainer || !itWordContainer) {
            continue
        }
        let huWord = huWordContainer.innerHTML
        let itWord = itWordContainer.innerHTML

        changes += `@${cc[i][2]}` // cc[i][2] is the index of the card in the original deck
        changes += cc[i][1] === "remove" ? "!@\n" : `@${huWord}\n${itWord}\n` // if the card was removed, we don't need to save the words
    }
    //changes = changes.slice(0, -1)
    navigator.clipboard.writeText(changes).then(() => {
        console.log('changes copied to clipboard\n' + changes)
    }, (err) => {
        console.warn('error when copying changes to clipboard', err)
    })
})

Array.from(backToDeckInputButtons).forEach((button) => {
    button.addEventListener('click', () => {
        if (confirm('Biztos, hogy visszalépsz a kártya kiválasztáshoz?')) {
            deckCheckSection.classList.add('hidden')
            changesCopySection.classList.add('hidden')
            deckInputSection.classList.remove('hidden')
            localStorage.setItem('section', 0)
            updateContinueToDeckCheckButtonText()
        }
    })
})

backToDeckCheckButton.addEventListener('click', () => {
    if (confirm('Biztos, hogy visszalépsz a kártya ellenőrzéshez?')) {
        changesCopySection.classList.add('hidden')
        deckCheckSection.classList.remove('hidden')
        localStorage.setItem('section', 1)
        loadCards()
    }
})

document.addEventListener('DOMContentLoaded', () => {
    let section = localStorage.getItem('section')
    deckInputSection.classList.add('hidden')
    deckCheckSection.classList.add('hidden')
    changesCopySection.classList.add('hidden')
    if (section) {
        section = parseInt(section)
        if (section === 0) {
            deckInputSection.classList.remove('hidden')
            if (localStorage.getItem('deckCheckState')) {
                updateContinueToDeckCheckButtonText()
                continueToDeckCheckButton.classList.remove('hidden')
            } else {
                continueToDeckCheckButton.classList.add('hidden')
            }
        } else if (section === 1) {
            deckCheckSection.classList.remove('hidden')
            loadCards()
        } else if (section === 2) {
            changesCopySection.classList.remove('hidden')
            restoreState = localStorage.getItem('restoreState')
            changesDisplaySection.innerHTML = restoreState
        }
    }
})

document.addEventListener('beforeunload', () => {
    if (localStorage.getItem('section') === '1') {
        console.log("saving before unloading the page")
        saveCards()
    }
})