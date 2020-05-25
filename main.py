import networkx as nx
import matplotlib.pyplot as plt
import json

with open('./data/players.json') as f:
    players = json.load(f)
    labels = {val['id']: val['fate'] for val in players}
    p = [val['id'] for val in players if val['isTown']]
    p_maf = [val['id'] for val in players if not val['isTown']]

G = nx.read_edgelist('./data/edges.edgelist', nodetype=int, data=(('weight', float),))

with open('./data/game.txt') as f2:
    f2.readline()
    game = f2.readline().strip()

# G = nx.Graph()
# G.add_nodes_from(p)
# G.add_edges_from(edges)

elarge = [(u, v) for (u, v, d) in G.edges(data=True) if d['weight'] > 48]
esmall = [(u, v) for (u, v, d) in G.edges(data=True) if d['weight'] <= 48]

# # drawing
pos = nx.spring_layout(G, k=2.0)

# # town nodes
nx.draw_networkx_nodes(G, pos, p, node_size=666, node_color="#00ff00")

# # mafia nodes
nx.draw_networkx_nodes(G, pos, p_maf, node_size=666, node_color="#ff0000")

# # edges with strong ties
nx.draw_networkx_edges(G, pos, edgelist=elarge, width=4)

# # edges with weak ties
nx.draw_networkx_edges(G, pos, edgelist=esmall, width=2, alpha=0.5, style='dashed')
nx.draw_networkx_labels(G, pos, labels=labels, font_size=9, font_family='sans-serif')

plt.axis('off')
# plt.show()
plt.margins(.1)
plt.savefig('./plots/{}.png'.format(game))
