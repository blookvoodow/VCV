## Vote Count Visualization
This project aims to visualize the votes cast amongst players as a **Weighted Undirected Graph**.


### Graphical Representation
*Node*

Each node in the network represents a player slot in the game. Each node includes all the replacements to a particular slot.

*Edge*

Each edge in the network represents a vote cast from one node to another. For simplicity, edges are undirected, meaning if two players cross-vote one another, only one edge will exist between them. However, edges are more complicated than nodes since weights are attached to them.

*Weight*

As the network is weighted, the weight of an edge represents the severity of conflicts between two nodes. Since an edge presents a vote, and votes are used for pressuring or lynching a player, it can be interpreted that the higher the weight, the higher the degree of conflict.

Weights are calculated based on duration of the vote. The reasoning is that votes generate pressure and may or may not start wagons. Therefore, the longer the vote is cast, the greater the pressure and the degree of conflict between the two players. Of course, this may not always be the case, but our assumption is the voters will be forced to defend their votes when confronted by other players, and they will either retract their votes or keep their votes as a result.

Weights are measured in milliseconds and normalized by 1 hour.

### Further Work

There are a number of ways to improve the calculation of weights.
1. Detect and assign greater weights to L-2, L-1, and hammer votes.
2. Normalize weights based on an exponential function instead of a linear one. E.g. a vote will generate increasing amount of weight as time goes on, instead of always generating a fixed amount of weight per time.
