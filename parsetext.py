import mwparserfromhell
from bs4 import BeautifulSoup

# if you only run the short snippet, there's nothing wrong with it. 
file = open("snippet.txt", "r")


# If you run the code through the full text you'll get useless information after "This User likes Classic Literature"
# file = open("WP-Userboxes-Text.xml", "r")



template_text = file.read()


info_values = []




def extract_info_from_userbox(template_text):
    # Parse the template text using mwparserfromhell
    wikicode = mwparserfromhell.parse(template_text)
    print("parsing wikicode...")
    # Iterate through templates in the wikicode
    for template in wikicode.filter_templates():
        # Check if the template is a Userbox template
        if template.name.matches("Userbox"):
            # Check if the template has an "info" parameter
            # print(template.params)
            for param in template.params:
                if param.name.matches("info"):
                    print("getting info parameter...")
                    # Extract the value of the "info" parameter
                    info_value = template.get("info").value.strip()

                    # Clean HTML from info tag
                    print("cleaning HTML from info...")
                    soup = BeautifulSoup(info_value, 'html.parser')
                    plain_text = soup.get_text(separator=' ', strip=True)

                    # Cleaning Wikitext from info tag
                    print("cleaning WikiText from info...")
                    wikicode = mwparserfromhell.parse(plain_text)
                    stripped_text = wikicode.strip_code()
                    info_values.append(stripped_text)

    # Return None if no Userbox template or "info" parameter is found
    return info_values



# Get Array, and put every item on new line. 
info_value = extract_info_from_userbox(template_text)
info_value = "\n".join(info_value)
outputfile = open("output.txt", "w")
outputfile.writelines(info_value)
print("done")

# print()
# len(info_value)

