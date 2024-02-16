"""
This program checks the input txt file of the deck.
Factors it checks:
If the deck is italian, checks if all nouns ending with e have an article before them 
Removes empty lines from the end
And maybe others as well
The program also allows you to modify the word, so you can write in the article or make exceptions for specific words
"""
import os
import glob
import json

class WordError():
    def __init__(self, word:str, error:str):
        self.word = word
        self.error = error

def choose_deck(all_decks:list[str]):
    """
    Prints out the available decks and prompts the user to choose one
    """
    while True:
        print("Choose a deck:")
        for i, deck_name in enumerate(all_decks):
            print(f"{i+1} - {deck_name}")
        ans = input()
        #! I should make something to check if the modified version already exists
        if ans.isdigit() and int(ans) in range(1, len(all_decks)+1): # user chose a deck
            # Make a copy of the deck file
            with open(current_dir + "\\" + all_decks[int(ans)-1] + "_modified.txt", "w") as copy:
                with open(decks_dir + "\\" + all_decks[int(ans)-1] + ".txt", "r") as original:
                    copy.write(original.read())
            return all_decks[int(ans)-1]
        else:
            print("Invalid choice\n")

def check_deck(deck_str: str) -> list[WordError]:
    """
    Takes deck name as input and returns a list of tuples
    where the first element of the tuple is the word
    and the second element of the tuple is the error message
    Also automatically removes empty lines from the end of the txt file
    """
    # Read the deck file
    deck_lines = []
    with open(current_dir + "\\" + deck_str + "_modified.txt", "r") as file:
        deck_lines = file.readlines()

    # Read the exceptions file
    exceptions = []
    try:
        with open(current_dir+ "\\exceptions.json", "r") as file:
            exceptions = json.load(file)[deck_str]
    except KeyError:
        temp = {}
        with open(current_dir+ "\\exceptions.json", "r") as file:
            temp = json.load(file)
        with open(current_dir + "\\exceptions.json", "w") as file:
            temp[deck_str] = []
            json.dump(temp, file)
    
    # remove empty lines
    deck_lines = [line.strip() for line in deck_lines if line.strip() != ""] 
    with open(current_dir + "\\" + deck_str + "_modified.txt", "w") as file:
        file.write("\n".join(deck_lines))

    # Check for errors
    word_errors = []
    for line_num, line in enumerate(deck_lines):
        if line in exceptions or line_num % 2 == 0:
            continue
        if deck_str[-2:] == "it":
            if line[-1] == "e" and (line[0:2].lower() not in ["l'", "la", "lo", "il", "le", "la", "i "])and line[0:3] != "gli":
                word_errors.append(WordError(line, "Word ending with e without an article"))
    return word_errors

def add_exception(deck_name:str, changes:list[tuple[str,str]]) -> bool:
    """
    Adds an exception to the deck
    Changes: list of changes made, sorts through them, because not all changes are adding to exceptions
    Retruns whether the exception was added or not
    """
    with open(current_dir + "\\"+ "exceptions.json", 'r') as f:
        data = json.load(f)

    # Go through the changes and add the exceptions to the exceptions file
    before = data[deck_name].copy()
    for change in changes:
        if "Exception" in change[1]:
            if change[0] not in data[deck_name]:
                data[deck_name].append(change[0])

    if before == data[deck_name]: # Return false if no exceptions were added
        return False

    with open(current_dir + "\\"+ "exceptions.json", 'w') as f:
        json.dump(data, f)

    return True

def modify_deck(deck_name:str, word:str, new_word:str):
    """
    Modifies the (_modified) deck by modifying a word in it
    """
    deck_lines = []
    with open(current_dir + "\\" + deck_name + "_modified.txt", "r") as file:
        deck_lines = file.readlines()
    for count, line in enumerate(deck_lines):
        if line.rstrip("\n") == word:
            deck_lines[count] = new_word + "\n"
            with open(current_dir + "\\" + deck_name + "_modified.txt", "w") as file:
                file.write("".join(deck_lines))

def modify_original_deck(deck_name:str):
    with open(current_dir + "\\" + deck_name + "_modified.txt", "r") as copy:
        with open(decks_dir + "\\" + deck_name + ".txt", "w") as original:
            original.write(copy.read())

