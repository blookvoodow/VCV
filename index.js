var {parseGameInfo, scrapVotes} = require('./voteScrapper');
var {parseSlots, preprocess, intendedTarget} = require('./preprocess');
var fs = require('fs');

(async function () {
    let filename = './data/edges.edgelist';

    // players info
    let {thread, players} = parseGameInfo()
    console.log('parsed game info')

    // raw votes
    let rawVotes = await scrapVotes(thread)
    console.log('scrapped votes')

    // let data = JSON.stringify(rawVotes)
    // fs.writeFileSync('./data/posts.json', data)

    let slots = parseSlots(players)
    let votes = preprocess(slots, rawVotes)

    // generates an edge list from vote data
    // voter id, votee id, weight
    let edges = []
    votes.forEach(vote => {
        let playerId = intendedTarget(vote.votee, slots)
        edges.push([vote.id, playerId, vote.postDelta])
    })
    console.log('edgelist generated')

    // let data = JSON.stringify(edges)
    // fs.writeFileSync('./data/edges.json', data)

    fs.truncateSync(filename)
    edges.forEach(edge => {
        if(!edge.includes(null)) {
            let text = edge.join(' ') + '\n'
            fs.appendFile(filename, text, 'utf-8', () => {})
        }
    });

}());
