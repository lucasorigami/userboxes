import mwparserfromhell
from bs4 import BeautifulSoup
import json
import requests



S = requests.Session()
URL = "https://en.wikipedia.org/w/api.php"


inputfilepath = "WP-Userboxes-Text.xml"
# inputfilepath = "snippet.txt"

info_values = []
transcluded = []

i = 0
j = 0



def append_to_list(titles, info, transcluded):
    # Create a new structure
    info_values.append({"title": titles, "info": info, "transcluded": transcluded.copy()})
    transcluded.clear()

# ==== GET TRANSCLUDE ====



          
def get_transcluded_pages(titles):
  last_continue = {}
  searchtransclude = titles
  PARAMS = {
    "action": "query",
    "titles" : searchtransclude,
    "prop": "transcludedin",
    "format": "json",
    "tinamespace": "2",
    "tilimit": "50",
    "API_KEY": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzYzYwOTk1MDcxMWQ5MjgyNTRlMmEzNTYwYjEyZDRhNSIsImp0aSI6IjVjYmY4ZTY3OWE0NDg5MGEwMDAyMjZjYzEzZDZlOTQ3YTYwZDk1OWY1MGViMzEwZTJhYjc4MGM1ZjIwNTc0OGE5NWMwZjk4NWU0N2Y2NmE4IiwiaWF0IjoxNzA5ODk3NzAyLjA3NDgxLCJuYmYiOjE3MDk4OTc3MDIuMDc0ODEzLCJleHAiOjMzMjY2ODA2NTAyLjA3MzYyNCwic3ViIjoiNTA2MzgwNTMiLCJpc3MiOiJodHRwczovL21ldGEud2lraW1lZGlhLm9yZyIsInJhdGVsaW1pdCI6eyJyZXF1ZXN0c19wZXJfdW5pdCI6NTAwMCwidW5pdCI6IkhPVVIifSwic2NvcGVzIjpbImJhc2ljIl19.FHMEb81K-A5shKE5YZZQ75LocL-WlVSdyDY2TqDoygFclTGGR1MiOK_BQNYK2IIoJLj5Zwdj-wqwP_YlvadroqJhG3PlPw2BNKMnaAO1XT9BNv6WJiDbpt2hcoFclNcTuXKh_CfkmhQAtSQYBue-7trO7KP4LrmrdKQq1zE77jPNXxX5qgzAIM4N6V0weGP7FKuyjRgxneUtILpQIzndEbFRWmV7RbsaKrorRQ5XLeqpD-4xbNXE_V2WRSIgKLMzdmtkA21ZCJJpgh3r6_CswnsWuEBl8YyPfyJCJtC72vK8qqG7brQrIhp7w0eyec2s2BR8kKuDRsA9kV7rjukgBbrQZXtnOGmPzfHejArYXLriXEh-5M5PnHk8YIkgjeJpr0nMBdRxmaJn9_UlFIF9A_AYpcFZvY68EDRDYFusaaLUuvgO1W02TthSPTy7CGQwwDDtNQp7LsaIb2ZTKs_rgDj_5EsSDFIo1cd7i_t0UH-fPAmDm8qY9dYVHLwHG2K67_6zPinCWDtjsuXctG4ApXc4riciTf0yMZckeQbbf_tMEy0sFQx978qiHXpEYNyCrfVrG6NrFPCHhv5BFzdR85Dkuj_awgDkf-jCc45B4NkLJbc2QryvH3m7rBlsf3tzNFuSESJ8p8KEqDcNohK1HHRC4C1z_KfSxDHgjhh0Z6E"
  }

  while True:
    req_params = PARAMS.copy()
    req_params.update(last_continue)  # Update parameters with 'continue' values
    R = S.get(url=URL, params=req_params)
    DATA = R.json()

    UP_titles = [item['title'] for page in DATA['query']['pages'].values() for item in page.get('transcludedin', [])]

    # with open('output_titles.txt', 'a') as output_file:  # Append mode to avoid overwriting
    #     for title in UP_titles:
    #         output_file.write(title + '\n')

    for title in UP_titles:
      transcluded.append(title)
    if 'continue' not in DATA:
        break

    last_continue = DATA['continue']  # Update 'continue' parameter for next iteration




def extract_info_from_userbox(template_text):
    # Parse the template text using mwparserfromhell
    wikicode = mwparserfromhell.parse(template_text)
    print("parsing wikicode...")
    # Iterate through templates in the wikicode
    for template in wikicode.filter_templates():
        # Check if the template is a Userbox template
        if template.name.matches("Userbox") or template.name.matches("userbox") or template.name.matches("Userbox-2") or template.name.matches("userbox-2"):
            # Check if the template has an "info" parameter
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
        # check if info isn't empty
        if info:
          get_transcluded_pages(titles)
          append_to_list(titles, info, transcluded)
        # transcluded.clear()  






# ==== EXPORT ====


json_data = json.dumps(info_values)

with open("output.json", "w") as outputfile:
  # for item in info_values:
     outputfile.write(str(json_data) + '\n')
print("done")
# print(info_values)

# print()
# len(info_value)

