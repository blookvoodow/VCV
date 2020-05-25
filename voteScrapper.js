var cheerio = require("cheerio");
var requestp = require('request-promise');
var fs = require('fs');

const baseUrl = 'https://forum.mafiascum.net';

let rp = requestp.defaults({
    baseUrl,
    timeout: 5000,
    resolveWithFullResponse: true,
    jar: true
});

function parseGameInfo() {
    let data = fs.readFileSync('./data/game.txt', 'utf-8')
    lines = data.split(/\r?\n|\r/)
    thread = lines[0]
    if (thread.indexOf(baseUrl) >= 0) {
        thread = thread.slice(baseUrl.length)
    }
    players = lines.slice(lines.indexOf('Player List:')+1)

    return {
        thread,
        players
    }
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

    // let result = await Promise.all([rp.get(pages[0])])
    let result = await Promise.all(pages.map(page => rp.get(page)))
        .catch(e => console.error(e))

    return result.map((res, idx) => {
        let $ = cheerio.load(res.body)
        // remove quotes and spoilers
        $('blockquote').remove();
        $('.quotecontent').remove();
        let data = $('.post').map(function(id) {
            return {
                author: $('.author strong', $(this)).text(),
                date: $('.date strong', $(this)).text(),
                content: $('.content span[class=bbvote]', $(this)).html(),
                post: id + idx * 200
            }
        }).get();
        
        // filter by votes only
        data = data.filter(x => x.content !== null);
        return data;
    }).flatMap(x => x);
}

module.exports = {
    parseGameInfo,
    scrapVotes
}