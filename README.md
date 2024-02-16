# Flashcards

Flashcards to help with studying new words/definitions

## How it works

- If you want to learn words or definitions then it's a good idea to use Flashcards.
- How it works is that you put all the words/definitions on flashcards and then you put them in a deck. The decks available are listed on the front page of the website.
  - Right now only hungarian-english/italian learning cards are available
  - Contact me if you want me to upload your deck as well, more on that in the next section
- Then you start pulling them out and trying to guess what's on the other side (what is the translation of the word/what is the definition of something you get the point)
- You can click on the card to flip it to reveal what's on the other side
- If you got it right, you put it in the _know-deck_ with the tick button and if you didn't, you put it in the _not-know-deck_ with the X button (creative naming I know)
- You can also undo your last action if you misclicked or just want to take a second look.
- After you went through the deck, it gets reshuffled, but only with the cards you didn't know
- If at any point you want to leave the website or go to a different deck, you can do so, since it automatically saves when you exit (however, it doesn't if your power runs out, or you force-exit)

## Submitting decks

You can submit your deck in as text, currently only using the _one word one line_ format, where you put each piece of information in a new line
Example:

> Sum  
> The result of adding two or more numbers.  
> Difference  
> The result of subtracting one number from another.  
> Product  
> The result of multiplying two or more numbers.  
> Quotient  
> The result of dividing one number by another.

In the future I plan to add more formats, with the goal of making the format customizable

## TODO

- [ ] make a program that reads the decks in the decks folder so I can just copy it and paste it into the js
- [ ] make it so the user can chose how many words to learn
- [ ] make it so I can send a notification to everyone currently using the website to ask them to reload, because I changed stuff
- [ ] Fix a bug where the progress bar doesn't display stuff properly after starting a new pack (I think; idk how to replicate)
- [ ] Make a color flash animation for undoing (?)
- [ ] Make folders for the words so they're not all spat out at one place
- [ ] Make tests for the words so the user can guess the word from multiple choices
- [ ] Make the default side customizeable
- [ ] When reshuffling, make it optional to exclude the know-deck
- [ ] make it so reading the deck from the txt file is more versitile, so the user doesn't have to use the format of _one word one line_
- [ ] make it so the card animates when know or not-know button is clicked: if know, then it goes away, if not know, it goes to the back of the deck
- [ ] add a button to listen to the word
- [x] make a program that checks the txt file and notifies if there are odd number of lines or there's an italan word ending with e (so I can check if I wrote the article [névelő] for it), and other things maybe
- [x] make it so it saves players' progress
- [x] make it so undo undoes even if I pressed an action button at the end of a deck (because normally it creates a new deck, and there's no logic to undo that rn)
- [x] display for example the player is at 6/51
- [x] add confimation for going back to menu (!!)
- [x] make it so all words start with uppercase letter (handle cases if the word doesn't start with a letter, but maybe js handles it already idk)
- [x] make it so the card is flipped to its 'hu' side when an action button is pressed or when it get's displayed (because otherwise, if I put it into the not-know deck, when it comes up again, it will be flipped to the wrong side)
- [x] have some sort of indication that all the words have been learned
- [x] make it so when pressing the tick or the x button, the card turns green or red for a brief moment with a nice animation
