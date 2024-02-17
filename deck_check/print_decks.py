"""
This program prints out all the decks in the decks folder 
in a way that I can just copy and paste it into menu.js
"""

import glob
import os

current_dir = os.path.dirname(__file__)
root_dir = os.path.dirname(current_dir)
decks_dir = os.path.join(root_dir, "decks")

txt_files = glob.glob(decks_dir + "/*.txt")

# Get only the filenames
filenames = [os.path.basename(txt)[0:-4] for txt in txt_files]

print(filenames)