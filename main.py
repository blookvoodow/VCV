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

e20 =  [(u, v) for (u, v, d) in G.edges(data=True) if d['weight'] >= 30]
e100 = [(u, v) for (u, v, d) in G.edges(data=True) if d['weight'] >= 150]
e400 = [(u, v) for (u, v, d) in G.edges(data=True) if d['weight'] >= 500]
e800 = [(u, v) for (u, v, d) in G.edges(data=True) if d['weight'] >= 800]
esmall = [(u, v) for (u, v, d) in G.edges(data=True) if d['weight'] < 30]

# # drawing
pos = nx.spring_layout(G, k=2.0)

# # town nodes
nx.draw_networkx_nodes(G, pos, p, node_size=500, node_color="#00ff00")

# # mafia nodes
nx.draw_networkx_nodes(G, pos, p_maf, node_size=600, node_color="#ff0000")

# # edges with strong ties
nx.draw_networkx_edges(G, pos, edgelist=e800, width=6.0, alpha=1.0)
nx.draw_networkx_edges(G, pos, edgelist=e400, width=4.0, alpha=0.9)

# # edges with weak ties
nx.draw_networkx_edges(G, pos, edgelist=e100, width=3.0, alpha=0.7)
nx.draw_networkx_edges(G, pos, edgelist=e20, width=2.5, alpha=0.6, style='dashed')
nx.draw_networkx_edges(G, pos, edgelist=esmall, width=2.0, alpha=0.5, style='dotted')

# labels
nx.draw_networkx_labels(G, pos, labels=labels, font_size=9, font_family='sans-serif')

plt.title(game)
plt.axis('off')
# plt.show()
plt.margins(.1)
plt.savefig('./plots/{}.png'.format(game))
