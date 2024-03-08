import mwparserfromhell
from bs4 import BeautifulSoup
import json


inputfilepath = "WP-Userboxes-Text.xml"
# inputfilepath = "snippet.txt"

info_values = []


i = 0
j = 0



def append_to_list(titles, info):
    # Create a new structure

    new_item = {"title": titles, "info": info}
    info_values.append(new_item)

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
    # Return None if no Userbox template or "info" parameter is found
                    return stripped_text









with open(inputfilepath, 'r') as file:
      soup = BeautifulSoup(file, 'html.parser')
      for page_element in soup.find_all('page'):
        template_text = page_element.get_text()
        for title_element in page_element.find_all('title'):
          title = title_element.get_text()
          titles = title
        

        j = j+1
        print("page no:", j)
        info = extract_info_from_userbox(template_text)
        append_to_list(titles, info)


json_data = json.dumps(info_values)

with open("output.json", "w") as outputfile:
  # for item in info_values:
     outputfile.write(str(json_data) + '\n')
print("done")
# print(info_values)

# print()
# len(info_value)

