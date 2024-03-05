"""
This program prints out all the decks in the decks folder 
in a way that I can just copy and paste it into menu.js

also it can automatically write the decks to allDecks.json
"""

import glob
import os
import json

current_dir = os.path.dirname(__file__)
root_dir = os.path.dirname(current_dir)
decks_dir = os.path.join(root_dir, "decks")

txt_files = glob.glob(decks_dir + "/*.txt")

# Get only the filenames
filenames = [os.path.basename(txt)[0:-4] for txt in txt_files]

ans = input("separately or all together? (s/a)")

if ans.lower() == "s":
    for filename in filenames:
        print(filename)
elif ans.lower() == "a":
    print(filenames)

ans = input("write to allDecks.json? (y/n)")

if ans == "y":
    with open(os.path.join(decks_dir, "allDecks.json"), "w") as f:
        f.write("")
        json.dump({"decks": filenames}, f)
    print("allDecks.json written")
