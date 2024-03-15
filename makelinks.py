import json

file = open("smoll.json", "r")
DATA = json.load(file)

fromto = []

def append_to_fromto(source, target): 
    fromto.append({"source": source, "target": target})

for item in DATA:
    source = item.get("title")
    transclude = item.get("transcluded")
    print(transclude)  
    for item in transclude:
        target = item 
        append_to_fromto(source, target)

with open("fromtosmall.json", "w") as outputfile:
    json.dump(fromto, outputfile, indent=4)  # Write the data as JSON
print("done")
