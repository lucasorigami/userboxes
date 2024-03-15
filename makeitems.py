import json

file = open("smoll.json", "r")
DATA = json.load(file)

fromto = []

def append_userbox(title, info): 
    fromto.append({"id": title, "info": info, "group": "userbox"})

def append_userpage(user): 
    fromto.append({"id": user, "group": "user"})


for item in DATA:
    title = item.get("title")
    info = item.get("info")
    append_userbox(title, info)
    transclude = item.get("transcluded")
    print(transclude)  
    for item in transclude:
        user = item
        append_userpage(user)

with open("itemssmall.json", "w") as outputfile:
    json.dump(fromto, outputfile, indent=4)  # Write the data as JSON
print("done")
