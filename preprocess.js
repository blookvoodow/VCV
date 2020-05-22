var fs = require('fs');
const levenshtein = require('js-levenshtein');
let fc = fs.readFileSync('./data/posts.json');

// let playerInfo = [
//     "pisskop replaced Redemption, Vanilla Townie, killed Night 4",
//     "Jesus Louisus replaced Psyche replaced Zuckerberg, Vanilla Townie, killed Night 5",
//     "Performer, Town 2-shot Vigilante, lynched Day 4",
//     "Not_Mafia, Mafia Neapolitan, lynched Day 6",
//     "Detective Pikachu, Mafia Nurse, lynched Day 1",
//     "nomnomnom replaced ChannelDelibird, Town Doctor, killed Night 1",
//     "chennisden replaced Gamma Emerald, Town Multitasking Compulsive-Fruit Vendor Compulsive-Visitor, killed Night 1",
//     "LuckyOtter, Town Tracker, killed Night 2",
//     "bob3141 replaced MaryJoLisa, Mafia Multitasking Compulsive-Fruit Vendor Fruit Vendor Enabler Visitor Enabler, lynched Day 2",
//     "Vorkuta, Vanilla Townie, lynched Day 3",
//     "Lil Uzi Vert, Town Mason, survived and won",
//     "PenguinPower, Town Mason Multitasking Compulsive-Fruit Vendor Compulsive-Visitor, killed Night 3",
//     "schadd_, Vanilla Townie, survived and won"
// ]

let playerInfo = [
    "nomnomnom, Mafia 1-shot Strongman, survived and won",
    "pisskop replaced Cinnamon, Town 1-shot Bulletproof Miller, lynched Day 4",
    "NerfedBuJ, Vanilla Townie, killed Night 2",
    "skitter30, Vanilla Townie, endgamed",
    "u r a person 2, Mafia Goon, lynched Day 2",
    "Saladman27, Vanilla Townie, lynched Day 3",
    "teacher, Town Doctor, killed Night 2",
    "Dunnstral, Town JOAT (Neapolitan, Vigilante), killed Night 3",
    "Nero Cain, Town Rolecop, endgamed",
    "Shoshin replaced EvilDeanius, Vanilla Townie, killed Night 1",
    "Creature replaced Detective Pikachu, Vanilla Townie, endgamed",
    "Flubbernugget, Vanilla Townie, lynched Day 1",
    "Vorkuta, Mafia Encryptor, survived and won"
]

function parseSlots(_info) {
    let data = _info.map((info, id) => {
        let metadata = info.split(",")
        let fate = metadata[metadata.length-1].toLowerCase()
            .replace('killed', 'K')
            .replace('lynched', 'L')
            .replace('night', 'n')
            .replace('day', 'd')
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

            // filter out unvotes
            !isUnvote && processed.push({
                id: slot.id, voter, votee, duration
            })

            // include the last vote (duration cannot be calculated)
            if(j === votes.length - 1) {
                processed.push({
                    id: slot.id,
                    voter: votes[j].author,
                    votee: votes[j].content.split(": ")[1],
                    duration: null
                })
            }
        }
    });

    let data = JSON.stringify(processed)
    fs.writeFileSync('./data/processed.json', data)
    return processed;
}

function toEdgeList() {
    let RawVotes = JSON.parse(fc);
    let slots = parseSlots(playerInfo)
    let votes = preprocess(slots, RawVotes)

    // nodes
    let nodes_town = slots.filter(x => x.isTown).map(x => x.id)
    let nodes_mafia = slots.filter(x => !x.isTown).map(x => x.id)
    console.log(nodes_town, nodes_mafia)

    // generates an edge list from vote data
    // voter id, votee id, weight
    let edges = []
    votes.forEach(vote => {
        let playerId = intendedTarget(vote.votee, slots)
        edges.push([vote.id, playerId, vote.duration / 3600000])
    })

    let data = JSON.stringify(edges)
    fs.writeFileSync('./data/edges.json', data)
}

function intendedTarget(votee, slots) {
    votee = votee.toLowerCase()
    let playerId = null;
    slots.forEach(slot => {
        slot.alias.forEach(name => {
            if (levenshtein(votee, name.toLowerCase()) <= 3) {
                playerId = slot.id;
            }
        })

        // if no match, check for full substring matches
        // or substring edit distance <= 2
        slot.alias.forEach(name => {
            if (name.toLowerCase().includes(votee)) {
                playerId = slot.id;
            }
        })
    })

    return playerId;
}


toEdgeList()
// parseSlots(playerInfo)