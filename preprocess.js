const levenshtein = require('js-levenshtein');
var fs = require('fs');

function parseSlots(_info) {
    let data = _info.map((info, id) => {
        let metadata = info.split(",")
        let fate = metadata[metadata.length-1].toLowerCase()
            .replace('killed', 'K')
            .replace('lynched', 'L')
            .replace('night ', 'n')
            .replace('day ', 'd')
        return {
            id: id + 1,
            alias: metadata[0].split("replaced").map(x => x.trim()),
            isTown: metadata[1].includes("Town"),
            fate
        }
    })

    fs.writeFileSync('./data/players.json', JSON.stringify(data))
    return data;
}

function preprocess(slots, RawVotes) {
    let processed = []
    slots.forEach(slot => {
        let votes = RawVotes.filter(x => slot.alias.includes(x.author))

        for(let i = 0, j = 1; j < votes.length; i++, j++) {
            let voter = votes[i].author
            let vote = votes[i].content
            let isUnvote = vote.toLowerCase().includes("unvote")
            let votee = vote.split(": ")[1]
            let duration = new Date(votes[j].date) - new Date(votes[i].date)
            let postDelta = votes[j].post - votes[i].post

            // filter out unvotes
            !isUnvote && processed.push({
                id: slot.id, voter, votee, duration, postDelta
            })

            // include the last vote (duration cannot be calculated)
            if(j === votes.length - 1) {
                processed.push({
                    id: slot.id,
                    voter: votes[j].author,
                    votee: votes[j].content.split(": ")[1],
                    duration: null,
                    postDelta: 1
                })
            }
        }
    });

    // let data = JSON.stringify(processed)
    // fs.writeFileSync('./data/processed.json', data)
    return processed;
}

function intendedTarget(votee, slots) {
    votee = votee.toLowerCase()
    let playerId = null;
    slots.forEach(slot => {
        // check for full substring matches first
        // since this *seems* the more common pattern
        slot.alias.forEach(name => {
            if (name.toLowerCase().includes(votee)) {
                playerId = slot.id;
            }
        })

        if(!playerId) {
            // if no sub string match, check edit distance
            // could have multiple matches, should take the smallest distance
            slot.alias.forEach(name => {
                if (levenshtein(votee, name.toLowerCase()) <= 3) {
                    playerId = slot.id;
                }
            })
        }
    })

    return playerId;
}

module.exports = {
    parseSlots,
    preprocess,
    intendedTarget
}