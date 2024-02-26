"""
Removes empty lines from a txt file.
"""

path = input("Paste in the path\n")
with open(path, "r") as file:
    input_string = file.read()
input_list = []

for line in input_string.split("\n"):
    if line.strip() != "":
        input_list.append(line)

output_string = "\n".join(input_list)
print("Output string is:\n" + output_string)
ans = input("Do you want to save this to the file? (y/n) ")
if ans.lower() == "y":
    with open(path, "w") as file:
        file.write(output_string)
    print("File saved.")
