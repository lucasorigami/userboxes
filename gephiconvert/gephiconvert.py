import json
import networkx as nx

# Load D3.js JSON data from a separate JSON file
with open('/Users/lucas/Documents/GDA/S2/CM/data userboxes/gephiconvert/data.json', 'r') as file:
    d3_data = json.load(file)

# Create a new NetworkX graph
G = nx.Graph()

# Add nodes from D3.js JSON data to the NetworkX graph
for node in d3_data['nodes']:
    node_id = node['id']
    node_group = node.get('group', '')  # Get the 'type' field or set to empty string if not present
    node_label = node.get('info', node_id)  # Get the 'info' field or use ID as label if 'info' is missing

    G.add_node(node_id, type=node_group, label=node_label)

# Add edges from D3.js JSON data to the NetworkX graph
for link in d3_data['links']:
    G.add_edge(link['source'], link['target'])

# Export the NetworkX graph to a Gephi-compatible format (e.g., GEXF)
nx.write_gexf(G, 'gephi_graphv2.gexf')
