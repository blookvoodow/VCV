var fs = require('fs');

let edges = JSON.parse(fs.readFileSync('./data/edges.json'))
let filename = 'edges.edgelist';
edges.forEach(edge => {
    if(!edge.includes(null)) {
        let text = edge.join(' ') + '\n'
        fs.appendFile(filename, text, 'utf-8', () => {})
    }
});