def ask_for_change(deck_name:str, word_error:list[WordError], start:int = 0, recursive_changes=[]) -> list[tuple[str, str]]:
    """
    Goes through a list of WordErrors and asks the user if they want to change the word
    Returns the list of changes made
    """
    changes:list[tuple[str,str]] = recursive_changes
    print("was called,", start, recursive_changes)
    for count, error in enumerate(word_error):
        if count < start:
            continue
        print(f"\n\nWhat do you want to do with the word {error.word}?")
        print("1 - Add to exceptions")
        print("2 - Add an article before the word")
        print("3 - Replace the word")
        print("4 - Undo")
        print("5 - Skip")
        print("6 - Stop")
        print("7 - Reset exceptions (restarts the session)")
        ans = input(" ")
        if ans == "1": # Exception
            print(f"Exception added for {error.word}")
            changes.append((error.word, "Exception added"))
            # These continues at the end of the options are important, because they skip the end of this loop
            # Look at the as break in switch statements
            continue 

        elif ans == "2": # Add article
            while True:
                article = input("What article do you want to add? ").rstrip(" ") 
                article += " " if article[-1] != "'" else "" # If the article is l' then it won't add the space

                ans = input(f"The new word will be {article}{error.word}\nIs this correct? (y/n) ")
                if ans.lower() == "y":
                    # the shorthand if statement is there so if the article is l' then it wont add the space
                    modify_deck(deck_name, error.word, article + error.word)
                    print(f"Added '{article}' article to {error.word}")
                    changes.append((error.word, f"Article added: {article}"))
                    break
            continue
        elif ans == "3": # Replace word
            new_word = input("What do you want to replace the word with? ")
            ans = input(f"The new word will be {new_word}\nIs this correct? (y/n) ")
            if ans.lower() == "y":
                temp = error.word.rstrip('\n') # I can't write this in the f-string, so I'll write it here
                print(f"Word replaced from {temp} to {new_word}")
                changes.append((error.word, f"Replaced with: {new_word}"))
                modify_deck(deck_name, error.word, new_word)
            continue
        elif ans == "4":
            if not changes:
                print("No changes to undo")
                continue
            else:
                undo_change(deck_name, changes.pop())
                # Alright this might get complicated. At this point I undid the change, so I need to ask this word again
                # So I have to call this function again, but with the start parameter set to the current count
                # Then the function will continue the work, and return the changes made
                changes.extend(ask_for_change(deck_name, word_error, count-1, changes)) #type:ignore

            return changes # It's important to return here, because at this point the changes have been made in the previous line
        elif ans == "5":
            continue
        elif ans == "6":
            return changes
        elif ans == "7":
            ans = input("Are you sure you want to reset all exceptions? (y/n) ")
            if ans.lower() == "y":
                with open(current_dir + "\\"+ "exceptions.json", 'r') as f:
                    data = json.load(f)
                data[deck_name] = []
                with open(current_dir + "\\"+ "exceptions.json", 'w') as f:
                    json.dump(data, f)
                changes.append(("All exceptions", "Reset"))
                return changes
            
        if not ans.isdigit() or (ans.isdigit() and int(ans) not in range(1,8)): # Print invalid choice if the choice is invalid
            print("Invalid choice")
        changes.extend(ask_for_change(deck_name, word_error, count, changes)) #type:ignore
        return changes

    return changes

def undo_change(deck_name:str, change:tuple[str, str]):
    """
    Undoes a change made to the deck
    """
    if change[1] == "Exception added":
        # I don't need to do anything here, 
        # because I would just need to remove the exception from the changes list, 
        # but I already did that when I called this function
        pass
    elif "Article added" in change[1]:
        # I get the article by getting the text after the "Article added: " text (in changes[1])
        # I index 15, because "Article added: " is 15 characters long 
        # (so it will start exactly at the beginning of the article)
        article = change[1][15:]
        word_with_article = article + change[0]
        no_article_word = change[0]

        modify_deck(deck_name, word_with_article, no_article_word)
    elif "Replaced with: " in change[1]:
        unchanged_word = change[0]
        changed_word = change[1][15:] # I get this the same way I get the article; see: above

        modify_deck(deck_name, changed_word, unchanged_word)
    else:
        print("Hmm what is this change?", change)

def check_diff(deck_name:str):
    """
    Checks the difference between the original deck and the modified deck
    """
    with open(current_dir + "\\" + deck_name + "_modified.txt", "r") as modified:
        with open(decks_dir + "\\" + deck_name + ".txt", "r") as original:
            modified_lines = modified.readlines()
            original_lines = original.readlines()
            for i in range(len(modified_lines)):
                if modified_lines[i] != original_lines[i]:
                    print(f"Original: {original_lines[i]}Modified: {modified_lines[i]}")

current_dir = os.path.dirname(__file__)
root_dir = os.path.dirname(current_dir)
decks_dir = os.path.join(root_dir, "decks")

deck_names = glob.glob(os.path.join(decks_dir, '*.txt'))

deck_names = [os.path.basename(deck)[0:-4] for deck in deck_names] # list of deck names

while True: # Program loop
    print("\n\n\n" + "*"*10,"Welcome to the deck checker","*"*10,"\n")
    checked_deck = choose_deck(deck_names)
    word_errors = check_deck(checked_deck)
    if word_errors:
        print(f"Deck {checked_deck} has the following errors:")
        for error in word_errors:
            print(f"{error.word} - {error.error}")
        ans = input("\nDo you want to change the deck? (y/n) ")
        if ans == "y":
            changes = list(set(ask_for_change(checked_deck, word_errors, 0, []))) # remove duplciate changes like this cuz im lazy
            print()
            print("Changes made:")
            for change in changes:
                print(f"{change[0]} - {change[1]}")
            while True:
                ans = input("Do you want to save the changes? (y/n) ")
                if ans.lower() == "y":
                    print()
                    add_exception(checked_deck, changes)
                    modify_original_deck(checked_deck)
                    print("Changes saved")
                    break
                elif ans.lower() == "n":
                    print("Changes not saved")
                    break
                else:
                    print("Invalid choice")

    else:
        print()
        print(f"Deck {checked_deck} is error free")
        check_diff(checked_deck)

"""
dummy_it.txt original (for testing)
asd1
gdfgdfe
asd2
geergerge
asd3
grthjhgfe
asd4
fhgjhdsfge
asd5
ghdfhdfgsdfe
asd6
hbfgbsxsdfe
asd7
dfgdfgdfgdfe
asd8
dfgdfgjdfge
asd9
dfhdhsfsdfe
asd10
dfhdfgsfadsfe
asd11
dfgdfhfgjde
asd12
imaworde
"""