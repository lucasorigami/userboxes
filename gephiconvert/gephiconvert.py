
import json
import networkx as nx

# Load D3.js JSON data
with open('/Users/lucas/Documents/GDA/S2/CM/data userboxes/gephiconvert/data.json', 'r') as file:
    d3_data = json.load(file)

# Create a new NetworkX graph
G = nx.Graph()

# Add nodes from D3.js JSON data to the NetworkX graph
for node in d3_data['nodes']:
    G.add_node(node['id'])

# Add edges from D3.js JSON data to the NetworkX graph
for link in d3_data['links']:
    G.add_edge(link['source'], link['target'])

# Export the NetworkX graph to a Gephi-compatible format (e.g., GEXF)
nx.write_gexf(G, 'gephi_graph.gexf')
