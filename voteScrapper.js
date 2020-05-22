var cheerio = require("cheerio");
var requestp = require('request-promise');
var fs = require('fs');

let rp = requestp.defaults({
    baseUrl: 'https://forum.mafiascum.net',
    timeout: 3000,
    resolveWithFullResponse: true,
    jar: true
});

let thread = ""
let players = []

function parseGameInfo() {
    fs.readFile('./data/game.txt', 'utf-8', (err, data) => {
        lines = data.split('\n')
        thread = lines[0]
        players = lines.slice(lines.indexOf('Player List:')+1)
        console.log(players)
    })
}

async function getNumberOfPosts(_url) {
    let response = await rp.get(_url);
    let count = 0
    let $ = cheerio.load(response.body)
    let pagination = $('.pagination').first().text()
    let pattern = pagination.match('[0-9]+ posts')
    if(!pattern) throw Error('Failed to get post count.')
    count = pagination.slice(pattern.index, pattern.index + pattern[0].length - 6)
    return parseInt(count)
}

async function scrapVotes(_url) {
    let pages = [];
    let posts = await getNumberOfPosts(_url)

    for(var i = 0; i < posts; i+=200) {
        pages.push(_url + "&view=print&ppp=200&start=" + i)
    }

    // let result = await rp.get(pages[0])
    let result = await Promise.all(pages.map(page => rp.get(page)))
    return result.map(res => {
        let $ = cheerio.load(res.body)
        // remove quotes and spoilers
        $('blockquote').remove();
        $('.quotecontent').remove();
        let data = $('.post').map(function() {
            return {
                author: $('.author strong', $(this)).text(),
                date: $('.date strong', $(this)).text(),
                content: $('.content span[class=bbvote]', $(this)).html()
            }
        }).get();
        
        // filter by votes only
        data = data.filter(x => x.content !== null);
        return data;
    }).flatMap(x => x);
}

async function test() {
    let posts = await scrapVotes(thread)
    let data = JSON.stringify(posts)
    fs.writeFileSync('./data/posts.json', data)
}

// test()
parseGameInfo()
