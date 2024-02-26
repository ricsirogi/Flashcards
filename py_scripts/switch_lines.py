"""
This program switches the even and odd lines of a txt file.
example:
1
2
3
4
5
6
turns into:
2
1
4
3
6
5
"""

path = input("Paste in the path\n")

input_string = ""
with open(path, "r") as file:
    input_string = file.read()

input_list = input_string.split("\n")
output_list = []
for i in range(0, len(input_list), 2):
    output_list.append(input_list[i + 1])
    output_list.append(input_list[i])

output_string = "\n".join(output_list)
print("Output string is:\n" + output_string)

ans = input("Do you want to save this to the file? (y/n) ")
if ans.lower() == "y":
    with open(path, "w") as file:
        file.write(output_string)
    print("File saved.")
